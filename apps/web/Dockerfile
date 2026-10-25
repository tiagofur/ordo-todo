# =============================================================================
# Web (Next.js 16) — imagen de producción.
#
# Etapas:
#   manifests  recoge TODOS los package.json del monorepo (+ lockfile y schema
#              Prisma). Así `npm ci` enlaza cada workspace sin mantener una
#              lista a mano: añadir un paquete nuevo ya no rompe la imagen.
#   deps       npm ci (node_modules raíz Y anidados, p. ej. tailwind por app).
#   builder    fuentes + prisma generate + `turbo run build --filter=web`,
#              que construye primero los paquetes de los que depende (^build).
#   runner     salida standalone de Next, usuario sin privilegios.
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
# /app de deps trae node_modules raíz + anidados; las fuentes van encima.
COPY --from=deps /app ./
COPY . .

ARG CACHEBUST=1
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
RUN echo "Building web with API URL: $NEXT_PUBLIC_API_URL"

RUN DATABASE_URL=postgresql://localhost npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npx turbo run build --filter=@ordo-todo/web

# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
