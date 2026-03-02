# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

EXPOSE 3001

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /app/tmp && chown appuser:appgroup /app/tmp
USER appuser

CMD ["node", "src/index.js"]
