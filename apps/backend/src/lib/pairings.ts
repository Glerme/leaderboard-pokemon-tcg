import { prisma } from './prisma.js'
import { computeStandings } from './standings.js'

function pairKey(p1: string, p2: string): string {
  return [p1, p2].sort().join(':')
}

export interface PairingsResult {
  pairings: { player1Id: string; player2Id: string }[]
  byePlayerId: string | null
}

/**
 * Pareamentos suíços com suporte a número ímpar de jogadores (bye).
 *
 * Regras conforme Play! Pokémon Tournament Rules Handbook:
 * - Número ímpar → jogador de menor classificação que ainda não teve bye recebe o bye
 * - Se todos já tiveram bye, o de menor classificação recebe novamente
 * - Bye conta como vitória (3 pts), mas NÃO conta como oponente para OPW/OPPW
 */
export async function generateSwissPairings(championshipId: string): Promise<PairingsResult> {
  const standings = await computeStandings(championshipId)

  // Jogadores que já receberam bye neste campeonato
  const existingByes = await prisma.bye.findMany({
    where: { round: { championshipId } },
    select: { playerId: true },
  })
  const playersWithBye = new Set(existingByes.map((b) => b.playerId))

  // standings está ordenado do maior para o menor (index 0 = líder)
  let ids = standings.map((s) => s.playerId)

  let byePlayerId: string | null = null

  if (ids.length % 2 === 1) {
    // Seleciona o jogador de menor classificação sem bye; se todos já tiveram, pega o último
    let byeIdx = -1
    for (let i = ids.length - 1; i >= 0; i--) {
      if (!playersWithBye.has(ids[i])) {
        byeIdx = i
        break
      }
    }
    if (byeIdx === -1) byeIdx = ids.length - 1

    byePlayerId = ids[byeIdx]
    ids = ids.filter((id) => id !== byePlayerId)
  }

  const existingMatches = await prisma.match.findMany({
    where: { round: { championshipId } },
    select: { player1Id: true, player2Id: true },
  })
  const playedPairs = new Set(existingMatches.map((m) => pairKey(m.player1Id, m.player2Id)))

  const used = new Set<string>()
  const pairings: { player1Id: string; player2Id: string }[] = []

  for (let i = 0; i < ids.length; i++) {
    const p1 = ids[i]
    if (used.has(p1)) continue
    let found = false
    for (let j = i + 1; j < ids.length; j++) {
      const p2 = ids[j]
      if (used.has(p2)) continue
      if (!playedPairs.has(pairKey(p1, p2))) {
        pairings.push({ player1Id: p1, player2Id: p2 })
        used.add(p1)
        used.add(p2)
        playedPairs.add(pairKey(p1, p2))
        found = true
        break
      }
    }
    if (!found) {
      for (let j = i + 1; j < ids.length; j++) {
        const p2 = ids[j]
        if (used.has(p2)) continue
        pairings.push({ player1Id: p1, player2Id: p2 })
        used.add(p1)
        used.add(p2)
        break
      }
    }
  }

  return { pairings, byePlayerId }
}
