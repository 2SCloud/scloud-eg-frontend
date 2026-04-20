# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* is baked into the client bundle at build time — must be the
# URL the BROWSER will use to reach the admin API (port 9090, not 8080).
# Override per-environment, e.g.
#   docker build --build-arg NEXT_PUBLIC_API_URL=http://gateway.scloud.internal:9090 ./frontend
ARG NEXT_PUBLIC_API_URL=http://localhost:9090
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static    ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public           ./public

USER appuser
EXPOSE 3000

CMD ["node", "server.js"]
