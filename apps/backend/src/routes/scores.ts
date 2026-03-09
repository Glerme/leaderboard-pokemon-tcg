import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const updateSchema = z.object({
  wins: z.number().int().min(0),
  draws: z.number().int().min(0),
  losses: z.number().int().min(0),
})

export const scoresRouter = Router()

scoresRouter.put('/:championshipId/:playerId', requireAuth, async (req, res) => {
  const { championshipId, playerId } = req.params
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'wins, draws e losses devem ser números inteiros >= 0' })
    return
  }
  const score = await prisma.score.upsert({
    where: {
      championshipId_playerId: { championshipId, playerId },
    },
    create: {
      championshipId,
      playerId,
      wins: parsed.data.wins,
      draws: parsed.data.draws,
      losses: parsed.data.losses,
    },
    update: {
      wins: parsed.data.wins,
      draws: parsed.data.draws,
      losses: parsed.data.losses,
    },
    include: { player: true },
  })
  res.json(score)
})

scoresRouter.post('/:championshipId/players/:playerId', requireAuth, async (req, res) => {
  const { championshipId, playerId } = req.params
  const byeLosses = typeof req.body?.byeLosses === 'number' && req.body.byeLosses >= 0
    ? Math.floor(req.body.byeLosses)
    : 0
  const championship = await prisma.championship.findUnique({ where: { id: championshipId } })
  const player = await prisma.player.findUnique({ where: { id: playerId } })
  if (!championship || !player) {
    res.status(404).json({ error: 'Campeonato ou jogador não encontrado' })
    return
  }
  const score = await prisma.score.create({
    data: { championshipId, playerId, wins: 0, draws: 0, losses: 0, byeLosses },
    include: { player: true },
  })
  res.status(201).json(score)
})

scoresRouter.delete('/:championshipId/:playerId', requireAuth, async (req, res) => {
  const { championshipId, playerId } = req.params
  await prisma.score.deleteMany({ where: { championshipId, playerId } })
  res.status(204).send()
})
