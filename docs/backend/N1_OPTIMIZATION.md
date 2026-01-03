# N+1 Query Optimization Guide

This document provides a comprehensive analysis of N+1 query patterns in the codebase, prevention strategies, and optimization techniques.

## What are N+1 Queries?

An N+1 query occurs when:
1. You fetch N records with one query
2. Then make N additional queries to fetch related data for each record
3. Total: 1 + N queries instead of 1 optimized query

### Example of N+1 Query Problem

```typescript
// ❌ BAD: N+1 Query Pattern
const tasks = await prisma.task.findMany({ where: { ownerId: userId } });
// Query 1: SELECT * FROM "Task" WHERE "ownerId" = ?

for (const task of tasks) {
  const project = await prisma.project.findUnique({ where: { id: task.projectId } });
  // Query 2, 3, 4... N: SELECT * FROM "Project" WHERE "id" = ?

  const assignee = await prisma.user.findUnique({ where: { id: task.assigneeId } });
  // Query N+1, N+2... 2N: SELECT * FROM "User" WHERE "id" = ?
}

// For 100 tasks: 1 + 100 + 100 = 201 queries!
```

---

## Current Status

**Last Analyzed:** 2026-01-03
**N+1 Risk Level:** 🟢 Low (Good Prisma practices)
**Status:** Repository pattern prevents most N+1 issues

---

## Analysis by Service

### Tasks Service ✅ OPTIMIZED

**Current Implementation:** Uses `PrismaTaskRepository`

**Query Pattern:**
```typescript
// ✅ GOOD: Uses includes to fetch relations in single query
await this.prisma.task.findMany({
  where: { ownerId: userId },
  include: {
    project: { select: { id: true, name: true, color: true } },
    assignee: { select: { id: true, name: true, image: true } },
    owner: { select: { id: true, name: true, image: true } },
    tags: { include: { tag: true } },
    subTasks: true,
  },
});

// Single query with JOINs - no N+1!
// Result: 1 query instead of 1 + N + N + N
```

**Performance:**
- ✅ All relations fetched in single query
- ✅ Uses `select` to limit columns (reduces data transfer)
- ✅ Efficient for typical task list views

---

### Users Service ✅ OPTIMIZED

**Current Implementation:** Direct Prisma calls with explicit `select`

**Query Pattern:**
```typescript
// ✅ GOOD: Explicit selects, no N+1
await this.prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    username: true,
    // ... specific fields only
    subscription: true,
    integrations: true,
    preferences: true,
  },
});
```

**Performance:**
- ✅ Single query per operation
- ✅ No loop-based queries
- ✅ Efficient data fetching

---

### Workspaces Service ✅ OPTIMIZED

**Current Implementation:** Workspace repository with complex queries

**Query Pattern:**
```typescript
// ✅ GOOD: Batch fetching with includes
await this.prisma.workspace.findMany({
  where: { OR: [...] },
  include: {
    members: {
      include: {
        user: { select: { id: true, name: true } },
      },
    },
    projects: { select: { id: true, name: true } },
  },
});
```

**Performance:**
- ✅ Uses includes for nested relations
- ✅ Selects only needed fields
- ✅ Efficient workspace loading

---

### Timers Service ✅ OPTIMIZED

**Current Implementation:** Repository pattern with batch queries

**Query Pattern:**
```typescript
// ✅ GOOD: Date range queries with proper indexing
await this.prisma.timeSession.findMany({
  where: {
    userId,
    startTime: { gte: startDate, lte: endDate },
  },
  orderBy: { startTime: 'desc' },
});
```

**Performance:**
- ✅ Indexed queries (userId, startTime)
- ✅ No N+1 patterns
- ✅ Efficient date filtering

---

## Common N+1 Patterns to Avoid

### ❌ Pattern 1: Loop-based Queries

```typescript
// BAD: Query in loop
const workspaces = await prisma.workspace.findMany({
  where: { ownerId: userId },
});

for (const ws of workspaces) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: ws.id },
  });
}
```

**Solution:**
```typescript
// GOOD: Use include
const workspaces = await prisma.workspace.findMany({
  where: { ownerId: userId },
  include: {
    members: {
      include: { user: true },
    },
  },
});
```

---

### ❌ Pattern 2: Lazy Loading Associations

```typescript
// BAD: Fetch associations separately
const tasks = await prisma.task.findMany();

for (const task of tasks) {
  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
  });
}
```

**Solution:**
```typescript
// GOOD: Eager load with include
const tasks = await prisma.task.findMany({
  include: {
    project: true,
  },
});
```

---

### ❌ Pattern 3: Dynamic Property Access

```typescript
// BAD: Fetch properties one by one
const user = await prisma.user.findUnique({ where: { id: userId } });

if (includeSubscription) {
  user.subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
}

if (includeIntegrations) {
  user.integrations = await prisma.integration.findMany({
    where: { userId: user.id },
  });
}
```

**Solution:**
```typescript
// GOOD: Build include object dynamically
const include: any = {};

if (includeSubscription) {
  include.subscription = true;
}

if (includeIntegrations) {
  include.integrations = true;
}

const user = await prisma.user.findUnique({
  where: { id: userId },
  include,
});
```

---

## Optimization Techniques

### 1. Use `include` for Eager Loading

```typescript
// ✅ Fetch all relations in one query
const tasks = await prisma.task.findMany({
  include: {
    project: true,
    assignee: true,
    tags: { include: { tag: true } },
  },
});
```

### 2. Use `select` to Limit Columns

```typescript
// ✅ Only fetch needed columns
const tasks = await prisma.task.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    project: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

### 3. Batch Loading with `findMany`

Instead of fetching one-by-one:
```typescript
// ❌ BAD
const tasks = await prisma.task.findMany();
for (const task of tasks) {
  const comments = await prisma.comment.findMany({
    where: { taskId: task.id },
  });
}

// ✅ GOOD: Fetch in batches
const taskIds = tasks.map(t => t.id);
const allComments = await prisma.comment.findMany({
  where: { taskId: { in: taskIds } },
});

// Group by taskId
const commentsByTask = groupBy(allComments, 'taskId');
```

### 4. DataLoader Pattern (Advanced)

For complex GraphQL-like scenarios:

```typescript
// Create a DataLoader batch function
const taskLoader = new DataLoader(async (taskIds: string[]) => {
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
  });

  return taskIds.map(id => tasks.find(t => t.id === id));
});

// Use in resolvers
const task = await taskLoader.load(taskId);
```

---

## Prisma-Specific Optimizations

### 1. Select Only Required Fields

```typescript
// ✅ Reduces data transfer
await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    // NOT: password, hashedPassword, etc.
  },
});
```

### 2. Use Prisma's Generated Types

```typescript
// ✅ Type-safe selects
import { Prisma } from '@prisma/client';

const userSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
};

await prisma.user.findUnique({
  where: { id: userId },
  select: userSelect,
});
```

### 3. Leverage Relation Joins

```typescript
// ✅ Prisma generates efficient JOIN queries
await prisma.task.findMany({
  where: { project: { workspace: { ownerId: userId } } },
  include: {
    project: {
      include: {
        workspace: true,
      },
    },
  },
});
// Generates single query with JOINs
```

---

## Detection and Monitoring

### 1. Enable Query Logging

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  logQueries = true  // Add this
}

// Or in code
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### 2. Use Prisma Middleware

```typescript
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);

  // Warn for potential N+1
  if (params.model === 'Task' && params.action === 'findFirst') {
    console.warn('Potential N+1: Multiple findFirst queries');
  }

  return result;
});
```

### 3. Database Query Analysis

```sql
-- Check for repeated queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%Task%'
ORDER BY calls DESC;

-- Should see:
-- 1 query with high calls (good)
-- NOT: many similar queries with low calls (N+1)
```

---

## Prevention Checklist

### Code Review Checklist

- [ ] No queries inside loops
- [ ] All relations use `include` or `select`
- [ ] Batch operations where possible
- [ ] Explicit `select` to limit columns
- [ ] Indexed columns used in WHERE clauses
- [ ] No sequential `findUnique` calls

### Testing Checklist

- [ ] Run with Prisma query logging enabled
- [ ] Check EXPLAIN ANALYZE for slow queries
- [ ] Load test with realistic data volumes
- [ ] Monitor pg_stat_statements for repeated queries

---

## Performance Benchmarks

### Before Optimization (Typical N+1)

```
Fetching 100 tasks with projects and assignees:
- 1 query for tasks
- 100 queries for projects
- 100 queries for assignees
- Total: 201 queries
- Time: ~500-1000ms
```

### After Optimization (Using Includes)

```
Fetching 100 tasks with projects and assignees:
- 1 query with JOINs
- Total: 1 query
- Time: ~10-50ms
- Improvement: 10-100x faster
```

---

## Repository Pattern Benefits

The codebase uses a repository pattern which **prevents most N+1 issues**:

1. **Encapsulation:** Repository methods handle relations internally
2. **Consistent includes:** All queries use standardized includes
3. **Tested patterns:** Repository tests verify query efficiency
4. **Domain mapping:** Efficient Prisma → Domain conversion

### Example: TaskRepository

```typescript
// ✅ GOOD: Repository encapsulates efficient query
class PrismaTaskRepository {
  async findByOwnerId(ownerId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { ownerId },
      include: {
        subTasks: true,
        recurrence: true,
        tags: { include: { tag: true } },
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        owner: { select: { id: true, name: true, image: true } },
      },
    });

    return tasks.map(t => this.toDomain(t));
  }
}
```

---

## Recommendations

### Current Status ✅

The codebase is **well-optimized** for N+1 queries:
- Repository pattern prevents loop-based queries
- Consistent use of `include` for relations
- Proper indexing supports query performance
- No obvious N+1 patterns detected

### Future Improvements

1. **Add Query Monitoring**
   - Enable Prisma query logging in development
   - Set up pg_stat_statements monitoring
   - Alert on repeated query patterns

2. **Performance Testing**
   - Load test with 1000+ tasks
   - Measure query times under load
   - Identify any emerging N+1 issues

3. **Documentation**
   - Document query patterns for new developers
   - Add N+1 prevention to code review checklist
   - Include performance testing in CI/CD

4. **Advanced Optimizations** (if needed)
   - Implement DataLoader for GraphQL-like scenarios
   - Consider cursor-based pagination for large datasets
   - Use `findMany` with `in` operator for batch operations

---

## Summary

✅ **No critical N+1 issues found**
✅ **Repository pattern prevents most problems**
✅ **Prisma includes used consistently**
✅ **Indexes support query performance**

**N+1 Query Risk Level:** 🟢 LOW

The codebase follows Prisma best practices and avoids common N+1 pitfalls through consistent use of the repository pattern and proper relation loading.
