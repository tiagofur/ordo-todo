# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files for the entire monorepo
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/config/package.json ./packages/config/

# Copy Prisma schema for generate
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/

# Install all dependencies (ignore scripts, we'll generate Prisma client later)
RUN npm ci --legacy-peer-deps --ignore-scripts
RUN cd packages/db && npx prisma generate --schema=prisma/schema.prisma

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy source code
COPY package.json package-lock.json turbo.json ./
COPY apps/backend ./apps/backend
COPY packages/core ./packages/core
COPY packages/db ./packages/db
COPY packages/config ./packages/config

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build shared packages first
WORKDIR /app/packages/core
RUN npm run build || true

WORKDIR /app/packages/config
RUN npm run build || true

# Build the backend
WORKDIR /app/apps/backend
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
ENV PORT=3001

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create uploads directory
RUN mkdir -p /app/apps/backend/uploads && chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

WORKDIR /app/apps/backend

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
