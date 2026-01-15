# Getting Started

**Setup your development environment for ORDO**

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running Development Servers](#running-development-servers)
6. [Common Issues](#common-issues)
7. [Next Steps](#next-steps)

---

## ✅ Prerequisites

### Required Software

- **Node.js**: 20.x or higher
- **pnpm**: 9.x or higher (package manager)
- **Docker**: For PostgreSQL (optional, can use cloud DB)
- **Git**: For version control

### Verify Installation

```bash
node --version    # Should be 20.x or higher
pnpm --version   # Should be 9.x or higher
docker --version # Should be installed
git --version    # Should be installed
```

---

## 📥 Installation

### 1. Clone Repository

```bash
git clone https://github.com/tiagofur/ordo-creators.git
cd ordo-creators
```

### 2. Install Dependencies

```bash
# Install all dependencies for all packages and apps
pnpm install

# This will install dependencies for:
# - packages/core, packages/ui, packages/hooks, etc.
# - apps/backend, apps/web, apps/mobile, apps/desktop
```

**Expected Output:**

```
Installing dependencies...
[...]
Done in 30s
```

---

## 🔧 Environment Setup

### Backend Environment Variables

Create `.env` file in `apps/backend`:

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ordo_creators?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# Application
NODE_ENV="development"
API_PORT=3001
API_CORS_ORIGINS="http://localhost:3000,http://localhost:19006"
```

### Web Environment Variables

Create `.env.local` file in `apps/web`:

```bash
cd ../web
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI="true"
NEXT_PUBLIC_ENABLE_SOCIAL_PREVIEWS="true"
```

### Mobile Environment Variables

Create `.env` file in `apps/mobile`:

```bash
cd ../mobile
cp .env.example .env
```

---

## 🗄️ Database Setup

### Option 1: Docker (Recommended)

```bash
# From root directory
cd docker
docker-compose up -d

# This starts:
# - PostgreSQL 16 on port 5432
# - pgAdmin (optional) on port 5050
```

**Verify PostgreSQL is running:**

```bash
docker ps
# Should see postgres container running
```

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
createdb ordo_creators

# Or use psql
psql -U postgres
CREATE DATABASE ordo_creators;
```

### Push Schema & Generate Prisma Client

```bash
cd apps/web

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Optional: Open Prisma Studio
npx prisma studio
```

**Expected Output:**

```
✔ Generated Prisma Client (4.5.0) to ./node_modules/.prisma/client in 500ms
```

---

## 🚀 Running Development Servers

### Run All Apps (Recommended)

```bash
# From root directory
pnpm dev

# This runs in parallel:
# - Web: http://localhost:3000
# - Backend API: http://localhost:3001
# - Mobile: http://localhost:19006
# - Desktop: Not running (requires separate command)
```

### Run Specific Apps

#### Web App (Next.js)

```bash
pnpm dev --filter=@ordo-todo/web

# Access: http://localhost:3000
```

#### Backend API (NestJS)

```bash
pnpm dev --filter=@ordo-todo/backend

# Access: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

#### Mobile App (Expo)

```bash
pnpm dev --filter=@ordo-todo/mobile

# Access: http://localhost:19006
# Scan QR code with Expo Go app
```

#### Desktop App (Electron)

```bash
cd apps/desktop
pnpm dev

# Opens Electron desktop app
```

---

## 🔍 Verify Setup

### Check Backend API

```bash
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-14T10:00:00.000Z"}
```

### Check API Documentation

Open browser: http://localhost:3001/api/docs

Should see Swagger UI with all API endpoints.

### Check Web App

Open browser: http://localhost:3000

Should see ORDO landing/dashboard page.

---

## 🐛 Common Issues

### Issue: "Cannot find module '@ordo-todo/core'"

**Solution:**

```bash
# Reinstall dependencies
pnpm install

# Or rebuild packages
pnpm run build --filter=@ordo-todo/core
```

### Issue: "Database connection failed"

**Solution:**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it:
cd docker && docker-compose up -d

# Check DATABASE_URL in apps/backend/.env
# Ensure it matches your PostgreSQL setup
```

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
```

### Issue: "Prisma Client not generated"

**Solution:**

```bash
cd apps/web
npx prisma generate

# Or add to package.json scripts and run:
pnpm prisma:generate
```

### Issue: "Module not found: Can't resolve '@/...'"

**Solution:**

```bash
# Ensure tsconfig.json has correct paths:
# {
#   "compilerOptions": {
#     "paths": {
#       "@/*": ["./src/*"]
#     }
#   }
# }

# Restart dev server
```

---

## 📚 Next Steps

Now that you're set up, explore:

1. **Architecture**: Understand how the monorepo is structured
   - [Architecture Overview](../architecture/overview.md)
   - [Clean Architecture](../architecture/clean-architecture.md)

2. **Development Guides**: Learn to build for specific platforms
   - [Web Development](./web-development.md)
   - [Backend Development](./backend-development.md)
   - [Mobile Development](./mobile-development.md)

3. **Package Guides**: Understand shared packages
   - [UI Components](../packages/ui-components.md)
   - [Data Fetching Hooks](../packages/hooks.md)
   - [Domain Logic](../packages/core.md)

4. **Features**: Learn about ORDO's killer features
   - [Content Pipeline](../../features/content-pipeline.md)
   - [Frictionless Capture](../../features/frictionless-capture.md)
   - [Remix Engine](../../features/remix-engine.md)

---

## 🛠️ Useful Commands

```bash
# Build everything
pnpm build

# Lint everything
pnpm lint

# Type check everything
pnpm check-types

# Run tests
pnpm test

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

---

## 📖 Development Workflow

### Typical Workflow for Backend Feature

1. **Add Domain Logic** (`packages/core`)
   - Create entity/use case
   - Write unit tests

2. **Add API Endpoint** (`apps/backend`)
   - Create controller/service
   - Write integration tests

3. **Add Hook** (`packages/hooks`)
   - Create React Query hook

4. **Add UI** (`packages/ui`)
   - Create platform-agnostic component

5. **Add Page** (`apps/web`)
   - Import from packages
   - Use hooks from packages

### Typical Workflow for Frontend Feature

1. **Create UI Component** (`packages/ui`)
   - Platform-agnostic
   - Accept data/callbacks via props

2. **Create Page** (`apps/web`)
   - Use shared UI components
   - Use shared hooks

3. **Test**
   - Run unit tests
   - Run E2E tests

4. **Deploy**
   - Build app
   - Deploy to Vercel/Netlify

---

## 📞 Support

If you encounter issues not covered here:

1. Check [Troubleshooting Guide](../best-practices/testing-strategy.md)
2. Search existing [GitHub Issues](https://github.com/tiagofur/ordo-creators/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

**Happy Coding! 🚀**
