import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

export interface Championship {
  id: string
  name: string
  date: string
  status: string
  _count?: { scores: number }
}

export interface StandingEntry {
  playerId: string
  playerName: string
  wins: number
  draws: number
  losses: number
  matchPoints: number
  gamesPlayed?: number
  opw?: number
  oppw?: number
}

export interface Match {
  id: string
  roundId: string
  player1Id: string
  player2Id: string
  result: string | null
  player1: { id: string; name: string }
  player2: { id: string; name: string }
}

export interface Round {
  id: string
  championshipId: string
  roundNumber: number
  createdAt: string
  matches: Match[]
  bye: { playerId: string; player: { id: string; name: string } } | null
}

export interface ChampionshipDetail extends Championship {
  standings: StandingEntry[]
  rounds?: Round[]
}

export function fetchChampionships() {
  return apiGet<Championship[]>('/championships')
}

export function fetchChampionship(id: string) {
  return apiGet<ChampionshipDetail>(`/championships/${id}`)
}

export function createChampionship(data: { name: string; date: string }) {
  return apiPost<Championship>('/championships', data)
}

export function updateChampionship(id: string, data: { name?: string; date?: string; status?: string }) {
  return apiPatch<Championship>(`/championships/${id}`, data)
}

export function deleteChampionship(id: string) {
  return apiDelete(`/championships/${id}`)
}

export function fetchStandings(championshipId: string) {
  return apiGet<{ standings: StandingEntry[] }>(`/championships/${championshipId}/standings`)
}

export interface RoundsInfo {
  playerCount: number
  maxRounds: number
  currentRoundCount: number
}

export function fetchRounds(championshipId: string) {
  return apiGet<{ rounds: Round[] }>(`/championships/${championshipId}/rounds`)
}

export function fetchRoundsInfo(championshipId: string) {
  return apiGet<RoundsInfo>(`/championships/${championshipId}/rounds-info`)
}

export function createRound(championshipId: string) {
  return apiPost<Round>(`/championships/${championshipId}/rounds`, {})
}

export function createPairings(championshipId: string, roundNumber: number) {
  return apiPost<{ round: Round; matches: Match[] }>(
    `/championships/${championshipId}/rounds/${roundNumber}/pairings`,
    {}
  )
}

export function setMatchResult(championshipId: string, matchId: string, result: 'player1' | 'player2' | 'draw') {
  return apiPatch<Match>(`/championships/${championshipId}/matches/${matchId}`, { result })
}
