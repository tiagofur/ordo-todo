# Local Development Setup Guide

Complete guide to setting up the Ordo-Todo development environment on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Manual Setup](#manual-setup)
4. [Development Workflow](#development-workflow)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))

### Optional Software

- **Redis** 7+ ([Download](https://redis.io/download))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **VSCode** ([Download](https://code.visualstudio.com/))

### Verify Installation

```bash
node --version   # Should be v18+
npm --version    # Should be 10+
git --version    # Should be 2.x+
psql --version   # Should be 16+
redis-cli --version  # Should be 7.x (if installed)
```

---

## Quick Start (Docker)

**Recommended for new developers** - Sets up everything automatically.

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/ordo-todo.git
cd ordo-todo
```

### Step 2: Start Services

```bash
# Start all services (PostgreSQL, Redis, Backend, Web)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Step 3: Access Applications

- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:3101
- **API Documentation**: http://localhost:3101/api-docs
- **pgAdmin**: http://localhost:5050 (admin@pgadmin.com / admin)
- **Health Check**: http://localhost:3101/health
- **Metrics**: http://localhost:3101/metrics

### Step 4: Stop Services

```bash
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

---

## Manual Setup

**Recommended for contributors** - More control over the development environment.

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/ordo-todo.git
cd ordo-todo
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root + all workspaces)
npm install
```

### Step 3: Setup PostgreSQL

#### Option A: Use Local PostgreSQL

```bash
# Create database
createdb ordo_todo

# Or use psql
psql postgres
CREATE DATABASE ordo_todo;
\q
```

#### Option B: Use Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Step 4: Setup Redis

#### Option A: Use Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis

# Windows (WSL)
sudo service redis-server start
```

#### Option B: Use Docker Redis

```bash
# Run Redis in Docker
docker run --name ordo-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

### Step 5: Configure Environment Variables

```bash
# Create backend environment file
cp apps/backend/.env.example apps/backend/.env.development
```

Edit `apps/backend/.env.development`:

```bash
# Application
NODE_ENV=development
PORT=3101
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ordo_todo
DB_POOL_MAX=20
DB_POOL_MIN=5

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=development-secret-key-min-32-chars-long
REFRESH_TOKEN_SECRET=development-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Step 6: Setup Database

```bash
cd packages/db

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed test data
npx tsx ../../scripts/seed-database.ts

cd ../..
```

### Step 7: Start Development Servers

```bash
# Terminal 1: Start Backend
cd apps/backend
npm run start:dev

# Terminal 2: Start Web App
cd apps/web
npm run dev
```

### Step 8: Verify Setup

Open browser and test:

1. **Health Check**: http://localhost:3101/health
2. **API Docs**: http://localhost:3101/api-docs
3. **Web App**: http://localhost:3000
4. **Metrics**: http://localhost:3101/metrics

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=@ordo-todo/backend

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### Linting and Type Checking

```bash
# Lint all code
npm run lint

# Type check all code
npm run check-types

# Fix lint issues automatically
npm run lint -- --fix
```

### Building

```bash
# Build all packages
npm run build

# Build specific workspace
npm run build --workspace=@ordo-todo/backend
```

### Database Management

```bash
# Reset database (WARNING: deletes all data)
cd packages/db
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name describe_your_changes

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Common Development Tasks

**Add a new API endpoint:**

1. Create DTO in `apps/backend/src/{module}/dto/`
2. Add method to controller
3. Implement business logic in service
4. Write tests
5. Update API documentation

**Add a new database field:**

1. Update `packages/db/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev`
3. Update DTOs and services
4. Write tests

**Debug backend code:**

```bash
# Run with Node.js debugger
cd apps/backend
npm run start:debug

# Or use Chrome DevTools
node --inspect-brk dist/main.js
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3101`

**Solution**:
```bash
# Find process using port
lsof -i :3101  # macOS/Linux
netstat -ano | findstr :3101  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database Connection Failed

**Error**: `Can't reach database server at localhost`

**Solution**:
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql  # Linux

# Check database exists
psql postgres -c "\l" | grep ordo_todo

# Check connection
psql postgresql://postgres:postgres@localhost:5432/ordo_todo
```

### Issue: Redis Connection Failed

**Error**: `Error: Redis connection to localhost:6379 failed`

**Solution**:
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Issue: Prisma Client Generation Failed

**Error**: `This command can only be run inside a project`

**Solution**:
```bash
# Make sure you're in the correct directory
cd packages/db

# Regenerate client
npx prisma generate

# If that fails, reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Module Not Found

**Error**: `Error: Cannot find module '@ordo-todo/core'`

**Solution**:
```bash
# Rebuild all packages
npm run build

# Or build specific package
npm run build --workspace=@ordo-todo/core

# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Issue: CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `CORS_ORIGINS` in `.env.development`
2. Add your frontend URL to allowed origins
3. Restart backend server

### Issue: Tests Failing

**Error**: Tests fail with database connection errors

**Solution**:
```bash
# Setup test database
createdb ordo_todo_test

# Run tests with test database
DATABASE_URL="postgresql://postgres@localhost:5432/ordo_todo_test" npm run test
```

---

## IDE Setup (VSCode)

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

### VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Useful Commands Reference

```bash
# Install dependencies
npm install

# Start all apps
npm run dev

# Build all
npm run build

# Test all
npm run test

# Lint all
npm run lint

# Type check all
npm run check-types

# Database push
cd packages/db && npx prisma db push

# Database studio
cd packages/db && npx prisma studio

# Seed database
npx tsx scripts/seed-database.ts

# Docker development
docker-compose -f docker-compose.dev.yml up -d

# Docker logs
docker-compose -f docker-compose.dev.yml logs -f

# Docker stop
docker-compose -f docker-compose.dev.yml down
```

---

## Getting Help

- **Documentation**: [docs/](../docs/)
- **GitHub Issues**: [github.com/your-org/ordo-todo/issues](https://github.com/your-org/ordo-todo/issues)
- **Discord Community**: [discord.gg/your-server](https://discord.gg/your-server)
- **Email**: support@ordo-todo.com

---

## Next Steps

1. ✅ Complete setup
2. 📖 Read [Architecture Documentation](./ARCHITECTURE.md)
3. 🚀 Follow [Contribution Guidelines](./CONTRIBUTING.md)
4. 👀 Watch [Project Board](https://github.com/your-org/ordo-todo/projects)
5. 🎉 Start contributing!

Happy coding! 🎨
