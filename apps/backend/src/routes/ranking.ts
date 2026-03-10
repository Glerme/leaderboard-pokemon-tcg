import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { matchPointsFromRecord } from '../lib/scoring.js'

export const rankingRouter = Router()

rankingRouter.get('/monthly', async (req, res) => {
  const year = parseInt(req.query.year as string, 10)
  const month = parseInt(req.query.month as string, 10)
  const y = Number.isFinite(year) ? year : new Date().getFullYear()
  const m = Number.isFinite(month) ? month : new Date().getMonth() + 1
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59, 999)

  const scores = await prisma.score.findMany({
    where: {
      championship: {
        date: { gte: start, lte: end },
      },
    },
    include: { player: true, championship: true },
  })

  const byPlayer = new Map<
    string,
    { playerId: string; playerName: string; totalMatchPoints: number; championships: number }
  >()
  for (const s of scores) {
    const mp = matchPointsFromRecord(s.wins, s.draws, s.losses)
    const existing = byPlayer.get(s.playerId)
    if (existing) {
      existing.totalMatchPoints += mp
      existing.championships += 1
    } else {
      byPlayer.set(s.playerId, {
        playerId: s.playerId,
        playerName: s.player.name,
        totalMatchPoints: mp,
        championships: 1,
      })
    }
  }

  const ranking = Array.from(byPlayer.values()).sort((a, b) => {
    if (b.totalMatchPoints !== a.totalMatchPoints) return b.totalMatchPoints - a.totalMatchPoints
    // desempate: mais campeonatos jogados no mês → melhor colocação
    if (b.championships !== a.championships) return b.championships - a.championships
    // desempate final: ordem alfabética determinística
    return a.playerName.localeCompare(b.playerName)
  })
  res.json({ year: y, month: m, ranking })
})
