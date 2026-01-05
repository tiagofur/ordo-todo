# =============================================================================
# Landing Page / Webpage Dockerfile
# Next.js application for ordotodo.com
# =============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./
COPY apps/webpage/package.json ./apps/webpage/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/styles/package.json ./packages/styles/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/stores/package.json ./packages/stores/

# Install dependencies
RUN npm ci --legacy-peer-deps

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY package.json package-lock.json turbo.json ./
COPY apps/webpage ./apps/webpage
COPY packages ./packages

# Build arguments for environment variables
ARG CACHEBUST=1
ARG NEXT_PUBLIC_API_URL
RUN echo "Building marketing web with API URL: $NEXT_PUBLIC_API_URL"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build shared packages
RUN npm install -g tsup typescript
RUN npx turbo run build --filter=@ordo-todo/config --filter=@ordo-todo/ui

# Build Next.js app
WORKDIR /app/apps/webpage
RUN npm run build

# =============================================================================
# Stage 3: Production Runner
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=builder /app/apps/webpage/public ./apps/webpage/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/webpage/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webpage/.next/static ./apps/webpage/.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/webpage/server.js"]
