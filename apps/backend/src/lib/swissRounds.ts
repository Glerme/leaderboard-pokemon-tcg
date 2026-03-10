/**
 * Tabela oficial de rodadas suíças por número de jogadores.
 * Fonte: Play! Pokémon Tournament Rules Handbook – 3ª variante: Dia Único de Pokémon Estampas Ilustradas (apenas rodadas Suíças)
 * https://www.pokemon.com/static-assets/content-assets/cms2-pt-br/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-br.pdf
 */
const TCG_SWISS_ROUNDS_TABLE: { maxPlayers: number; rounds: number }[] = [
  { maxPlayers: 8,   rounds: 3 },
  { maxPlayers: 12,  rounds: 4 },
  { maxPlayers: 20,  rounds: 5 },
  { maxPlayers: 32,  rounds: 5 },
  { maxPlayers: 64,  rounds: 6 },
  { maxPlayers: 128, rounds: 7 },
  { maxPlayers: 226, rounds: 8 },
  { maxPlayers: 409, rounds: 9 },
  { maxPlayers: Infinity, rounds: 10 },
]

/**
 * Retorna o número máximo de rodadas suíças recomendadas para um dado número de jogadores,
 * conforme a tabela oficial do Play! Pokémon Tournament Rules Handbook (TCG Single Day).
 * Mínimo de 4 jogadores para realizar um torneio.
 */
export function getMaxSwissRounds(playerCount: number): number {
  for (const entry of TCG_SWISS_ROUNDS_TABLE) {
    if (playerCount <= entry.maxPlayers) {
      return entry.rounds
    }
  }
  return 10
}
