FROM node:20-alpine AS base
RUN npm install -g pnpm

# ── Build stage ────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter leaderboard-tcg-backend

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN pnpm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter leaderboard-tcg-backend --prod

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/prisma ./apps/backend/prisma

WORKDIR /app/apps/backend

RUN pnpm prisma generate

ENV NODE_ENV=production
EXPOSE 3001

CMD ["pnpm", "start"]
