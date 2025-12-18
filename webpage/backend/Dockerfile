# =============================================================================
# Marketing Backend Dockerfile
# NestJS application for ordotodo.com marketing site
# =============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files for the entire monorepo
COPY package.json package-lock.json ./
COPY webpage/backend/package.json ./webpage/backend/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy Prisma schema
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/

# Install all dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts
RUN cd packages/db && npx prisma generate --schema=prisma/schema.prisma

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package.json package-lock.json turbo.json ./
COPY webpage/backend ./webpage/backend
COPY packages ./packages

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build shared packages first
RUN npm install -g tsup typescript
RUN npx turbo run build --filter=@ordo-todo/core --filter=@ordo-todo/config --filter=@ordo-todo/db

# Build the marketing backend
WORKDIR /app/webpage/backend
RUN npm run build

# =============================================================================
# Stage 3: Production Runner
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/webpage/backend/dist ./dist
COPY --from=builder /app/webpage/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy shared packages
COPY --from=builder /app/packages/core ./node_modules/@ordo-todo/core
COPY --from=builder /app/packages/config ./node_modules/@ordo-todo/config
COPY --from=builder /app/packages/db ./node_modules/@ordo-todo/db

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
