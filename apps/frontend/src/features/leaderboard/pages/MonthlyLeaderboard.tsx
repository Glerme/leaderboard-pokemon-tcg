import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { fetchMonthlyRanking } from '../api'

const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
]

function getRankClass(index: number) {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'text-pokemon-light'
}

function getRankIcon(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return String(index + 1)
}

export function MonthlyLeaderboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()
  const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()), 10)
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10)

  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking', 'monthly', year, month],
    queryFn: () => fetchMonthlyRanking(year, month),
    refetchInterval: 60_000,
  })

  const setMonthYear = (y: number, m: number) => {
    setSearchParams({ year: String(y), month: String(m) })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-pokemon-yellow text-sm tracking-widest">
            ★ HIGH SCORES ★
          </h1>
          <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
            RANKING MENSAL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonthYear(year, parseInt(e.target.value, 10))}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setMonthYear(parseInt(e.target.value, 10), month)}
          >
            {[year - 2, year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3 flex items-center justify-between">
          <span className="font-pixel text-xs text-pokemon-yellow">
            {MONTHS[month - 1]} / {year}
          </span>
          <span className="font-pixel text-[9px] text-pokemon-green animate-blink-slow">
            ● LIVE
          </span>
        </div>

        <div className="p-4">
          {isLoading && (
            <div className="py-8 text-center">
              <p className="font-pixel text-[10px] text-pokemon-yellow animate-blink">
                CARREGANDO...
              </p>
            </div>
          )}
          {error && (
            <p className="font-pixel text-[10px] text-pokemon-red py-4">
              ✗ {error instanceof Error ? error.message : 'ERRO AO CARREGAR RANKING'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto">
              <table className="pixel-table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>JOGADOR</th>
                    <th className="text-right">PONTOS</th>
                    <th className="text-right">CAMPEONATOS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ranking.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <span className="font-pixel text-[9px] text-pokemon-gray-light">
                          NENHUM RESULTADO NESTE MÊS
                        </span>
                      </td>
                    </tr>
                  )}
                  {data.ranking.map((row, i) => (
                    <tr
                      key={row.playerId}
                      className={i < 3 ? 'border-l-2 border-l-pokemon-yellow' : ''}
                    >
                      <td>
                        <span className={`font-pixel text-[10px] ${getRankClass(i)}`}>
                          {getRankIcon(i)}
                        </span>
                      </td>
                      <td>
                        <span className={`font-pixel text-[10px] ${i === 0 ? 'text-pokemon-yellow' : 'text-pokemon-light'}`}>
                          {i === 0 && <span className="animate-bounce-pixel inline-block mr-1">★</span>}
                          {row.playerName}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-pixel text-[10px] text-pokemon-green">
                          {row.totalMatchPoints}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-pixel text-[10px] text-pokemon-gray-light">
                          {row.championships}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
