import { apiGet } from '@/lib/api'

export interface MonthlyRankingEntry {
  playerId: string
  playerName: string
  totalMatchPoints: number
  championships: number
}

export interface MonthlyRankingResponse {
  year: number
  month: number
  ranking: MonthlyRankingEntry[]
}

export function fetchMonthlyRanking(year?: number, month?: number) {
  const params = new URLSearchParams()
  if (year != null) params.set('year', String(year))
  if (month != null) params.set('month', String(month))
  const q = params.toString()
  return apiGet<MonthlyRankingResponse>(`/ranking/monthly${q ? `?${q}` : ''}`)
}
