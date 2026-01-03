# Backend Performance Guide

Comprehensive performance optimization guide for the Ordo-Todo NestJS backend.

**Last Updated:** 2026-01-03

---

## Table of Contents

1. [Database Query Optimization](#database-query-optimization)
2. [Caching Strategy](#caching-strategy)
3. [API Performance](#api-performance)
4. [Monitoring & Metrics](#monitoring--metrics)
5. [Performance Testing](#performance-testing)

---

## Database Query Optimization

### Index Usage

**Location:** `packages/db/prisma/schema.prisma`

Proper indexing is critical for query performance. The following indexes are currently applied:

```prisma
model Task {
  id          String   @id @default(cuid())
  ownerId    String
  projectId  String?
  status     TaskStatus
  priority   Priority

  @@index([ownerId, projectId])  // Composite: User's tasks in project
  @@index([ownerId, status])     // Composite: User's tasks by status
  @@index([projectId])           // Single: All tasks in project
}
```

### Index Guidelines

**When to add indexes:**
- Columns used in WHERE clauses frequently
- Columns used in JOIN conditions
- Columns used for ORDER BY
- Foreign key columns

**Index types:**
- **Single column:** `@@index([column])`
- **Composite:** `@@index([col1, col2])` - Order matters!
- **Unique:** `@@unique([col1, col2])`

### Query Patterns

#### ✅ Efficient Queries

```typescript
// GOOD: Use select to limit fields
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  select: { id: true, title: true, status: true },
});

// GOOD: Use pagination
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  take: limit,
  skip: (page - 1) * limit,
});

// GOOD: Use cursor-based pagination for large datasets
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  take: limit,
  cursor: { id: lastTaskId },
  orderBy: { createdAt: 'asc' },
});
```

#### ❌ Inefficient Queries

```typescript
// BAD: N+1 problem - querying in a loop
for (const task of tasks) {
  const comments = await this.prisma.comment.findMany({
    where: { taskId: task.id },
  });
}

// GOOD: Use include or select with relations
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  include: { comments: true },
});

// BAD: Fetching all columns when only a few are needed
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
});
// Returns all 20+ columns

// GOOD: Select only what you need
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  select: { id: true, title: true },
});
```

### N+1 Query Prevention

**Problem:** Querying related data in a loop

```typescript
// BAD: N+1 queries
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
});

for (const task of tasks) {
  // This runs a query for EACH task
  const comments = await this.prisma.comment.findMany({
    where: { taskId: task.id },
  });
}
```

**Solution 1:** Use `include`

```typescript
// GOOD: Single query with include
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  include: { comments: true },
});
```

**Solution 2:** Batch queries with `findMany`

```typescript
// GOOD: Two queries instead of N+1
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
});

const taskIds = tasks.map(t => t.id);
const comments = await this.prisma.comment.findMany({
  where: { taskId: { in: taskIds } },
});

// Map comments to tasks
const tasksWithComments = tasks.map(task => ({
  ...task,
  comments: comments.filter(c => c.taskId === task.id),
}));
```

### Query Analysis

**Analyze query performance:**

```bash
# Enable Prisma query logging
# .env
DEBUG="prisma:query"

# Or use EXPLAIN ANALYZE (PostgreSQL)
npx prisma db execute --sql "EXPLAIN ANALYZE SELECT * FROM \"Task\" WHERE \"ownerId\" = 'user-123'"
```

**Look for:**
- Sequential scans (should use Index Scan)
- High execution time (>100ms)
- Large row counts returned

---

## Caching Strategy

### Current Implementation

**Location:** `apps/backend/src/cache/cache.service.ts`

**Cache Provider:** Cache Manager (in-memory)

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
```

### Cache Usage Patterns

#### 1. Cache-Aside (Lazy Loading)

```typescript
async getWorkspace(id: string): Promise<Workspace> {
  // 1. Try cache first
  const cached = await this.cacheService.get(`workspace:${id}`);
  if (cached) return cached;

  // 2. Cache miss - fetch from DB
  const workspace = await this.prisma.workspace.findUnique({
    where: { id },
  });

  // 3. Store in cache for future requests
  await this.cacheService.set(`workspace:${id}`, workspace, 300); // 5 min TTL

  return workspace;
}
```

#### 2. Write-Through Cache

```typescript
async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<Workspace> {
  // 1. Update database
  const workspace = await this.prisma.workspace.update({
    where: { id },
    data,
  });

  // 2. Update cache immediately
  await this.cacheService.set(`workspace:${id}`, workspace, 300);

  return workspace;
}
```

#### 3. Cache Invalidation

```typescript
async deleteWorkspace(id: string): Promise<void> {
  // 1. Delete from database
  await this.prisma.workspace.delete({
    where: { id },
  });

  // 2. Invalidate cache
  await this.cacheService.del(`workspace:${id}`);

  // 3. Also invalidate related caches
  await this.cacheService.del(`workspace:${id}:members`);
  await this.cacheService.del(`workspace:${id}:projects`);
}
```

### Cache Key Design

**Pattern:** `{resource}:{id}:{optional-variant}`

```typescript
// Examples
`user:${userId}`                           // User profile
`workspace:${workspaceId}`                 // Workspace data
`workspace:${workspaceId}:members`         // Workspace members
`tasks:${userId}:pending`                  // User's pending tasks
`analytics:${userId}:daily:${date}`        // Daily metrics
`timer:${userId}:active`                   // Active timer
```

### TTL Guidelines

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User profile | 15 min | Changes infrequently |
| Workspace data | 5 min | Moderate change frequency |
| Tasks list | 1 min | Changes frequently |
| Analytics metrics | 5 min | Calculated infrequently |
| Active timer | 30s | Real-time data |
| Static data (constants) | 1 hour | Rarely changes |

### Cache Invalidation Strategies

#### Strategy 1: Time-Based expiration (TTL)

```typescript
// Simple - let cache expire
await this.cacheService.set(key, value, 300); // 5 minutes
```

#### Strategy 2: Event-Based invalidation

```typescript
// Invalidate when data changes
@OnEvent('task.updated')
async handleTaskUpdated(payload: { taskId: string }) {
  await this.cacheService.del(`task:${payload.taskId}`);
  await this.cacheService.del(`tasks:${userId}:*`); // Wildcard not supported, use pattern
}
```

#### Strategy 3: Tag-Based invalidation (Advanced)

```typescript
// Assign tags to cached items
await this.cacheService.set(`task:${id}`, task, 300, {
  tags: [`task:${id}`, `user:${userId}`, `project:${projectId}`],
});

// Invalidate by tag
await this.cacheService.store.delByTag(`project:${projectId}`);
```

### Production Caching

**For production scaling, use Redis:**

```bash
npm install @nestjs/cache-manager cache-manager-redis-store
npm install ioredis
```

```typescript
// cache.module.ts
import { RedisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: RedisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 300, // Default TTL
      }),
      inject: [ConfigService],
    }),
  ],
})
export class CacheModule {}
```

**Environment Variables:**

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## API Performance

### Response Compression

**Location:** `apps/backend/src/main.ts`

```typescript
import compression from 'compression';

app.use(
  compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6,        // Compression level (0-9, 6 is default)
  }),
);
```

**Benefits:**
- Reduces bandwidth usage by 60-80%
- Faster transfer times for large responses
- Minimal CPU overhead

### Pagination

**Offset-Based Pagination:**

```typescript
// Query: /tasks?page=2&limit=20
const [tasks, total] = await Promise.all([
  this.prisma.task.findMany({
    where: { ownerId: userId },
    take: limit,
    skip: (page - 1) * limit,
  }),
  this.prisma.task.count({ where: { ownerId: userId } }),
]);

return {
  data: tasks,
  meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

**Cursor-Based Pagination (Better for large datasets):**

```typescript
// Query: /tasks?cursor=abc123&limit=20
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  take: limit,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'asc' },
});

return {
  data: tasks,
  nextCursor: tasks.length === limit ? tasks[tasks.length - 1].id : null,
};
```

**Benefits of Cursor-Based:**
- Consistent results even with new data
- Better performance (no offset)
- No duplicate or missed items

### Response Optimization

#### DTO Projection

```typescript
// BAD: Returns all fields (including sensitive ones)
return await this.prisma.user.findUnique({ where: { id } });

// GOOD: Only return necessary fields
return await this.prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    username: true,
    name: true,
    // password is NOT included
  },
});
```

#### Lean Responses

```typescript
// For list views, return minimal data
const tasks = await this.prisma.task.findMany({
  where: { ownerId: userId },
  select: {
    id: true,
    title: true,
    status: true,
    priority: true,
    dueDate: true,
    // Exclude: description, comments, attachments, etc.
  },
});
```

### ETags for Caching

```typescript
@Controller('tasks')
export class TasksController {
  @Get()
  async findAll(@Headers('if-none-match') ifNoneMatch?: string) {
    const tasks = await this.tasksService.findAll();

    // Generate ETag from content
    const etag = crypto
      .createHash('md5')
      .update(JSON.stringify(tasks))
      .digest('hex');

    // Return 304 if ETag matches
    if (ifNoneMatch === etag) {
      throw new NotModifiedException();
    }

    return new JsonResp(tasks, {
      headers: { 'ETag': etag },
    });
  }
}
```

---

## Monitoring & Metrics

### Application Metrics

**Location:** `apps/backend/src/common/services/metrics.service.ts`

```typescript
@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  constructor() {
    this.registry.registerMetric(this.requestCounter);
  }

  incrementRequest(method: string, route: string, status: number) {
    this.requestCounter.inc({
      method,
      route,
      status: status.toString(),
    });
  }
}
```

### Logging Performance

**Use correlation IDs to trace requests:**

```typescript
// middleware/correlation-id.middleware.ts
@Injectable()
export class CorrelationIdMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.headers['x-correlation-id'] || randomUUID();
    req['correlationId'] = id;
    res.setHeader('X-Correlation-ID', id);
    next();
  }
}

// Logging with correlation ID
this.logger.log({
  correlationId: req['correlationId'],
  message: 'Processing request',
  duration: `${Date.now() - startTime}ms`,
});
```

### Performance Monitoring Tools

#### 1. APM (Application Performance Monitoring)

**Recommended:**
- **New Relic** - Comprehensive APM
- **DataDog** - Infrastructure + APM
- **Prometheus + Grafana** - Open-source stack

#### 2. Database Monitoring

```typescript
// Log slow queries
this.prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  if (after - before > 100) {
    this.logger.warn(`Slow query detected: ${after - before}ms`, {
      model: params.model,
      action: params.action,
    });
  }

  return result;
});
```

#### 3. Response Time Tracking

```typescript
// interceptor/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log({
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
          status: 'slow' ? duration > 1000 : 'ok',
        });
      }),
    );
  }
}
```

---

## Performance Testing

### Load Testing with Artillery

**Install Artillery:**

```bash
npm install -g artillery
```

**Test Configuration:** `load-test.yml`

```yaml
config:
  target: "http://localhost:3101"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 requests per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50  # 50 requests per second
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100 # 100 requests per second
      name: "Spike"

scenarios:
  - name: "Get Tasks"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@test.com"
            password: "SecurePass123!"
          capture:
            - json: "$.accessToken"
              as: "token"
      - get:
          url: "/api/v1/tasks"
          headers:
            Authorization: "Bearer {{ token }}"
```

**Run Test:**

```bash
artillery run load-test.yml
```

### Benchmarking

**Compare before/after:**

```bash
# Before optimization
artillery run before-test.yml > before-results.json

# After optimization
artillery run after-test.yml > after-results.json

# Compare
echo "Before:"
cat before-results.json | jq '.aggregate.scenarios["Get Tasks"].count'
echo "After:"
cat after-results.json | jq '.aggregate.scenarios["Get Tasks"].count'
```

### Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **API Response Time** | < 200ms (p95) | Artillery, APM |
| **Database Query Time** | < 100ms (p95) | Prisma logging, EXPLAIN |
| **Memory Usage** | < 512MB | process.memoryUsage() |
| **CPU Usage** | < 70% (avg) | htop, APM |
| **Error Rate** | < 0.1% | Logging, monitoring |

---

## Performance Checklist

### Database Optimization
- [ ] All foreign keys have indexes
- [ ] Composite indexes for common query patterns
- [ ] No N+1 queries (use include/select)
- [ ] Query response time < 100ms
- [ ] Use pagination for list endpoints
- [ ] Use cursor-based pagination for large datasets

### Caching
- [ ] Cache frequently accessed data
- [ ] Appropriate TTL for each data type
- [ ] Cache invalidation on mutations
- [ ] Consider Redis for production scaling
- [ ] Monitor cache hit/miss ratio

### API Performance
- [ ] Response compression enabled
- [ ] ETags for GET requests
- [ ] Lean DTOs (only necessary fields)
- [ ] Pagination on all list endpoints
- [ ] Rate limiting to prevent abuse

### Monitoring
- [ ] Request logging with duration
- [ ] Slow query logging (>100ms)
- [ ] Error tracking (Sentry, etc.)
- [ ] APM metrics (New Relic, DataDog)
- [ ] Regular load testing

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security implementation
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Planned enhancements
