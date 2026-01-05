# Deployment Runbooks

This document contains step-by-step procedures for deploying and maintaining the Ordo-Todo application in production.

## Table of Contents

1. [Initial Deployment](#initial-deployment)
2. [Database Migrations](#database-migrations)
3. [Rollback Procedures](#rollback-procedures)
4. [Monitoring & Alerts](#monitoring--alerts)
5. [Troubleshooting](#troubleshooting)

---

## Initial Deployment

### Prerequisites

- PostgreSQL 16+ database
- Redis 7+ server
- Node.js 18+
- Domain name configured with SSL certificate
- Environment variables configured

### Step 1: Prepare Environment

```bash
# Clone repository
git clone https://github.com/your-org/ordo-todo.git
cd ordo-todo

# Install dependencies
npm install

# Create production environment file
cp apps/backend/.env.example apps/backend/.env.production
```

### Step 2: Configure Environment Variables

Edit `apps/backend/.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3101
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/ordo_todo
DB_POOL_MAX=20
DB_POOL_MIN=5

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-secure-jwt-secret-min-32-chars
REFRESH_TOKEN_SECRET=your-secure-refresh-secret-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Step 3: Build Application

```bash
# Build backend
cd apps/backend
npm run build

# Build web app (if deploying together)
cd ../web
npm run build
```

### Step 4: Setup Database

```bash
# Run database migrations
cd packages/db
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial data (optional)
npx tsx ../../scripts/seed-database.ts
```

### Step 5: Start Application

```bash
# Using PM2 (recommended)
cd apps/backend
pm2 start dist/main.js --name ordo-backend

# Or using systemd (Linux)
sudo systemctl start ordo-backend
```

### Step 6: Verify Deployment

```bash
# Check health endpoint
curl https://your-api.com/health

# Check metrics endpoint
curl https://your-api.com/metrics

# Check API docs
open https://your-api.com/api-docs
```

---

## Database Migrations

### Creating a New Migration

```bash
cd packages/db

# Modify schema.prisma first
# Then create migration
npx prisma migrate dev --name describe_your_migration
```

### Testing Migrations

1. **Test locally**:
```bash
# Create a test database
createdb ordo_todo_test

# Apply migrations
DATABASE_URL="postgresql://user@localhost:5432/ordo_todo_test" npx prisma migrate deploy

# Verify data integrity
# ... run your tests ...
```

2. **Test on staging**:
```bash
# Apply to staging environment
./scripts/migrate-production.sh staging
```

### Applying Migrations to Production

```bash
# Run the production migration script
./scripts/migrate-production.sh production

# Monitor the process
# - Check database logs
# - Monitor application errors
# - Verify API health endpoints
```

### Migration Rollback

If a migration causes issues:

```bash
# 1. Stop application
pm2 stop ordo-backend

# 2. Restore database from backup
pg_restore -d ordo_todo backups/backup_production_<timestamp>.sql

# 3. Revert code changes
git revert <commit-hash>

# 4. Rebuild and restart
npm run build
pm2 restart ordo-backend
```

---

## Rollback Procedures

### Application Rollback

```bash
# 1. Identify the last stable version
git log --oneline -10

# 2. Checkout stable version
git checkout <stable-commit-hash>

# 3. Rebuild application
cd apps/backend
npm run build

# 4. Restart with zero downtime (PM2)
pm2 reload ordo-backend

# 5. Verify health
curl https://your-api.com/health
```

### Database Rollback

```bash
# 1. Stop all writes to database
pm2 stop ordo-backend

# 2. List available backups
ls -lh backups/

# 3. Restore from backup
pg_restore -d ordo_todo -c backups/backup_production_<timestamp>.sql

# 4. Verify data integrity
psql -d ordo_todo -c "SELECT COUNT(*) FROM \"User\";"

# 5. Restart application
pm2 start ordo-backend
```

### Emergency Rollback (Full System)

If everything fails:

1. **Switch to maintenance mode**
   - Update DNS to point to maintenance page
   - Stop all application services

2. **Restore database from last known good backup**
   ```bash
   pg_restore -d ordo_todo backups/backup_production_<timestamp>.sql
   ```

3. **Deploy previous stable version**
   ```bash
   git checkout <stable-tag>
   npm run build
   pm2 start ordo-backend
   ```

4. **Verify all systems**
   - Check health endpoints
   - Monitor error logs
   - Test critical user flows

5. **Remove maintenance mode**
   - Update DNS back to application

---

## Monitoring & Alerts

### Health Checks

Monitor these endpoints:

```bash
# Overall health
GET /health

# Liveness (Kubernetes)
GET /health/live

# Readiness (Kubernetes)
GET /health/ready

# Metrics (Prometheus)
GET /metrics
```

### Key Metrics to Monitor

**Application Metrics:**
- HTTP request duration (p50, p95, p99)
- HTTP error rate (> 1% alert)
- Active users
- Tasks created/completed per minute

**Database Metrics:**
- Connection pool usage
- Query duration (> 100ms alert)
- Database size
- Slow query log

**Redis Metrics:**
- Cache hit ratio (> 80% target)
- Memory usage
- Connection count

**System Metrics:**
- CPU usage (> 80% alert)
- Memory usage (> 85% alert)
- Disk usage (> 90% alert)
- Event loop lag (> 100ms alert)

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| HTTP Error Rate | 1% | 5% |
| Response Time (p95) | 500ms | 2000ms |
| Database Pool Usage | 80% | 95% |
| Cache Hit Ratio | < 80% | < 50% |
| CPU Usage | 70% | 90% |
| Memory Usage | 80% | 95% |
| Disk Usage | 80% | 95% |

---

## Troubleshooting

### Issue: Database Connection Failures

**Symptoms:**
- Health check shows "database: down"
- Application logs show connection errors

**Diagnosis:**
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
curl https://your-api.com/health | jq '.checks.database'
```

**Solutions:**
1. Check database is running
2. Verify DATABASE_URL is correct
3. Check network connectivity
4. Increase DB_POOL_MAX if needed
5. Check database for long-running queries blocking connections

### Issue: High Memory Usage

**Symptoms:**
- OOM (Out of Memory) errors
- Container restarts frequently

**Diagnosis:**
```bash
# Check memory metrics
curl https://your-api.com/health | jq '.checks.memory'

# Check Node.js heap size
curl https://your-api.com/metrics | grep process_heap
```

**Solutions:**
1. Check for memory leaks (use Node.js profiler)
2. Increase container memory limit
3. Optimize database queries (reduce data loaded)
4. Clear Redis cache (if bloated)

### Issue: Slow API Response Times

**Symptoms:**
- P95 response time > 1s
- User complaints about slowness

**Diagnosis:**
```bash
# Check response time metrics
curl https://your-api.com/metrics | grep http_request_duration

# Check database query performance
curl https://your-api.com/health | jq '.checks.database.responseTime'
```

**Solutions:**
1. Add indexes to slow queries
2. Implement caching for frequently accessed data
3. Optimize N+1 queries
4. Scale horizontally (add more instances)
5. Enable Redis caching

### Issue: Cache Invalidation Problems

**Symptoms:**
- Stale data shown to users
- Data inconsistency between instances

**Diagnosis:**
```bash
# Check Redis connectivity
redis-cli -h $REDIS_HOST ping

# Check cache hit ratio
curl https://your-api.com/metrics | grep cache_hit_ratio
```

**Solutions:**
1. Verify Redis is running and accessible
2. Check cache invalidation logic
3. Manually clear cache if needed
4. Restart application to flush local caches

### Issue: High CPU Usage

**Symptoms:**
- CPU usage consistently > 80%
- Slow response times

**Diagnosis:**
```bash
# Check CPU metrics
curl https://your-api.com/metrics | grep process_cpu

# Profile Node.js CPU usage
kill -USR2 <pid>  # Generates CPU profile
```

**Solutions:**
1. Profile application to find CPU-intensive operations
2. Optimize loops and computations
3. Implement caching for expensive operations
4. Scale horizontally to distribute load
5. Move heavy processing to background jobs

---

## Maintenance Tasks

### Daily

- Monitor error rates (Sentry)
- Check disk usage on all servers
- Review backup completion

### Weekly

- Review slow query logs
- Check cache hit ratios
- Review and optimize database indexes
- Test backup restoration

### Monthly

- Review and update dependencies
- Database vacuum and analyze
- Review security vulnerabilities
- Capacity planning review
- Disaster recovery drill

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Backend Lead | | |
| DevOps Engineer | | |
| Database Admin | | |
| On-Call Engineer | | |

---

## Additional Resources

- [API Documentation](https://your-api.com/api-docs)
- [Monitoring Dashboard](https://monitoring.your-domain.com)
- [Incident Response Template](./INCIDENT_RESPONSE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
