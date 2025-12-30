# Deployment Guide - Ordo-Todo Backend

This guide provides comprehensive instructions for deploying the Ordo-Todo backend to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Building the Application](#building-the-application)
5. [Deployment Options](#deployment-options)
6. [Configuration](#configuration)
7. [Health Checks](#health-checks)
8. [Monitoring](#monitoring)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 16.x or higher
- **Nginx** (recommended): 1.24+ (for reverse proxy)
- **Docker** (optional): 24.x+
- **System Memory**: Minimum 2GB RAM, Recommended 4GB+
- **Disk Space**: Minimum 10GB, Recommended 20GB+

### Required Dependencies

```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql-16 postgresql-contrib-16

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

---

## Environment Setup

### Environment Variables

Create a `.env` file in the `apps/backend` directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ordo_todo"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="production"
PORT=3101
API_PREFIX="api/v1"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting (configured in app.module.ts)
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Generate Secure Secrets

```bash
# Generate JWT secrets (min 32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate strong random passwords
openssl rand -base64 32
```

---

## Database Setup

### PostgreSQL Configuration

1. **Create Database and User**:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE ordo_todo;

# Create user
CREATE USER ordo_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ordo_todo TO ordo_user;
```

2. **Configure PostgreSQL** (`/etc/postgresql/16/main/postgresql.conf`):

```conf
# Connection settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
effective_io_concurrency = 200
work_mem = 1310kB
min_wal_size = 1GB
max_wal_size = 4GB
```

3. **Restart PostgreSQL**:

```bash
sudo systemctl restart postgresql
```

### Run Migrations

```bash
cd apps/backend
npm run prisma:generate
npx prisma migrate deploy --schema=../../packages/db/prisma/schema.prisma
```

---

## Building the Application

### Production Build

```bash
cd apps/backend
npm install --only=production
npm run build
```

The compiled application will be in `dist/` directory.

### Verify Build

```bash
# Check if build succeeded
ls -la dist/

# Verify no TypeScript errors
npm run check-types
```

---

## Deployment Options

### Option 1: PM2 Process Manager (Recommended for VPS)

#### Install PM2

```bash
npm install -g pm2
pm2 update
```

#### Create PM2 Ecosystem File (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: "ordo-backend",
      script: "dist/main.js",
      cwd: "/path/to/apps/backend",
      instances: "max", // Use all CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3101,
      },
      error_file: "/var/log/ordo-backend/error.log",
      out_file: "/var/log/ordo-backend/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

#### Start Application with PM2

```bash
cd apps/backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### Useful PM2 Commands

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs ordo-backend

# Restart application
pm2 restart ordo-backend

# Stop application
pm2 stop ordo-backend

# Delete application
pm2 delete ordo-backend

# List all applications
pm2 list
```

---

### Option 2: Docker Deployment

#### Dockerfile

The project includes a `Dockerfile` in `apps/backend/`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY ../../packages ./packages
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY ../../packages ./packages

EXPOSE 3101

CMD ["node", "dist/main.js"]
```

#### Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  backend:
    build: ./apps/backend
    ports:
      - "3101:3101"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/ordo_todo
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=ordo_todo
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy with Docker Compose

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Stop
docker-compose -f docker-compose.prod.yml down

# Update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

### Option 3: Kubernetes Deployment

#### Deployment YAML (`k8s/deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ordo-backend
  namespace: ordo-todo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ordo-backend
  template:
    metadata:
      labels:
        app: ordo-backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/your-org/ordo-backend:latest
          ports:
            - containerPort: 3101
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: ordo-secrets
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: ordo-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3101
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3101
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ordo-backend-service
  namespace: ordo-todo
spec:
  selector:
    app: ordo-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3101
  type: ClusterIP
```

#### Deploy to Kubernetes

```bash
# Apply configuration
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -n ordo-todo

# View logs
kubectl logs -f deployment/ordo-backend -n ordo-todo

# Scale deployment
kubectl scale deployment ordo-backend --replicas=5 -n ordo-todo
```

---

## Configuration

### Nginx Reverse Proxy

Create Nginx configuration (`/etc/nginx/sites-available/ordo-todo`):

```nginx
upstream ordo_backend {
    least_conn;
    server 127.0.0.1:3101 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes
    location /api/v1/ {
        proxy_pass http://ordo_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health checks (no auth required)
    location /health {
        proxy_pass http://ordo_backend;
        access_log off;
    }

    # Swagger documentation
    location /api-docs {
        proxy_pass http://ordo_backend;
    }

    # Client limit
    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ordo-todo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Health Checks

The backend provides three health check endpoints:

### `/health`

Basic health check (always accessible):

```bash
curl http://localhost:3101/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

### `/health/ready`

Readiness check (verifies database connection):

```bash
curl http://localhost:3101/health/ready
```

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### `/health/live`

Liveness check (verifies services):

```bash
curl http://localhost:3101/health/live
```

Response:

```json
{
  "status": "ok",
  "services": {
    "database": "ok",
    "redis": "skipped"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Monitoring

### Application Logs

```bash
# PM2 logs
pm2 logs ordo-backend

# System journal
journalctl -u ordo-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitoring Stack

#### Prometheus Metrics

The backend exposes Prometheus metrics at `/metrics`:

```yaml
scrape_configs:
  - job_name: "ordo-backend"
    static_configs:
      - targets: ["localhost:3101"]
    metrics_path: "/metrics"
```

#### Grafana Dashboard

Create a dashboard with these panels:

- Request Rate
- Response Time (p50, p95, p99)
- Error Rate
- Active Connections
- Database Connection Pool
- CPU/Memory Usage

### Log Aggregation

Configure Winston to send logs to external services:

```typescript
// Winston config for production
import { transports } from "winston";

const winstonConfig = {
  transports: [
    // Console for immediate debugging
    new transports.Console(),
    // File for persistence
    new transports.DailyRotateFile({ filename: "logs/application-%DATE%.log" }),
    // External service (e.g., Datadog, Loggly, etc.)
    new transports.Http({
      host: "logs.example.com",
      path: "/api/logs",
      auth: { username: "xxx", password: "yyy" },
    }),
  ],
};
```

---

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to git
- Use secrets management (HashiCorp Vault, AWS Secrets Manager, etc.)
- Rotate secrets regularly

### 2. Database Security

```sql
-- Enable SSL/TLS for database connections
ALTER DATABASE ordo_todo SET sslmode = 'require';

-- Create read-only user for analytics
CREATE USER ordo_readonly WITH PASSWORD 'xxx';
GRANT CONNECT ON DATABASE ordo_todo TO ordo_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ordo_readonly;
```

### 3. Firewall Configuration

```bash
# UFW rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3101/tcp  # Backend (internal only)
sudo ufw enable
```

### 4. Rate Limiting

Configure rate limits in production:

```typescript
// app.module.ts
ThrottlerModule.forRoot([
  {
    name: "auth",
    ttl: 60000, // 1 minute
    limit: 10, // 10 requests
  },
  {
    name: "short",
    ttl: 10000, // 10 seconds
    limit: 5, // 5 requests
  },
  {
    name: "default",
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests
  },
]);
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is open
sudo netstat -tlnp | grep 5432

# Test connection
psql -U ordo_user -d ordo_todo -h localhost
```

#### 2. PM2 Application Not Starting

```bash
# Check PM2 logs
pm2 logs ordo-backend --err

# Check if port is in use
sudo netstat -tlnp | grep 3101

# Restart PM2
pm2 restart ordo-backend
```

#### 3. High Memory Usage

```bash
# Check memory usage
pm2 monit

# Check for memory leaks
node --inspect dist/main.js

# Adjust memory limits
pm2 restart ordo-backend --max-memory-restart=2G
```

#### 4. 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:3101/health

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Performance Tuning

### Node.js Performance

```bash
# Set environment variables
export NODE_OPTIONS="--max-old-space-size=2048"
export UV_THREADPOOL_SIZE=4
export NODE_ENV=production
```

### PostgreSQL Performance

```sql
-- Analyze database
ANALYZE;

-- Reindex database
REINDEX DATABASE ordo_todo;

-- Vacuum database
VACUUM ANALYZE;
```

### Caching Strategy

- Use Redis for session storage
- Cache frequently accessed data
- Implement CDN for static assets
- Enable Nginx caching for GET requests

---

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump -U ordo_user -h localhost ordo_todo > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U ordo_user -h localhost ordo_todo < backup_20250101.sql

# Automated backup with cron
0 2 * * * pg_dump -U ordo_user ordo_todo > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Application Backup

```bash
# Backup application
tar -czf ordo-backend_$(date +%Y%m%d).tar.gz /path/to/apps/backend

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 /backups/pm2_dump_$(date +%Y%m%d).json
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and migrations run
- [ ] Application built successfully
- [ ] PM2 process started
- [ ] Nginx configured and reloaded
- [ ] SSL/TLS certificates installed
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Firewall rules configured
- [ ] Log rotation configured
- [ ] Rate limiting tested
- [ ] Error monitoring setup
- [ ] Documentation updated

---

## Additional Resources

- [NestJS Deployment Guide](https://docs.nestjs.com/techniques/deployment)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Best Practices](https://www.nginx.com/blog/tuning-nginx/)

---

## Support

For deployment issues, refer to:

- GitHub Issues: https://github.com/your-org/ordo-todo/issues
- Documentation: https://docs.ordo-todo.com
- Email: support@ordo-todo.com
