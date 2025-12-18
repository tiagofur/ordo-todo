# =============================================================================
# Marketing Web Dockerfile
# Next.js application for ordotodo.com marketing site
# =============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./
COPY webpage/web/package.json ./webpage/web/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/styles/package.json ./packages/styles/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY package.json package-lock.json turbo.json ./
COPY webpage/web ./webpage/web
COPY packages ./packages

# Build arguments for environment variables
ARG CACHEBUST=1
ARG NEXT_PUBLIC_API_URL
RUN echo "Building marketing web with API URL: $NEXT_PUBLIC_API_URL"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build shared packages
RUN npm install -g tsup typescript
RUN npx turbo run build --filter=@ordo-todo/core --filter=@ordo-todo/config --filter=@ordo-todo/ui --filter=@ordo-todo/styles

# Build Next.js app
WORKDIR /app/webpage/web
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
COPY --from=builder /app/webpage/web/public ./webpage/web/public
COPY --from=builder --chown=nextjs:nodejs /app/webpage/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/webpage/web/.next/static ./webpage/web/.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "webpage/web/server.js"]
