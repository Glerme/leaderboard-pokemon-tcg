import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { fetchMonthlyRanking } from '@/features/leaderboard/api'

const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
]

interface Championship {
  id: string
  name: string
  date: string
  status: string
  _count?: { scores: number }
}

export function AdminDashboard() {
  const now = new Date()
  const [year, month] = [now.getFullYear(), now.getMonth() + 1]

  const { data: championships } = useQuery({
    queryKey: ['championships'],
    queryFn: () => apiGet<Championship[]>('/championships'),
  })

  const { data: ranking } = useQuery({
    queryKey: ['ranking', 'monthly', year, month],
    queryFn: () => fetchMonthlyRanking(year, month),
    refetchInterval: 60_000,
  })

  const open = championships?.filter((c) => c.status === 'open').length ?? 0
  const closed = championships?.filter((c) => c.status === 'closed').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pixel text-pokemon-yellow text-sm tracking-widest">
          ⚙ DASHBOARD
        </h1>
        <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
          PAINEL DE CONTROLE
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="pixel-box">
          <div className="border-b-2 border-pokemon-yellow px-4 py-3">
            <span className="font-pixel text-[10px] text-pokemon-yellow">
              CAMPEONATOS ABERTOS
            </span>
          </div>
          <div className="p-4">
            <p className="font-pixel text-3xl text-pokemon-green mb-3">
              {open}
            </p>
            <Link to="/admin/championships">
              <span className="font-pixel text-[9px] text-pokemon-blue hover:text-pokemon-yellow transition-colors">
                ► GERENCIAR
              </span>
            </Link>
          </div>
        </div>

        <div className="pixel-box">
          <div className="border-b-2 border-pokemon-yellow px-4 py-3">
            <span className="font-pixel text-[10px] text-pokemon-yellow">
              CAMPEONATOS ENCERRADOS
            </span>
          </div>
          <div className="p-4">
            <p className="font-pixel text-3xl text-pokemon-gray-light mb-3">
              {closed}
            </p>
          </div>
        </div>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-pixel text-[10px] text-pokemon-yellow">
              ★ RANKING MENSAL
            </span>
            <span className="font-pixel text-[9px] text-pokemon-gray-light ml-3">
              {MONTHS[month - 1]} / {year}
            </span>
          </div>
          <span className="font-pixel text-[9px] text-pokemon-green animate-blink-slow">
            ● LIVE
          </span>
        </div>
        <div className="p-4 overflow-x-auto">
          {!ranking || ranking.ranking.length === 0 ? (
            <p className="font-pixel text-[9px] text-pokemon-gray-light py-4 text-center">
              NENHUM RESULTADO NESTE MÊS
            </p>
          ) : (
            <table className="pixel-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>JOGADOR</th>
                  <th className="text-right">PONTOS</th>
                  <th className="text-right">CAMPEONATOS</th>
                </tr>
              </thead>
              <tbody>
                {ranking.ranking.map((row, i) => (
                  <tr key={row.playerId} className={i < 3 ? 'border-l-2 border-l-pokemon-yellow' : ''}>
                    <td>
                      <span className={`font-pixel text-[10px] ${
                        i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : 'text-pokemon-gray-light'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <span className={`font-pixel text-[10px] ${i === 0 ? 'text-pokemon-yellow' : 'text-pokemon-light'}`}>
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
          )}
        </div>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            AÇÕES RÁPIDAS
          </span>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <Link to="/admin/championships">
            <Button>
              ► NOVO CAMPEONATO
            </Button>
          </Link>
          <Link to="/admin/players">
            <Button variant="outline">
              ► GERENCIAR JOGADORES
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
