# ---------- base ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- deps (cached) ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- dev (hot reload) ----------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
# no source code copied here; we'll mount it as a volume
EXPOSE 3000
CMD ["npm","run","dev"]

# ---------- builder (prod build) ----------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# if you use standalone runner, ensure next.config has: output: 'standalone'
RUN npm run build

# ---------- runner (prod) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN useradd -m nextjs
# standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
