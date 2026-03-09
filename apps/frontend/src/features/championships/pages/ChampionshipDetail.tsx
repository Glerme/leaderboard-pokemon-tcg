import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { fetchChampionship } from '../api'

export function ChampionshipDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['championships', id],
    queryFn: () => fetchChampionship(id!),
    enabled: !!id,
    refetchInterval: 60_000,
  })

  if (!id) return null

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="font-pixel text-[10px] text-pokemon-yellow animate-blink">
          CARREGANDO...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pixel-border-red bg-pokemon-darker p-4">
        <p className="font-pixel text-[10px] text-pokemon-red">
          ✗ {error instanceof Error ? error.message : 'ERRO AO CARREGAR CAMPEONATO'}
        </p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/championships"
            className="font-pixel text-[9px] text-pokemon-gray-light hover:text-pokemon-yellow transition-colors"
          >
            ◄ CAMPEONATOS
          </Link>
          <h1 className="font-pixel text-pokemon-yellow text-sm tracking-wide mt-2 leading-relaxed">
            {data.name.toUpperCase()}
          </h1>
          <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
            {new Date(data.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <span className={[
          'font-pixel text-[9px] px-3 py-2 border-2',
          data.status === 'open'
            ? 'bg-pokemon-green text-white border-pokemon-green-dark shadow-pixel'
            : 'bg-pokemon-gray text-pokemon-gray-light border-pokemon-gray-light',
        ].join(' ')}>
          {data.status === 'open' ? '♥ ABERTO' : '✗ ENCERRADO'}
        </span>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-xs text-pokemon-yellow">
            ★ CLASSIFICAÇÃO FINAL
          </span>
          <p className="font-pixel text-[8px] text-pokemon-gray-light mt-1">
            V=3pts, E=1pt, D=0pts · OPW / OPPW (PLAY! POKÉMON HANDBOOK)
          </p>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="pixel-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>JOGADOR</th>
                <th className="text-right">V</th>
                <th className="text-right">E</th>
                <th className="text-right">D</th>
                <th className="text-right">MP</th>
                {typeof data.standings[0]?.opw === 'number' && (
                  <>
                    <th className="text-right">OPW%</th>
                    <th className="text-right">OPPW%</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.standings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <span className="font-pixel text-[9px] text-pokemon-gray-light">
                      NENHUM JOGADOR COM RESULTADO
                    </span>
                  </td>
                </tr>
              )}
              {data.standings.map((row, i) => {
                const isTop = i < 3
                return (
                  <tr
                    key={row.playerId}
                    className={isTop ? 'border-l-2 border-l-pokemon-yellow' : ''}
                  >
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
                      <span className="font-pixel text-[10px] text-pokemon-green">{row.wins}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-pixel text-[10px] text-pokemon-yellow">{row.draws}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-pixel text-[10px] text-pokemon-red">{row.losses}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-pixel text-[10px] font-bold text-pokemon-light">{row.matchPoints}</span>
                    </td>
                    {typeof row.opw === 'number' && (
                      <>
                        <td className="text-right">
                          <span className="font-pixel text-[9px] text-pokemon-gray-light">
                            {(row.opw * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="font-pixel text-[9px] text-pokemon-gray-light">
                            {(row.oppw! * 100).toFixed(1)}%
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
