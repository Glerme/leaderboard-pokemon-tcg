/**
 * Match points e tiebreakers conforme Play! Pokémon Tournament Rules Handbook (PT-BR).
 * Fonte: https://www.pokemon.com/static-assets/content-assets/cms2-pt-br/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-br.pdf
 */
export const MATCH_POINTS = {
  WIN: 3,
  TIE: 1,
  LOSS: 0,
} as const

export function matchPointsFromRecord(wins: number, draws: number, losses: number): number {
  return wins * MATCH_POINTS.WIN + draws * MATCH_POINTS.TIE + losses * MATCH_POINTS.LOSS
}

/** Win % = match points / (3 * games played). Máximo 1.0. */
export function winPercentage(matchPoints: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0
  const maxPoints = gamesPlayed * MATCH_POINTS.WIN
  return Math.min(1, matchPoints / maxPoints)
}
