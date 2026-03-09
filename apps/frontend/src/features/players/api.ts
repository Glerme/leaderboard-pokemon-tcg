import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

export interface Player {
  id: string
  name: string
}

export function fetchPlayers() {
  return apiGet<Player[]>('/players')
}

export function createPlayer(name: string) {
  return apiPost<Player>('/players', { name })
}

export function updatePlayer(id: string, name: string) {
  return apiPatch<Player>(`/players/${id}`, { name })
}

export function deletePlayer(id: string) {
  return apiDelete(`/players/${id}`)
}
