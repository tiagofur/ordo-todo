# Redis Setup and Configuration Guide

This guide covers Redis integration for production-scale caching in the Ordo-Todo backend.

## Overview

Redis provides:
- **Distributed Caching** - Share cache across multiple backend instances
- **Pub/Sub** - Coordinate cache invalidation across instances
- **Performance** - Sub-millisecond read/write latency
- **Persistence** - Optional data persistence for reliability
- **Scalability** - Handle increased load horizontally

---

## Quick Start

### 1. Installation

```bash
cd apps/backend
npm install redis@4 @types/redis@4
```

### 2. Environment Configuration

Add to `.env`:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Optional: Redis password
# REDIS_URL=redis://:password@localhost:6379

# Optional: Redis Cloud (managed service)
# REDIS_URL=rediss://username:password@redis-12345.cloud.redislabs.com:6379
```

### 3. Docker Compose (Local Development)

Add to `docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

Start Redis:
```bash
docker-compose up -d redis
```

### 4. Import RedisModule

In `app.module.ts`:

```typescript
import { RedisModule } from './cache/redis.module';

@Module({
  imports: [
    // ... other imports
    RedisModule,
  ],
})
export class AppModule {}
```

### 5. Use RedisService

```typescript
import { RedisService } from '../cache/redis.service';

@Injectable()
export class TasksService {
  constructor(private readonly redisService: RedisService) {}

  async findAll(userId: string) {
    const cacheKey = `tasks:${userId}`;

    // Try cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const tasks = await this.prisma.task.findMany({
      where: { ownerId: userId },
    });

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, tasks, 300);

    return tasks;
  }

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({ data: dto });

    // Invalidate user's task cache
    await this.redisService.delPattern(`tasks:${dto.ownerId}`);

    return task;
  }
}
```

---

## Production Deployment

### Option 1: Self-Hosted Redis (VPS/Dedicated Server)

#### System Requirements
- CPU: 2+ cores
- RAM: 2-4 GB (depends on cache size)
- Disk: SSD for persistence (optional)

#### Configuration

```bash
# /etc/redis/redis.conf

# Memory limit (important!)
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence (optional, for reliability)
save 900 1
save 300 10
save 60 10000

# Networking
bind 0.0.0.0
protected-mode yes
requirepass your-strong-password

# Logging
loglevel notice
logfile /var/log/redis/redis.log
```

Start Redis:
```bash
redis-server /etc/redis/redis.conf
```

### Option 2: Redis Cloud (Managed Service)

**Recommended for production**

1. Sign up at https://redis.com/try-free/
2. Create a new database
3. Get connection string
4. Add to `.env`:
   ```bash
   REDIS_URL=rediss://xxx:xxx@xxx.redis.cloud.redislabs.com:6379
   ```

**Benefits:**
- ✅ Automatic backups
- ✅ High availability (replication)
- ✅ Managed scaling
- ✅ Security (TLS, private endpoints)
- ✅ Monitoring dashboard

### Option 3: AWS ElastiCache

```bash
# AWS CLI
aws elasticache create-replication-group \
  --replication-group-id ordo-todo-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --cache-parameter-group-name default.redis7 \
  --automatic-failover-enabled \
  --multi-az-zone-availability-zone-ids us-east-1a,us-east-1b
```

---

## Configuration Options

### Cache Service Switching

The app can use either in-memory or Redis cache based on environment:

```typescript
// In development: use in-memory (simpler)
// In production: use Redis (distributed)

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('RedisService') private redisService: RedisService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    // Try Redis first
    if (this.redisService.isConnected) {
      return await this.redisService.get<T>(key);
    }

    // Fallback to in-memory
    return this.cacheManager.get<T>(key);
  }
}
```

### TTL Guidelines

Recommended TTL values (in seconds):

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Tasks | 300 (5 min) | Tasks change frequently |
| Projects | 600 (10 min) | Projects change less often |
| Workspaces | 1800 (30 min) | Workspaces are stable |
| Daily Metrics | 900 (15 min) | Analytics update periodically |
| User Data | 3600 (1 hour) | User profiles stable |
| Rate Limits | 60 (1 min) | Rate limit windows |
| Auth Tokens | 7200 (2 hours) | Token rotation period |

**Formula:**
```
TTL = frequency_of_change × acceptable_staleness
```

---

## Monitoring

### Health Check Endpoint

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get('redis')
  async checkRedis() {
    const health = await this.redisService.healthCheck();
    return {
      status: health.status,
      latency: health.latency,
      timestamp: new Date(),
    };
  }

  @Get('cache/metrics')
  async getCacheMetrics() {
    return this.redisService.getMetrics();
  }
}
```

### Prometheus Metrics

Add to `main.ts`:

```typescript
import { PrometheusService } from '../monitoring/prometheus.service';

// Expose cache metrics
app.get('/metrics', async (req, res) => {
  const metrics = redisService.getMetrics();
  res.send(metrics);
});
```

### Alerts

Set up alerts for:
- **Redis disconnected** - Critical
- **Hit rate < 50%** - Warning (cache not effective)
- **Latency > 10ms** - Warning (performance degradation)
- **Error rate > 1%** - Critical

---

## Performance Tuning

### Memory Optimization

```bash
# Max memory (prevents OOM)
maxmemory 2gb

# Eviction policy
maxmemory-policy allkeys-lru
```

**Eviction Policies:**
- `allkeys-lru` - Evict least recently used keys (recommended)
- `volatile-lru` - Evict LRU among keys with TTL
- `allkeys-random` - Evict random keys

### Connection Pooling

```typescript
const redisOptions: Redis.RedisClientOptions = {
  url: process.env.REDIS_URL,
  socket: {
    keepAlive: 30000,    // 30 seconds
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Max retries exceeded');
      return Math.min(retries * 100, 3000);
    },
  },
};
```

### Pipeline Optimization

For bulk operations:

```typescript
async function warmCache(data: Record<string, any>) {
  const pipeline = redisService.client.multi();

  for (const [key, value] of Object.entries(data)) {
    pipeline.setEx(key, 300, JSON.stringify(value));
  }

  await pipeline.exec();
}
```

---

## Pub/Sub Cache Invalidation

Coordinate cache invalidation across multiple instances:

### Publisher (When cache changes)

```typescript
async invalidateWorkspace(workspaceId: string) {
  // Delete local cache
  await this.redisService.delPattern(`workspace:${workspaceId}`);

  // Notify other instances
  await this.redisService.publish('cache:invalidate', {
    type: 'workspace',
    id: workspaceId,
    pattern: `workspace:${workspaceId}`,
  });
}
```

### Subscriber (On module init)

```typescript
async onModuleInit() {
  await this.connect();

  // Subscribe to invalidation messages
  await this.subscribe('cache:invalidate', async (message) => {
    if (message.type === 'workspace') {
      await this.delPattern(message.pattern);
    }
  });
}
```

---

## Scaling Strategies

### Horizontal Scaling

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Backend 1   │     │ Backend 2   │     │ Backend 3   │
│             │     │             │     │             │
│  L1 Cache   │     │  L1 Cache   │     │  L1 Cache   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │  ← L2 Cache
                    │   Cluster   │
                    └─────────────┘
```

**Benefits:**
- L1 cache (in-memory) for ultra-fast access
- L2 cache (Redis) for shared data
- Cache consistency via Pub/Sub

### Redis Cluster (High Availability)

```bash
# Create Redis cluster with 3 masters + 3 replicas
redis-cli --cluster create \
  127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 \
  127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 \
  --cluster-replicas 1
```

---

## Security Best Practices

### 1. Network Isolation

```bash
# Bind to localhost only (if backend and Redis on same host)
bind 127.0.0.1

# Or use firewall rules
iptables -A INPUT -p tcp --dport 6379 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP
```

### 2. Authentication

```bash
# Set strong password
requirepass your-super-strong-random-password-here

# Require AUTH command
protected-mode yes
```

### 3. TLS Encryption

```bash
# Use rediss:// (TLS) instead of redis:// (plaintext)
REDIS_URL=rediss://username:password@host:6379
```

### 4. Disable Dangerous Commands

```bash
# In redis.conf
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

---

## Testing

### Unit Tests

```typescript
describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'REDIS_URL') return 'redis://localhost:6379';
              if (key === 'REDIS_ENABLED') return 'true';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should set and get values', async () => {
    await service.set('test-key', { data: 'value' }, 60);
    const result = await service.get('test-key');
    expect(result).toEqual({ data: 'value' });
  });
});
```

### Integration Tests

```typescript
it('should coordinate cache invalidation', async (done) => {
  const service1 = app.get<RedisService>(RedisService);
  const service2 = app.get<RedisService>(RedisService);

  // Service 2 subscribes
  await service2.subscribe('cache:invalidate', (msg) => {
    expect(msg.id).toBe('ws-123');
    done();
  });

  // Service 1 publishes
  await service1.publish('cache:invalidate', {
    type: 'workspace',
    id: 'ws-123',
  });
});
```

---

## Troubleshooting

### Problem: Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Or start Redis
docker-compose up -d redis
```

### Problem: High Memory Usage

```
Redis using too much memory
```

**Solution:**
```bash
# Check memory usage
redis-cli INFO memory

# Set maxmemory limit
redis-cli CONFIG SET maxmemory 2gb

# Choose eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Problem: Slow Operations

```
Redis operations are slow (>10ms)
```

**Solution:**
```bash
# Check slow log
redis-cli SLOWLOG GET 10

# Disable keys command (production)
# Use SCAN instead
redis-cli --scan --pattern 'tasks:*'
```

---

## Migration Plan

### Phase 1: Development (Optional)
1. Install Redis locally
2. Test with `REDIS_ENABLED=true`
3. Verify cache invalidation

### Phase 2: Staging
1. Deploy Redis (managed or self-hosted)
2. Update staging environment variables
3. Load test with Redis
4. Monitor metrics

### Phase 3: Production
1. Deploy Redis cluster (high availability)
2. Update production environment variables
3. Enable Redis gradually (feature flag)
4. Monitor for 1 week
5. Remove old in-memory cache

### Rollback Plan

If Redis causes issues:
```bash
# Disable Redis instantly
REDIS_ENABLED=false

# App will fallback to in-memory cache
# No downtime required
```

---

## Summary

✅ **Redis service created** with comprehensive features
✅ **Pub/Sub support** for multi-instance coordination
✅ **Health checks** and monitoring
✅ **Graceful fallback** to in-memory cache
✅ **Security best practices** documented
✅ **Production deployment guides** for all platforms

**Next Steps:**
1. Install Redis in development environment
2. Test Redis integration locally
3. Deploy Redis to staging
4. Enable in production with feature flag
5. Monitor metrics and optimize

**Performance Improvement:**
- Development: In-memory cache (~1ms)
- Production (single instance): In-memory cache (~1ms)
- Production (multi-instance): Redis (~5ms, but consistent)

Redis trades slight latency increase for cache consistency across instances, which is critical for horizontal scaling.
