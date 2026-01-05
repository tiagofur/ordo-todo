<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Ordo-Todo Backend API built with [NestJS](https://github.com/nestjs/nest) framework, PostgreSQL, and Redis.

**Key Features:**
- RESTful API with comprehensive CRUD operations
- JWT authentication with refresh tokens
- Redis-backed token blacklist for distributed sessions
- Role-based access control (RBAC) with workspace membership
- Real-time notifications via WebSocket (planned)
- Comprehensive Swagger/OpenAPI documentation

**Technology Stack:**
- **Framework**: NestJS 11
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (ioredis) for token blacklist and caching
- **Authentication**: JWT with access + refresh tokens
- **Validation**: class-validator + class-transformer
- **Testing**: Jest + Supertest

## Redis Setup

This backend uses Redis for:
1. **Token Blacklist**: Distributed logout across multiple instances
2. **Caching**: Optional caching for frequently accessed data

### Local Development with Docker

```bash
# Start Redis container
docker run --name ordo-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Verify Redis is running
docker ps | grep ordo-redis

# Stop Redis when done
docker stop ordo-redis
docker rm ordo-redis
```

### Local Development without Docker

```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Install Redis (Ubuntu)
sudo apt-get install redis-server
sudo systemctl start redis

# Install Redis (Windows)
# Download from https://github.com/microsoftarchive/redis/releases
```

### Cloud Redis Services

**Recommended options for production:**
- **AWS ElastiCache** (https://aws.amazon.com/elasticache/)
- **Redis Cloud** (https://redis.com/redis-enterprise-cloud/)
- **Upstash** (https://upstash.com/) - Free tier available

### Environment Variables

```bash
# Required for token blacklist
REDIS_HOST=localhost
REDIS_PORT=6379
# Optional (if Redis requires authentication)
REDIS_PASSWORD=your_password
# Optional (for TLS connections)
REDIS_TLS=true
```

## Database Migrations

This project uses Prisma Migrate for database schema management.

### Recent Migrations (January 2025)

#### 1. Fix onDelete Behaviors (20260105_fix_on_delete_behaviors)
**Purpose**: Fix 7 critical data integrity issues
**Risk**: Low (only affects future DELETE operations)
**Documentation**: [scripts/migrations/20260105_fix_on_delete_behaviors.md](../../../scripts/migrations/20260105_fix_on_delete_behaviors.md)

#### 2. Add Missing Indexes (20260105_add_missing_indexes)
**Purpose**: Add 6 performance indexes
**Risk**: Minimal (indexes only, no data changes)
**Documentation**: [scripts/migrations/20260105_add_missing_indexes.md](../../../scripts/migrations/20260105_add_missing_indexes.md)

### Applying Migrations

**Development**:
```bash
cd packages/db
npx prisma migrate dev
```

**Production**:
```bash
# 1. Backup database first
./scripts/migrations/backup-db.sh production

# 2. Apply migration
./scripts/migrations/migrate-production.sh 20260105_fix_on_delete_behaviors

# 3. Verify application works
curl -f https://api.ordotodo.com/health
```

**See**: [Migrations Guide](../../../scripts/migrations/README.md)

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

### Unit Tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### E2E Tests

E2E tests require a PostgreSQL database to be running.

#### Option 1: Using Docker (Recommended)

```bash
# Start the test database
npm run test:e2e:setup

# Run the E2E tests
npm run test:e2e

# Stop and cleanup the test database
npm run test:e2e:teardown
```

#### Option 2: Manual Database Setup

1. Start a PostgreSQL database with these credentials:
   - Host: `localhost:5432`
   - User: `postgres`
   - Password: `postgres`
   - Database: `ordo_todo_test`

2. Apply migrations:
   ```bash
   cd packages/db
   npx prisma migrate deploy
   ```

3. Set environment variables:
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ordo_todo_test"
   export NODE_ENV=test
   export JWT_SECRET="test-jwt-secret-that-is-at-least-32-characters-long"
   ```

4. Run tests:
   ```bash
   npm run test:e2e
   ```

#### Running in CI

The E2E tests run automatically in GitHub Actions using the `postgres` service defined in `.github/workflows/ci.yml`. No additional setup is required.

## Environment Variables

Create a `.env` file in the `apps/backend` directory:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ordo_todo"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# Redis (Required for production)
REDIS_URL="redis://localhost:6379"
REDIS_ENABLED="true"

# Node Environment
NODE_ENV="development"

# API Configuration
PORT=3001
API_PREFIX=""
```

### Redis Setup (Production)

Redis is **required for production deployments** to enable:
- **Distributed token blacklist** - Logout works across all server instances
- **Distributed caching** - Cache invalidation across multiple instances
- **Pub/Sub coordination** - Real-time cache updates

#### Option 1: Docker (Recommended)

```bash
# Start Redis
docker run --name ordo-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Verify connection
docker exec -it ordo-redis redis-cli ping
# Should return: PONG
```

#### Option 2: Redis Cloud

Use managed Redis services:
- [AWS ElastiCache](https://aws.amazon.com/elasticache/)
- [Azure Cache for Redis](https://azure.microsoft.com/services/cache/)
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/)

#### Option 3: Local Development

Without Redis, the backend will use in-memory caching (not production-ready).

### Redis Health Check

Monitor Redis connection status:

```bash
# Check Redis health endpoint
curl http://localhost:3001/health

# Response includes Redis status
{
  "status": "ok",
  "info": {
    "redis": {
      "status": "connected",
      "latency": 5
    }
  }
}
```

## Deployment

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
