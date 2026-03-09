import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminPlayers() {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const queryClient = useQueryClient()

  const { data: players, isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  })

  const createMutation = useMutation({
    mutationFn: () => createPlayer(newName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setNewName('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updatePlayer(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate()
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateMutation.mutate({ id: editingId, name: editName.trim() })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pixel text-pokemon-yellow text-sm tracking-widest">
          ♟ JOGADORES
        </h1>
        <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
          GERENCIAR TREINADORES
        </p>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            + NOVO JOGADOR
          </span>
        </div>
        <div className="p-4">
          <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="NOME DO TREINADOR"
              className="max-w-xs"
            />
            <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
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
            ✗ {error instanceof Error ? error.message : 'ERRO AO CARREGAR JOGADORES'}
          </p>
        </div>
      )}

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            LISTA DE JOGADORES
          </span>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {players?.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between border-2 border-pokemon-gray-light bg-pokemon-dark py-2 px-3"
              >
                {editingId === p.id ? (
                  <div className="flex flex-1 items-center gap-2 flex-wrap">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="max-w-xs"
                      autoFocus
                    />
                    <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                      ✓ SALVAR
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null)
                        setEditName('')
                      }}
                    >
                      ✗ CANCELAR
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-pixel text-[10px] text-pokemon-light">
                      ► {p.name}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(p.id, p.name)}>
                        EDITAR
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm(`Excluir jogador "${p.name}"?`)) {
                            deleteMutation.mutate(p.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        EXCLUIR
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          {players?.length === 0 && !isLoading && (
            <p className="py-4 text-center font-pixel text-[9px] text-pokemon-gray-light">
              NENHUM JOGADOR. CRIE UM ACIMA.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
