import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchChampionships } from '../api'

export function ChampionshipList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['championships'],
    queryFn: fetchChampionships,
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pixel text-pokemon-yellow text-sm tracking-widest">
          ⚔ CAMPEONATOS
        </h1>
        <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
          SELECIONE PARA VER RESULTADOS
        </p>
      </div>

      {isLoading && (
        <div className="pixel-box py-8 text-center">
          <p className="font-pixel text-[10px] text-pokemon-yellow animate-blink">
            CARREGANDO...
          </p>
        </div>
      )}

      {error && (
        <div className="pixel-border-red bg-pokemon-darker p-4">
          <p className="font-pixel text-[10px] text-pokemon-red">
            ✗ {error instanceof Error ? error.message : 'ERRO AO CARREGAR CAMPEONATOS'}
          </p>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="pixel-box py-8 text-center">
          <p className="font-pixel text-[10px] text-pokemon-gray-light">
            NENHUM CAMPEONATO CADASTRADO
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((c) => (
          <Link key={c.id} to={`/championships/${c.id}`} className="block group">
            <div className={[
              'bg-pokemon-darker border-2 transition-all duration-75 p-4',
              c.status === 'open'
                ? 'border-pokemon-green shadow-pixel hover:shadow-pixel-yellow hover:border-pokemon-yellow'
                : 'border-pokemon-gray-light shadow-pixel hover:shadow-none',
            ].join(' ')}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="font-pixel text-[11px] text-pokemon-light group-hover:text-pokemon-yellow transition-colors leading-relaxed">
                  {c.name}
                </h2>
                <span className={[
                  'font-pixel text-[8px] px-2 py-1 border-2 flex-shrink-0 whitespace-nowrap',
                  c.status === 'open'
                    ? 'bg-pokemon-green text-white border-pokemon-green-dark'
                    : 'bg-pokemon-gray text-pokemon-gray-light border-pokemon-gray-light',
                ].join(' ')}>
                  {c.status === 'open' ? '♥ ABERTO' : '✗ ENCERRADO'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-pixel text-[9px] text-pokemon-gray-light">
                  {new Date(c.date).toLocaleDateString('pt-BR')}
                </p>
                {c._count != null && (
                  <p className="font-pixel text-[9px] text-pokemon-blue">
                    {c._count.scores} JOGADORES
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 text-pokemon-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-pixel text-[9px]">► VER RESULTADOS</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
