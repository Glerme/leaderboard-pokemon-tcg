import { prisma } from './prisma.js'
import { matchPointsFromRecord, winPercentage } from './scoring.js'

export interface StandingRow {
  playerId: string
  playerName: string
  wins: number
  draws: number
  losses: number
  matchPoints: number
  gamesPlayed: number
  opw: number
  oppw: number
}

/**
 * Computa a classificação do campeonato a partir das partidas (Match),
 * incluindo OPW e OPPW conforme Play! Pokémon Tournament Rules Handbook.
 */
export async function computeStandings(championshipId: string): Promise<StandingRow[]> {
  const scores = await prisma.score.findMany({
    where: { championshipId },
    include: { player: true },
  })
  const scoreByPlayer = new Map(scores.map((s) => [s.playerId, s]))
  const playerIds = new Set(scores.map((s) => s.playerId))

  const matches = await prisma.match.findMany({
    where: { round: { championshipId } },
    include: { player1: true, player2: true },
  })
  for (const m of matches) {
    playerIds.add(m.player1Id)
    playerIds.add(m.player2Id)
  }

  // Byes: vitória automática, NÃO conta como oponente para OPW/OPPW
  const byeRecords = await prisma.bye.findMany({
    where: { round: { championshipId } },
    select: { playerId: true },
  })
  const byeCountByPlayer = new Map<string, number>()
  for (const b of byeRecords) {
    byeCountByPlayer.set(b.playerId, (byeCountByPlayer.get(b.playerId) ?? 0) + 1)
  }

  const missingIds = [...playerIds].filter((id) => !scoreByPlayer.has(id))
  const missingPlayers = missingIds.length
    ? await prisma.player.findMany({ where: { id: { in: missingIds } } })
    : []
  const nameByPlayer = new Map(scores.map((s) => [s.playerId, s.player.name]))
  for (const p of missingPlayers) nameByPlayer.set(p.id, p.name)

  // matchWins/draws/losses: apenas partidas reais (para gamesPlayed e OPW)
  const matchWins = new Map<string, number>()
  const draws = new Map<string, number>()
  const losses = new Map<string, number>()
  const opponents = new Map<string, Set<string>>()

  for (const pid of playerIds) {
    matchWins.set(pid, 0)
    draws.set(pid, 0)
    losses.set(pid, scoreByPlayer.get(pid)?.byeLosses ?? 0)
    opponents.set(pid, new Set())
  }

  for (const m of matches) {
    if (!m.result) continue
    opponents.get(m.player1Id)!.add(m.player2Id)
    opponents.get(m.player2Id)!.add(m.player1Id)
    if (m.result === 'player1') {
      matchWins.set(m.player1Id, (matchWins.get(m.player1Id) ?? 0) + 1)
      losses.set(m.player2Id, (losses.get(m.player2Id) ?? 0) + 1)
    } else if (m.result === 'player2') {
      matchWins.set(m.player2Id, (matchWins.get(m.player2Id) ?? 0) + 1)
      losses.set(m.player1Id, (losses.get(m.player1Id) ?? 0) + 1)
    } else {
      draws.set(m.player1Id, (draws.get(m.player1Id) ?? 0) + 1)
      draws.set(m.player2Id, (draws.get(m.player2Id) ?? 0) + 1)
    }
  }

  const rows: StandingRow[] = []
  for (const pid of playerIds) {
    const mw = matchWins.get(pid) ?? 0
    const bw = byeCountByPlayer.get(pid) ?? 0
    const d = draws.get(pid) ?? 0
    const l = losses.get(pid) ?? 0
    const totalWins = mw + bw
    // gamesPlayed exclui byes (conforme handbook: bye não é oponente real)
    const gamesPlayed = mw + d + l
    const mp = matchPointsFromRecord(totalWins, d, l)
    const playerName = nameByPlayer.get(pid) ?? ''
    rows.push({
      playerId: pid,
      playerName,
      wins: totalWins,
      draws: d,
      losses: l,
      matchPoints: mp,
      gamesPlayed,
      opw: 0,
      oppw: 0,
    })
  }

  const mpByPlayer = new Map(rows.map((r) => [r.playerId, r.matchPoints]))
  const gpByPlayer = new Map(rows.map((r) => [r.playerId, r.gamesPlayed]))
  const rowByPlayer = new Map(rows.map((r) => [r.playerId, r]))

  for (const row of rows) {
    const oppIds = Array.from(opponents.get(row.playerId) ?? [])
    if (oppIds.length === 0) continue
    const oppWinPcts = oppIds.map((oppId) => {
      const oppMp = mpByPlayer.get(oppId) ?? 0
      const oppGp = gpByPlayer.get(oppId) ?? 0
      return winPercentage(oppMp, oppGp)
    })
    row.opw = oppWinPcts.reduce((a, b) => a + b, 0) / oppWinPcts.length
  }

  for (const row of rows) {
    const oppIds = Array.from(opponents.get(row.playerId) ?? [])
    if (oppIds.length === 0) continue
    const oppOpws = oppIds.map((oppId) => rowByPlayer.get(oppId)!.opw)
    row.oppw = oppOpws.reduce((a, b) => a + b, 0) / oppOpws.length
  }

  rows.sort((a, b) => {
    if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints
    if (Math.abs(b.opw - a.opw) > 1e-6) return b.opw - a.opw
    return b.oppw - a.oppw
  })

  return rows
}

/** Atualiza a tabela Score (W-D-L) a partir das partidas, para os jogadores envolvidos. */
export async function syncScoresFromMatches(
  championshipId: string,
  playerIds: string[]
): Promise<void> {
  const matches = await prisma.match.findMany({
    where: { round: { championshipId } },
  })
  const wins = new Map<string, number>()
  const draws = new Map<string, number>()
  const losses = new Map<string, number>()
  for (const pid of playerIds) {
    wins.set(pid, 0)
    draws.set(pid, 0)
    losses.set(pid, 0)
  }
  for (const m of matches) {
    if (!m.result) continue
    if (m.result === 'player1') {
      wins.set(m.player1Id, (wins.get(m.player1Id) ?? 0) + 1)
      losses.set(m.player2Id, (losses.get(m.player2Id) ?? 0) + 1)
    } else if (m.result === 'player2') {
      wins.set(m.player2Id, (wins.get(m.player2Id) ?? 0) + 1)
      losses.set(m.player1Id, (losses.get(m.player1Id) ?? 0) + 1)
    } else {
      draws.set(m.player1Id, (draws.get(m.player1Id) ?? 0) + 1)
      draws.set(m.player2Id, (draws.get(m.player2Id) ?? 0) + 1)
    }
  }
  for (const pid of playerIds) {
    await prisma.score.upsert({
      where: { championshipId_playerId: { championshipId, playerId: pid } },
      create: {
        championshipId,
        playerId: pid,
        wins: wins.get(pid) ?? 0,
        draws: draws.get(pid) ?? 0,
        losses: losses.get(pid) ?? 0,
      },
      update: {
        wins: wins.get(pid) ?? 0,
        draws: draws.get(pid) ?? 0,
        losses: losses.get(pid) ?? 0,
        // byeLosses is intentionally not updated here — it is set once on late arrival and preserved
      },
    })
  }
}