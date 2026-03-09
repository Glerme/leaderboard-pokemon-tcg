import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchChampionships, createChampionship, deleteChampionship } from '../api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminChampionships() {
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const queryClient = useQueryClient()

  const { data: championships, isLoading, error } = useQuery({
    queryKey: ['championships'],
    queryFn: fetchChampionships,
  })

  const createMutation = useMutation({
    mutationFn: () => createChampionship({ name, date: new Date(date).toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championships'] })
      setName('')
      setDate(new Date().toISOString().slice(0, 16))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChampionship,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['championships'] }),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pixel text-pokemon-yellow text-sm tracking-widest">
          ⚔ CAMPEONATOS
        </h1>
        <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
          GERENCIAR TORNEIOS
        </p>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            + NOVO CAMPEONATO
          </span>
        </div>
        <div className="p-4">
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <label htmlFor="champ-name" className="font-pixel text-[9px] text-pokemon-yellow mb-2 block">
                NOME
              </label>
              <Input
                id="champ-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: SEMANAL MARÇO #1"
              />
            </div>
            <div className="min-w-[180px]">
              <label htmlFor="champ-date" className="font-pixel text-[9px] text-pokemon-yellow mb-2 block">
                DATA
              </label>
              <Input
                id="champ-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? (
                <span className="animate-blink">CRIANDO...</span>
              ) : (
                '► CRIAR'
              )}
            </Button>
          </form>
          {createMutation.isError && (
            <p className="mt-2 font-pixel text-[9px] text-pokemon-red">
              ✗ {createMutation.error instanceof Error ? createMutation.error.message : 'ERRO'}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="pixel-box py-6 text-center">
          <p className="font-pixel text-[10px] text-pokemon-yellow animate-blink">CARREGANDO...</p>
        </div>
      )}
      {error && (
        <div className="border-2 border-pokemon-red bg-pokemon-darker p-4">
          <p className="font-pixel text-[10px] text-pokemon-red">
            ✗ {error instanceof Error ? error.message : 'ERRO AO CARREGAR'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {championships?.map((c) => (
          <div
            key={c.id}
            className={[
              'border-2 bg-pokemon-darker flex items-center justify-between py-3 px-4 flex-wrap gap-3',
              c.status === 'open'
                ? 'border-pokemon-green'
                : 'border-pokemon-gray-light',
            ].join(' ')}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={`/admin/championships/${c.id}`}
                className="font-pixel text-[10px] text-pokemon-light hover:text-pokemon-yellow transition-colors"
              >
                ► {c.name}
              </Link>
              <span className="font-pixel text-[9px] text-pokemon-gray-light">
                {new Date(c.date).toLocaleDateString('pt-BR')}
                {c._count != null && ` · ${c._count.scores} JOGADORES`}
              </span>
              <span className={[
                'font-pixel text-[8px] px-2 py-1 border-2',
                c.status === 'open'
                  ? 'bg-pokemon-green text-white border-pokemon-green-dark'
                  : 'bg-pokemon-gray text-pokemon-gray-light border-pokemon-gray-light',
              ].join(' ')}>
                {c.status === 'open' ? '♥ ABERTO' : '✗ ENCERRADO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin/championships/${c.id}`}>
                <Button variant="outline" size="sm">
                  EDITAR
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('Excluir este campeonato? Todos os resultados serão perdidos.')) {
                    deleteMutation.mutate(c.id)
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                EXCLUIR
              </Button>
            </div>
          </div>
        ))}
      </div>

      {championships?.length === 0 && !isLoading && (
        <div className="pixel-box py-6 text-center">
          <p className="font-pixel text-[9px] text-pokemon-gray-light">
            NENHUM CAMPEONATO. CRIE UM ACIMA.
          </p>
        </div>
      )}
    </div>
  )
}
