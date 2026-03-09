# Pokemon TCG Leaderboard

App full-stack para gerenciamento de campeonatos de Pokémon TCG: criação de campeonatos, cadastro de jogadores, registro de resultados (V/E/D) e ranking mensal. Pontuação conforme [Play! Pokémon Tournament Rules Handbook (PT-BR)](https://www.pokemon.com/static-assets/content-assets/cms2-pt-br/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-br.pdf).

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (para o PostgreSQL)
- Ou PostgreSQL instalado localmente

## Configuração

### 1. Banco de dados (PostgreSQL com Docker)

Na raiz do projeto, suba o PostgreSQL:

```bash
docker compose up -d
```

Isso sobe o Postgres na porta 5432 com usuário/senha `leaderboard` e banco `leaderboard_tcg`. O `backend/.env` já está configurado para essa conexão.

Aplique as migrations:

```bash
cd backend
pnpm exec prisma migrate deploy
```

Crie o usuário admin e dados de exemplo:

```bash
cd backend
pnpm run db:seed
```

Usuário padrão: `admin@leaderboard.local` / `admin123` (altere via `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`).

### 2. Instalação e execução

Na raiz do projeto (use [pnpm](https://pnpm.io)):

```bash
pnpm install
```

Subir back e front juntos:

```bash
pnpm dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

Ou em terminais separados:

```bash
pnpm run dev:backend   # http://localhost:3000
pnpm run dev:frontend  # http://localhost:5173
```

O frontend faz proxy de `/api` para o backend quando rodando em dev.

## Estrutura

- `frontend/` — React + Vite + TypeScript, TailwindCSS, React Router, TanStack Query, Zustand
- `backend/` — Express + TypeScript, Prisma, PostgreSQL, JWT

## Funcionalidades

- **Público:** ranking mensal (match points somados), lista de campeonatos, classificação por campeonato
- **Admin (login):** criar/editar/excluir campeonatos, gerenciar jogadores, adicionar jogadores ao campeonato, lançar V/E/D e encerrar campeonato

Pontuação por partida (handbook): Vitória = 3, Empate = 1, Derrota = 0.
