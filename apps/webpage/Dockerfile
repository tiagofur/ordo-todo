# =============================================================================
# Landing / sitio público (Next.js) — imagen de producción para ordotodo.com.
#
# Misma estructura que apps/web/Dockerfile: la etapa `manifests` recoge todos
# los package.json del monorepo para que `npm ci` enlace cada workspace sin
# lista a mano, y `turbo run build --filter=webpage` construye antes los
# paquetes de los que depende (config, styles, ui, ui-shared, core…).
# =============================================================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1 NEXT_TELEMETRY_DISABLED=1

# -----------------------------------------------------------------------------
FROM base AS manifests
COPY . .
RUN find . -name package.json -not -path '*/node_modules/*' \
      -exec sh -c 'mkdir -p "/manifests/$(dirname "$1")" && cp "$1" "/manifests/$1"' _ {} \; \
 && cp package-lock.json /manifests/ \
 && mkdir -p /manifests/packages/db \
 && cp -r packages/db/prisma packages/db/prisma.config.ts /manifests/packages/db/

# -----------------------------------------------------------------------------
FROM base AS deps
COPY --from=manifests /manifests/ ./
RUN npm ci --legacy-peer-deps --ignore-scripts

# -----------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app ./
COPY . .

ARG CACHEBUST=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN echo "Building marketing web with API URL: $NEXT_PUBLIC_API_URL"

RUN DATABASE_URL=postgresql://localhost npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npx turbo run build --filter=@ordo-todo/webpage

# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/webpage/public ./apps/webpage/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/webpage/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webpage/.next/static ./apps/webpage/.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/webpage/server.js"]
