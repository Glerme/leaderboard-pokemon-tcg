import { apiPut, apiPost, apiDelete } from '@/lib/api'

export interface ScoreWithPlayer {
  id: string
  championshipId: string
  playerId: string
  wins: number
  draws: number
  losses: number
  player: { id: string; name: string }
}

export function updateScore(championshipId: string, playerId: string, wins: number, draws: number, losses: number) {
  return apiPut<ScoreWithPlayer>(`/scores/${championshipId}/${playerId}`, { wins, draws, losses })
}

export function addPlayerToChampionship(championshipId: string, playerId: string, byeLosses = 0) {
  return apiPost<ScoreWithPlayer>(`/scores/${championshipId}/players/${playerId}`, { byeLosses })
}

export function removePlayerFromChampionship(championshipId: string, playerId: string) {
  return apiDelete(`/scores/${championshipId}/${playerId}`)
}
