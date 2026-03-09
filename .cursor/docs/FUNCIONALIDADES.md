# Funcionalidades – Leaderboard Pokemon TCG

## Visão geral

- App para leaderboard de campeonatos de Pokémon TCG.
- Administrador cria campeonatos, adiciona jogadores, **gera rodadas e pareamentos (sistema suíço)** e informa o resultado de cada partida.
- **Tabela em tempo real** com todos os jogadores e pontuações (V, E, D, MP, **OPW**, **OPPW**).
- Ranking por campeonato e classificação geral mensal (soma dos pontos dos campeonatos do mês).

## Base de cálculo de pontos

**Fonte única e obrigatória:** [Play! Pokémon Tournament Rules Handbook (PT-BR)](https://www.pokemon.com/static-assets/content-assets/cms2-pt-br/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-br.pdf).

- Todo cálculo de pontos e critérios de desempate deve seguir **apenas** o que está descrito nesse PDF.
- Nenhuma regra de pontuação ou desempate deve ser inventada fora do handbook.

## Pareamentos e rodadas

- O app é responsável por **fazer os pareamentos** (sistema suíço): o admin gera a próxima rodada e o sistema emparelha jogadores com pontuação próxima, evitando repetir confrontos.
- Cada **rodada** contém várias **partidas** (Match). O admin informa o resultado de cada partida (vitória jogador 1, empate, vitória jogador 2).
- Os resultados alimentam a classificação em tempo real.

## Pontuação e classificação por campeonato

- **Match points** conforme o handbook: Vitória = 3, Empate = 1, Derrota = 0.
- A classificação é ordenada por: **Match points** (MP), depois **OPW**, depois **OPPW**.
- **OPW (Opponent Win %):** percentual de vitórias dos oponentes que o jogador enfrentou (média do win % de cada oponente).
- **OPPW (Opponent’s Opponent Win %):** média do OPW dos oponentes do jogador.
- Esses critérios de desempate seguem o handbook Play! Pokémon.

## Tabela em tempo real

- Na área admin e na visualização pública do campeonato, a tabela de classificação mostra: #, Jogador, V, E, D, MP, **OPW%**, **OPPW%**.
- Na admin, a tabela pode ser atualizada periodicamente (ex.: a cada 5s) para refletir resultados recém-lançados.

## Ranking mensal

- Para cada jogador, somar os **match points oficiais** de todos os campeonatos em que participou no mês/ano selecionado.
- O ranking mensal ordena por esse total de match points no mês.
- Desempates no ranking mensal seguem os mesmos critérios do handbook quando aplicáveis.

## Entrada manual (alternativa)

- O admin pode, como antes, **lançar apenas o total** de vitórias/empates/derrotas por jogador (sem usar rodadas/partidas). Nesse caso OPW/OPPW ficam em zero; a ordenação usa apenas MP.
