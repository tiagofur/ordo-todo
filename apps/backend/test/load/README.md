# Load Testing with k6

This directory contains load testing scripts for the Ordo-Todo backend using [k6](https://k6.io/).

## Prerequisites

1. **Install k6**:

   ```bash
   # macOS
   brew install k6

   # Windows
   choco install k6

   # Linux
   sudo apt-get install k6

   # Or download from https://k6.io/download/
   ```

2. **Start the backend**:
   ```bash
   cd apps/backend
   npm run start:prod
   ```

## Available Test Scripts

### 1. Auth Load Test (`auth-load-test.js`)

Tests authentication endpoints under constant load.

**Endpoints tested**:

- `POST /auth/refresh` - Refresh JWT tokens
- `POST /auth/check-username` - Check username availability

**Configuration**:

- 50 VUs (Virtual Users)
- Duration: 2 minutes
- Thresholds: 95th percentile < 500ms, error rate < 5%

### 2. Tasks Load Test (`tasks-load-test.js`)

Tests task management endpoints under constant load.

**Endpoints tested**:

- `POST /tasks` - Create task
- `GET /tasks` - List tasks
- `PATCH /tasks/:id` - Update task
- `GET /tasks/today` - Get today's tasks
- `PATCH /tasks/:id/complete` - Complete task

**Setup**:

- Creates a new user and project for testing
- Creates tags for task categorization

**Configuration**:

- 100 VUs
- Duration: 5 minutes
- Thresholds: 95th percentile < 500ms, error rate < 5%

### 3. Stress Test (`stress-test.js`)

Ramping load test to identify system breaking points.

**Endpoints tested**:

- `POST /auth/check-username` - Lightweight public endpoint
- `GET /health` - Health check endpoint

**Configuration**:

- Ramps from 0 to 100 VUs in 2 minutes
- Ramps to 200 VUs over 5 minutes
- Ramps down to 0 VUs in 2 minutes
- Thresholds: 95th percentile < 1s, error rate < 10%

## Running Tests

### Basic Usage

Run a test with default configuration:

```bash
k6 run test/load/auth-load-test.js
```

Run with custom base URL:

```bash
k6 run --env BASE_URL=https://api.example.com test/load/tasks-load-test.js
```

### With Output Options

Save results to JSON:

```bash
k6 run --out json=results.json test/load/auth-load-test.js
```

Generate HTML report:

```bash
k6 run --out json=results.json test/load/tasks-load-test.js
# Then use https://grafana.com/docs/k6/latest/results-output/visualization/html-report/
```

### Script-Specific Runs

```bash
# Auth load test (50 VUs, 2 min)
k6 run test/load/auth-load-test.js

# Tasks load test (100 VUs, 5 min)
k6 run test/load/tasks-load-test.js

# Stress test (ramping to 200 VUs)
k6 run test/load/stress-test.js
```

## Understanding Metrics

### Custom Metrics

Each test tracks these custom metrics:

- **errors**: Rate of failed requests
- **response_time**: Trend of response times

Tasks load test additionally tracks:

- **tasks_created**: Counter of tasks created
- **tasks_updated**: Counter of tasks updated
- **tasks_completed**: Counter of tasks completed

### Built-in k6 Metrics

k6 automatically provides:

- `http_req_duration`: Total request duration
- `http_reqs`: Total requests
- `vus`: Current virtual users
- `iterations`: Total iterations

### Thresholds

Each test defines thresholds:

- `p(95)`: 95th percentile response time
- `p(99)`: 99th percentile response time
- `rate<0.05`: Error rate must be less than 5%

If thresholds fail, the test exits with a non-zero status.

## Best Practices

### 1. Use Test Databases

Always run load tests against a separate test database:

```bash
DATABASE_URL="postgresql://user:pass@test-host:5432/ordo_todo_test" npm run start:prod
```

### 2. Monitor Backend Logs

While tests run, monitor backend logs:

```bash
tail -f apps/backend/logs/combined.log
```

### 3. Monitor System Resources

Use tools to monitor CPU, memory, and database:

```bash
# macOS/Linux
top

# Windows
Task Manager

# PostgreSQL queries
docker exec -it <postgres-container> psql -U postgres -d ordo_todo -c "SELECT * FROM pg_stat_activity;"
```

### 4. Start Small, Scale Up

1. Run with 10 VUs first
2. Check logs and metrics
3. Increase to target VUs gradually
4. Identify bottlenecks

### 5. Clean Up Test Data

After tests, clean up test data:

```bash
# Via SQL (delete load test users)
psql -U postgres -d ordo_todo -c "DELETE FROM \"User\" WHERE email LIKE '%loadtest%';"
```

## Continuous Integration

Add to CI pipeline (`.github/workflows/ci.yml`):

```yaml
- name: Run load tests
  run: |
    npm run start:prod &
    sleep 10
    k6 run test/load/auth-load-test.js
    k6 run test/load/tasks-load-test.js
```

## Troubleshooting

### Connection Refused

Make sure the backend is running:

```bash
curl http://localhost:3101/health
```

### Too Many Requests

If you hit rate limits:

1. Reduce VUs in test script
2. Increase rate limiting in `app.module.ts`
3. Run tests against staging environment

### Database Deadlocks

If you see database deadlocks:

1. Reduce concurrent operations
2. Use database connection pooling
3. Add indexes to frequently queried fields

### Out of Memory

If tests crash with OOM:

1. Reduce VUs
2. Increase Node.js heap size: `NODE_OPTIONS="--max-old-space-size=4096"`
3. Check for memory leaks in code

## Interpreting Results

### Good Results

- Error rate < 5%
- 95th percentile < 500ms
- 99th percentile < 1s
- No memory leaks
- CPU usage < 80%

### Need Optimization

- Error rate 5-10%
- 95th percentile 500ms-1s
- CPU usage 80-100%

### Critical Issues

- Error rate > 10%
- 95th percentile > 1s
- OOM errors
- Database deadlocks

## Next Steps

1. **Add More Scenarios**: Create tests for other endpoints (projects, workspaces, timers)
2. **Soak Testing**: Run tests for extended periods (1-24 hours)
3. **Spike Testing**: Test sudden traffic spikes
4. **Volume Testing**: Test with large datasets (10k+ tasks)
5. **Isolation Testing**: Test individual components in isolation

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)
