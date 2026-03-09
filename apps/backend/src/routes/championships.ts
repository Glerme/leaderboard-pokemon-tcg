import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { matchPointsFromRecord } from '../lib/scoring.js'
import { computeStandings } from '../lib/standings.js'
import { generateSwissPairings } from '../lib/pairings.js'
import { syncScoresFromMatches } from '../lib/standings.js'
import { getMaxSwissRounds } from '../lib/swissRounds.js'

const createSchema = z.object({ name: z.string().min(1), date: z.string().datetime() })

export const championshipsRouter = Router()

championshipsRouter.get('/', async (_req, res) => {
  const list = await prisma.championship.findMany({
    orderBy: { date: 'desc' },
    include: { _count: { select: { scores: true } } },
  })
  res.json(list)
})

championshipsRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const c = await prisma.championship.findUnique({
    where: { id },
    include: {
      scores: { include: { player: true } },
      rounds: { include: { matches: { include: { player1: true, player2: true } } }, orderBy: { roundNumber: 'asc' } },
    },
  })
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  const standings = await computeStandings(id)
  res.json({ ...c, standings, rounds: c.rounds })
})

championshipsRouter.get('/:id/standings', async (req, res) => {
  const id = req.params.id
  const c = await prisma.championship.findUnique({ where: { id } })
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  const standings = await computeStandings(id)
  res.json({ standings })
})

championshipsRouter.get('/:id/rounds-info', async (req, res) => {
  const id = req.params.id
  const c = await prisma.championship.findUnique({
    where: { id },
    include: { _count: { select: { scores: true } } },
  })
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  const playerCount = c._count.scores
  const maxRounds = getMaxSwissRounds(playerCount)
  const currentRoundCount = await prisma.round.count({ where: { championshipId: id } })
  res.json({ playerCount, maxRounds, currentRoundCount })
})

championshipsRouter.get('/:id/rounds', async (req, res) => {
  const id = req.params.id
  const rounds = await prisma.round.findMany({
    where: { championshipId: id },
    include: {
      matches: { include: { player1: true, player2: true } },
      bye: { include: { player: true } },
    },
    orderBy: { roundNumber: 'asc' },
  })
  res.json({ rounds })
})

championshipsRouter.post('/:id/rounds', requireAuth, async (req, res) => {
  const id = req.params.id
  const c = await prisma.championship.findUnique({ where: { id } })
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  const max = await prisma.round.findFirst({
    where: { championshipId: id },
    orderBy: { roundNumber: 'desc' },
    select: { roundNumber: true },
  })
  const roundNumber = (max?.roundNumber ?? 0) + 1
  const round = await prisma.round.create({
    data: { championshipId: id, roundNumber },
    include: { matches: true },
  })
  res.status(201).json(round)
})

championshipsRouter.post('/:id/rounds/:roundNumber/pairings', requireAuth, async (req, res) => {
  const id = req.params.id
  const roundNum = parseInt(req.params.roundNumber, 10)
  if (!Number.isFinite(roundNum) || roundNum < 1) {
    res.status(400).json({ error: 'Número da rodada inválido' })
    return
  }
  const c = await prisma.championship.findUnique({ where: { id } })
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  const playerCount = await prisma.score.count({ where: { championshipId: id } })
  const maxRounds = getMaxSwissRounds(playerCount)
  if (roundNum > maxRounds) {
    res.status(400).json({
      error: `Número máximo de rodadas suíças atingido para ${playerCount} jogadores (máx. ${maxRounds} rodadas conforme o Play! Pokémon Tournament Rules Handbook).`,
    })
    return
  }

  let round = await prisma.round.findUnique({
    where: { championshipId_roundNumber: { championshipId: id, roundNumber: roundNum } },
    include: { matches: true },
  })
  if (!round) {
    round = await prisma.round.create({
      data: { championshipId: id, roundNumber: roundNum },
      include: { matches: true },
    })
  }
  if (round.matches.length > 0) {
    res.status(400).json({ error: 'Rodada já possui partidas. Exclua-as antes de gerar novamente.' })
    return
  }
  const { pairings, byePlayerId } = await generateSwissPairings(id)
  await prisma.match.createMany({
    data: pairings.map((p) => ({
      roundId: round!.id,
      player1Id: p.player1Id,
      player2Id: p.player2Id,
    })),
  })
  if (byePlayerId) {
    await prisma.bye.create({ data: { roundId: round!.id, playerId: byePlayerId } })
  }
  const created = await prisma.match.findMany({
    where: { roundId: round!.id },
    include: { player1: true, player2: true },
  })
  const bye = byePlayerId
    ? await prisma.bye.findUnique({ where: { roundId: round!.id }, include: { player: true } })
    : null
  res.status(201).json({ round, matches: created, bye })
})

championshipsRouter.patch('/:id/matches/:matchId', requireAuth, async (req, res) => {
  const { id: championshipId, matchId } = req.params
  const body = req.body as { result?: string }
  const result = body.result === 'draw' ? 'draw' : body.result === 'player1' ? 'player1' : body.result === 'player2' ? 'player2' : null
  if (result === null) {
    res.status(400).json({ error: 'result deve ser "player1", "player2" ou "draw"' })
    return
  }
  const match = await prisma.match.findFirst({
    where: { id: matchId, round: { championshipId } },
    include: { round: true },
  })
  if (!match) {
    res.status(404).json({ error: 'Partida não encontrada' })
    return
  }
  await prisma.match.update({ where: { id: matchId }, data: { result } })
  await syncScoresFromMatches(championshipId, [match.player1Id, match.player2Id])
  const updated = await prisma.match.findUnique({
    where: { id: matchId },
    include: { player1: true, player2: true },
  })
  res.json(updated)
})

championshipsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Nome e data obrigatórios' })
    return
  }
  const championship = await prisma.championship.create({
    data: { name: parsed.data.name, date: new Date(parsed.data.date) },
  })
  res.status(201).json(championship)
})

championshipsRouter.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  const body = req.body as { name?: string; date?: string; status?: string }
  const data: { name?: string; date?: Date; status?: string } = {}
  if (typeof body.name === 'string' && body.name.length > 0) data.name = body.name
  if (typeof body.date === 'string') data.date = new Date(body.date)
  if (typeof body.status === 'string' && ['open', 'closed'].includes(body.status)) data.status = body.status
  const c = await prisma.championship.update({ where: { id }, data }).catch(() => null)
  if (!c) {
    res.status(404).json({ error: 'Campeonato não encontrado' })
    return
  }
  res.json(c)
})

championshipsRouter.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  await prisma.championship.delete({ where: { id } }).catch(() => null)
  res.status(204).send()
})
