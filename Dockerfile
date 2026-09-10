# syntax=docker/dockerfile:1
# Multi-stage build — cloud-agnostic (on-prem Docker Compose). Chạy non-root.
# Next.js output:'standalone' (next.config.ts) đóng gói server tối giản.

# ---------- deps ----------
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# prisma schema cần cho postinstall (prisma generate) khi npm ci.
COPY prisma ./prisma
RUN npm ci

# ---------- builder ----------
FROM node:24-bookworm-slim AS builder
WORKDIR /app
# OpenSSL cho Prisma (engine + generate) trên image slim.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL giả lúc build (không kết nối DB khi build). Prisma chỉ generate client.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
# Bật output:'standalone' CHỈ cho image Docker (next.config.ts đọc cờ opt-in này).
ENV DOCKER_STANDALONE=1
RUN npm run build

# ---------- runner ----------
FROM node:24-bookworm-slim AS runner
WORKDIR /app
# OpenSSL cho Prisma runtime (TLS tới PostgreSQL/Neon, sslmode=require).
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Người dùng không đặc quyền.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Artefact standalone + static + public + prisma (để chạy migrate deploy nếu cần).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
# Healthcheck DB qua /api/health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
