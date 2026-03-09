import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchChampionship,
  fetchStandings,
  fetchRounds,
  fetchRoundsInfo,
  createPairings,
  setMatchResult,
  updateChampionship,
  type Match,
} from '../api'
import {
  addPlayerToChampionship,
  removePlayerFromChampionship,
} from '../api-scores'
import { fetchPlayers } from '@/features/players/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminChampionshipDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [addPlayerId, setAddPlayerId] = useState('')

  const { data: championship, isLoading, error } = useQuery({
    queryKey: ['championships', id],
    queryFn: () => fetchChampionship(id!),
    enabled: !!id,
  })

  const { data: standingsData } = useQuery({
    queryKey: ['championships', id, 'standings'],
    queryFn: () => fetchStandings(id!),
    enabled: !!id,
    refetchInterval: 5000,
  })

  const { data: roundsData } = useQuery({
    queryKey: ['championships', id, 'rounds'],
    queryFn: () => fetchRounds(id!),
    enabled: !!id,
  })

  const { data: roundsInfo } = useQuery({
    queryKey: ['championships', id, 'rounds-info'],
    queryFn: () => fetchRoundsInfo(id!),
    enabled: !!id,
  })

  const pairingsMutation = useMutation({
    mutationFn: (roundNumber: number) => createPairings(id!, roundNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championships', id] })
      queryClient.invalidateQueries({ queryKey: ['championships', id, 'rounds'] })
      queryClient.invalidateQueries({ queryKey: ['championships', id, 'rounds-info'] })
      queryClient.invalidateQueries({ queryKey: ['championships', id, 'standings'] })
    },
  })

  const matchResultMutation = useMutation({
    mutationFn: ({ matchId, result }: { matchId: string; result: 'player1' | 'player2' | 'draw' }) =>
      setMatchResult(id!, matchId, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championships', id] })
      queryClient.invalidateQueries({ queryKey: ['championships', id, 'rounds'] })
      queryClient.invalidateQueries({ queryKey: ['championships', id, 'standings'] })
    },
  })

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'open' | 'closed') => updateChampionship(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championships', id] })
      queryClient.invalidateQueries({ queryKey: ['championships'] })
    },
  })

  const addPlayerMutation = useMutation({
    mutationFn: (playerId: string) => {
      const byeLosses = roundsData?.rounds?.length ?? 0
      return addPlayerToChampionship(id!, playerId, byeLosses)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championships', id] })
      setAddPlayerId('')
    },
  })

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => removePlayerFromChampionship(id!, playerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['championships', id] }),
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

  if (error || !championship) {
    return (
      <div className="border-2 border-pokemon-red bg-pokemon-darker p-4">
        <p className="font-pixel text-[10px] text-pokemon-red">
          ✗ {error instanceof Error ? error.message : 'CAMPEONATO NÃO ENCONTRADO'}
        </p>
      </div>
    )
  }

  const alreadyInChampionship = new Set(championship.standings.map((s) => s.playerId))
  const availablePlayers = players?.filter((p) => !alreadyInChampionship.has(p.id)) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/admin/championships"
            className="font-pixel text-[9px] text-pokemon-gray-light hover:text-pokemon-yellow transition-colors"
          >
            ◄ CAMPEONATOS
          </Link>
          <h1 className="font-pixel text-pokemon-yellow text-sm tracking-wide mt-2 leading-relaxed">
            {championship.name.toUpperCase()}
          </h1>
          <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
            {new Date(championship.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        {championship.status === 'open' && (
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm('Encerrar este campeonato? Não será possível editar resultados depois.')) {
                updateStatusMutation.mutate('closed')
              }
            }}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <span className="animate-blink">ENCERRANDO...</span>
            ) : (
              '✗ ENCERRAR CAMPEONATO'
            )}
          </Button>
        )}
      </div>

      {((standingsData?.standings ?? championship.standings)?.length ?? 0) > 0 && (
        <div className="pixel-box">
          <div className="border-b-2 border-pokemon-yellow px-4 py-3 flex items-center justify-between">
            <span className="font-pixel text-[10px] text-pokemon-yellow">
              ★ CLASSIFICAÇÃO AO VIVO
            </span>
            <span className="font-pixel text-[9px] text-pokemon-green animate-blink-slow">
              ● LIVE 5s
            </span>
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
                  <th className="text-right">OPW%</th>
                  <th className="text-right">OPPW%</th>
                  {championship.status === 'open' && <th className="w-24"></th>}
                </tr>
              </thead>
              <tbody>
                {(standingsData?.standings ?? championship.standings).map((row, i) => (
                  <tr key={row.playerId}>
                    <td>
                      <span className={`font-pixel text-[10px] ${
                        i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : 'text-pokemon-gray-light'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <span className="font-pixel text-[10px] text-pokemon-light">{row.playerName}</span>
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
                      <span className="font-pixel text-[10px] text-pokemon-light font-bold">{row.matchPoints}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-pixel text-[9px] text-pokemon-gray-light">
                        {((row.opw ?? 0) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-pixel text-[9px] text-pokemon-gray-light">
                        {((row.oppw ?? 0) * 100).toFixed(1)}%
                      </span>
                    </td>
                    {championship.status === 'open' && (
                      <td>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(`Remover ${row.playerName} do campeonato?`)) {
                              removePlayerMutation.mutate(row.playerId)
                            }
                          }}
                          disabled={removePlayerMutation.isPending}
                        >
                          ✗
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            ⚔ RODADAS E PAREAMENTOS (SUÍÇO)
          </span>
          <p className="font-pixel text-[8px] text-pokemon-gray-light mt-1">
            VITÓRIA=3pts, EMPATE=1pt, DERROTA=0pts · INFORME AS VITÓRIAS DE CADA JOGADOR
          </p>
        </div>
        <div className="p-4 space-y-4">
          {championship.status === 'open' && (
            <>
              {roundsInfo && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-pixel text-[9px] text-pokemon-gray-light">
                    RODADAS SUÍÇAS: {roundsInfo.currentRoundCount} / {roundsInfo.maxRounds}
                  </span>
                  <span className="font-pixel text-[9px] text-pokemon-gray-light">
                    ({roundsInfo.playerCount} JOGADORES)
                  </span>
                  {roundsInfo.currentRoundCount >= roundsInfo.maxRounds && (
                    <span className="font-pixel text-[9px] text-pokemon-yellow">
                      ⚠ LIMITE ATINGIDO PARA {roundsInfo.playerCount} JOGADORES
                    </span>
                  )}
                </div>
              )}

              <Button
                onClick={() => {
                  const next = (roundsData?.rounds?.length ?? 0) + 1
                  pairingsMutation.mutate(next)
                }}
                disabled={
                  pairingsMutation.isPending ||
                  championship.standings.length < 2 ||
                  (roundsInfo != null && roundsInfo.currentRoundCount >= roundsInfo.maxRounds)
                }
              >
                {pairingsMutation.isPending ? (
                  <span className="animate-blink">GERANDO...</span>
                ) : (
                  `► GERAR RODADA ${(roundsData?.rounds?.length ?? 0) + 1}`
                )}
              </Button>

              {championship.standings.length < 2 && (
                <p className="font-pixel text-[9px] text-pokemon-yellow">
                  ⚠ ADICIONE PELO MENOS 2 JOGADORES
                </p>
              )}
              {pairingsMutation.isError && (
                <p className="font-pixel text-[9px] text-pokemon-red">
                  ✗ {pairingsMutation.error instanceof Error ? pairingsMutation.error.message : 'ERRO'}
                </p>
              )}
            </>
          )}

          {(roundsData?.rounds?.length ?? 0) === 0 && (
            <p className="font-pixel text-[9px] text-pokemon-gray-light">
              NENHUMA RODADA GERADA
            </p>
          )}

          <div className="space-y-3">
            {roundsData?.rounds?.map((r) => (
              <div
                key={r.id}
                className="border-2 border-pokemon-blue bg-pokemon-dark p-3"
              >
                <h4 className="font-pixel text-[10px] text-pokemon-blue mb-3">
                  RODADA {r.roundNumber}
                </h4>
                <ul className="space-y-2">
                  {r.matches.map((m) => (
                    <MatchRow
                      key={`${m.id}-${m.result}`}
                      match={m}
                      onResult={(result) => matchResultMutation.mutate({ matchId: m.id, result })}
                      disabled={championship.status === 'closed'}
                      isSaving={matchResultMutation.isPending}
                    />
                  ))}
                  {r.bye && (
                    <li className="flex items-center justify-between gap-2 border-2 border-pokemon-yellow bg-pokemon-darker px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[10px] text-pokemon-yellow">
                          {r.bye.player.name}
                        </span>
                        <span className="font-pixel text-[9px] text-pokemon-gray-light">—</span>
                        <span className="font-pixel text-[9px] text-pokemon-gray-light">BYE</span>
                      </div>
                      <span className="font-pixel text-[9px] text-pokemon-green">✓ VITÓRIA AUTOMÁTICA (+3pts)</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pixel-box">
        <div className="border-b-2 border-pokemon-yellow px-4 py-3">
          <span className="font-pixel text-[10px] text-pokemon-yellow">
            + ADICIONAR JOGADOR
          </span>
        </div>
        <div className="p-4 flex flex-wrap items-end gap-2">
          <select
            value={addPlayerId}
            onChange={(e) => setAddPlayerId(e.target.value)}
          >
            <option value="">SELECIONE UM JOGADOR</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              if (addPlayerId) addPlayerMutation.mutate(addPlayerId)
            }}
            disabled={!addPlayerId || addPlayerMutation.isPending}
          >
            {addPlayerMutation.isPending ? (
              <span className="animate-blink">ADICIONANDO...</span>
            ) : (
              '► ADICIONAR'
            )}
          </Button>
          {availablePlayers.length === 0 && players && players.length > 0 && (
            <span className="font-pixel text-[9px] text-pokemon-gray-light">
              TODOS OS JOGADORES JÁ ESTÃO NO CAMPEONATO
            </span>
          )}
        </div>
        {(roundsData?.rounds?.length ?? 0) > 0 && (
          <div className="px-4 pb-4">
            <p className="font-pixel text-[9px] text-pokemon-yellow">
              ⚠ CAMPEONATO JÁ TEM {roundsData!.rounds.length} RODADA{roundsData!.rounds.length > 1 ? 'S' : ''} — JOGADOR ADICIONADO AGORA INICIARÁ COM {roundsData!.rounds.length} DERROTA{roundsData!.rounds.length > 1 ? 'S' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchRow({
  match,
  onResult,
  disabled,
  isSaving,
}: {
  match: Match
  onResult: (result: 'player1' | 'player2' | 'draw') => void
  disabled: boolean
  isSaving: boolean
}) {
  const initFromResult = (result: Match['result']) => {
    if (result === 'player1') return [2, 0]
    if (result === 'player2') return [0, 2]
    if (result === 'draw') return [1, 1]
    return [0, 0]
  }

  const [init1, init2] = initFromResult(match.result)
  const [p1wins, setP1wins] = useState(init1)
  const [p2wins, setP2wins] = useState(init2)

  const derivedResult: 'player1' | 'player2' | 'draw' | null =
    p1wins > p2wins ? 'player1' :
    p2wins > p1wins ? 'player2' :
    p1wins > 0 && p1wins === p2wins ? 'draw' :
    null

  const alreadySaved = derivedResult === match.result

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-2 border-pokemon-gray-light bg-pokemon-darker px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        <Input
          type="number"
          min={0}
          value={p1wins}
          onChange={(e) => setP1wins(Math.max(0, parseInt(e.target.value, 10) || 0))}
          disabled={disabled}
          className={`w-14 text-center ${match.result === 'player1' ? 'text-pokemon-yellow' : 'text-pokemon-green'}`}
        />
        <span className={`font-pixel text-[10px] ${match.result === 'player1' ? 'text-pokemon-yellow' : 'text-pokemon-light'}`}>
          {match.player1.name}
        </span>
        <span className="font-pixel text-[9px] text-pokemon-gray-light">VS</span>
        <span className={`font-pixel text-[10px] ${match.result === 'player2' ? 'text-pokemon-yellow' : 'text-pokemon-light'}`}>
          {match.player2.name}
        </span>
        <Input
          type="number"
          min={0}
          value={p2wins}
          onChange={(e) => setP2wins(Math.max(0, parseInt(e.target.value, 10) || 0))}
          disabled={disabled}
          className={`w-14 text-center ${match.result === 'player2' ? 'text-pokemon-yellow' : 'text-pokemon-green'}`}
        />
      </div>
      <div className="flex items-center gap-2">
        {!disabled && !alreadySaved && derivedResult && (
          <Button
            size="sm"
            variant="success"
            onClick={() => onResult(derivedResult)}
            disabled={isSaving}
          >
            ✓ SALVAR
          </Button>
        )}
        {alreadySaved && match.result && (
          <span className="font-pixel text-[9px] text-pokemon-green">✓ SALVO</span>
        )}
        {!disabled && !derivedResult && (
          <span className="font-pixel text-[9px] text-pokemon-gray-light">INFORME OS RESULTADOS</span>
        )}
      </div>
    </li>
  )
}
