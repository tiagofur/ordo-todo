# Backend Architecture

Comprehensive architecture documentation for the Ordo-Todo NestJS backend.

## Directory Structure

```
apps/backend/src/
├── activities/           # Activity logging module
├── ai/                   # AI/ML features (Gemini)
│   ├── ai.controller.ts
│   ├── ai.module.ts
│   ├── ai.service.ts
│   ├── gemini-ai.service.ts    # Core Gemini integration
│   └── dto/
├── analytics/            # Productivity metrics
├── attachments/          # File attachments
├── auth/                 # Authentication (JWT + Passport)
│   ├── strategies/       # JWT, Local strategies
│   ├── crypto/           # Password hashing
│   └── dto/
├── collaboration/        # Real-time WebSocket
│   └── collaboration.gateway.ts
├── comments/             # Task comments
├── common/               # Shared infrastructure
│   ├── decorators/       # @CurrentUser, @Public, @Roles
│   ├── filters/          # Exception filters
│   ├── guards/           # JwtAuthGuard, WorkspaceGuard, etc.
│   ├── interceptors/     # Logging, Transform
│   ├── logger/           # Winston config
│   └── types/
├── config/               # Environment configuration
├── database/             # Prisma service
├── gamification/         # XP, levels, achievements
├── notifications/        # Smart notifications + cron
├── projects/             # Project management
├── repositories/         # Data access layer
├── tags/                 # Tag management
├── tasks/                # Task CRUD + subtasks
├── templates/            # Task templates
├── timers/               # Pomodoro/continuous timer
├── upload/               # File upload handling
├── users/                # User profile + preferences
├── workflows/            # Workflow phases
├── workspaces/           # Workspace + members
├── app.module.ts         # Root module
└── main.ts               # Application entry
```

## Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── DatabaseModule (global)
├── RepositoriesModule (global)
├── ThrottlerModule (rate limiting)
├── ScheduleModule (cron jobs)
├── WinstonModule (logging)
│
├── AuthModule ─────────────────┐
├── UsersModule ────────────────┤
├── WorkspacesModule ───────────┤
├── ProjectsModule ─────────────┤
├── TasksModule ────────────────┼── All use JwtAuthGuard
├── TimersModule ───────────────┤
├── AnalyticsModule ────────────┤
├── AIModule ───────────────────┤
├── NotificationsModule ────────┤
├── CollaborationModule ────────┘ (WebSocket)
├── GamificationModule
└── TemplatesModule
```

## Security Layers

### 1. Global Guards (app.module.ts)

```typescript
// Applied to ALL routes
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,     // Authentication
},
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard,   // Rate limiting: 100 req/min
}
```

### 2. Resource Guards (per-endpoint)

| Guard | Purpose | Usage |
|-------|---------|-------|
| `JwtAuthGuard` | Verify JWT token | Global (all routes except @Public) |
| `WorkspaceGuard` | Verify workspace membership | Routes with `:workspaceId` |
| `ProjectGuard` | Verify project access | Routes with `:projectId` |
| `TaskGuard` | Verify task access | Routes with `:taskId` |
| `BaseResourceGuard` | Base class for resource guards | Extended by above |

### 3. Role-Based Access

```typescript
@Roles(MemberRole.OWNER, MemberRole.ADMIN)
@UseGuards(WorkspaceGuard)
async sensitiveOperation() { ... }
```

Available roles: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

### 4. Security Headers (main.ts)

- Helmet middleware with all defaults
- CORS configured via `CORS_ORIGINS` environment variable
- Content-Type validation

## Data Flow

```
Request
   │
   ▼
┌─────────────────────┐
│  Global Pipes       │  ValidationPipe (whitelist, transform)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Global Guards      │  JwtAuthGuard → ThrottlerGuard
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Controller         │  Route handling, decorators
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Resource Guards    │  WorkspaceGuard, ProjectGuard, etc.
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Service            │  Business logic
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Repository         │  Prisma data access
└─────────────────────┘
   │
   ▼
Response
```

## Real-Time Communication

### WebSocket Gateway (collaboration.gateway.ts)

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
export class CollaborationGateway {
  // Events:
  // - join-workspace: Subscribe to workspace updates
  // - leave-workspace: Unsubscribe
  // - join-task: Subscribe to task updates
  // - task-update: Broadcast task changes
  // - presence-update: Who's online in workspace
  // - task-presence: Who's viewing a task
}
```

**Authentication**: JWT token via `handshake.auth.token`

## Scheduled Jobs (Cron)

| Job | Schedule | Service |
|-----|----------|---------|
| Check upcoming tasks | Every 10 min | SmartNotificationsService |
| Check long work sessions | Every 30 min | SmartNotificationsService |
| Daily planning reminder | 9am weekdays | SmartNotificationsService |

## Productivity Analytics System

### Auto-Tracking Functionality

The analytics system automatically tracks user productivity metrics without manual input.

**When Metrics are Tracked:**
1. **Timer Sessions**: When a Pomodoro/continuous timer session is stopped
2. **Task Completion**: When a task is marked as DONE
3. **Daily Updates**: Automatic calculation of daily metrics

**Implementation** (`timers/timers.service.ts`):

```typescript
// Auto-triggered on timer stop
await this.calculateFocusScoreUseCase.execute({
  timeSessionId: session.id,
  userId,
});

await this.updateDailyMetricsUseCase.execute({
  userId,
  date: new Date(),
  workTime: session.duration,
  pomodorosCompleted: session.type === 'POMODORO' ? 1 : 0,
});
```

### DailyMetrics Calculation

**Schema** (`packages/db/prisma/schema.prisma`):

```prisma
model DailyMetrics {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db Date
  tasksCompleted  Int      @default(0)
  tasksCreated    Int      @default(0)
  minutesWorked   Int      @default(0)
  pomodorosCompleted Int   @default(0)
  focusScore      Float    @default(0)

  @@unique([userId, date])
  @@index([userId, date])
}
```

**Fields:**
- `tasksCompleted`: Number of tasks marked DONE on this date
- `tasksCreated`: Number of tasks created on this date
- `minutesWorked`: Total time from all timer sessions
- `pomodorosCompleted`: Number of Pomodoro sessions completed
- `focusScore`: Calculated productivity score (0-1)

### FocusScore Algorithm

**Formula** (`packages/core/src/analytics/use-cases/calculate-focus-score.use-case.ts`):

```
focusScore = (workTime / totalTime) - (pauseCount * 0.02)
```

**Where:**
- `workTime`: Actual work time in seconds
- `totalTime`: Total session duration (work + breaks)
- `pauseCount`: Number of pauses taken
- `0.02`: Penalty factor per pause (2%)

**Score Interpretation:**
- **0.80 - 1.00**: 🟢 Excellent (Green)
- **0.50 - 0.79**: 🟡 Good (Yellow)
- **0.00 - 0.49**: 🔴 Needs Improvement (Red)

**Example:**
```
Session: 25 min work, 5 min break, 0 pauses
focusScore = (1500 / 1800) - (0 * 0.02) = 0.833 (83% - Green)

Session: 20 min work, 10 min break, 2 pauses
focusScore = (1200 / 1800) - (2 * 0.02) = 0.63 (63% - Yellow)
```

### Analytics Endpoints

```typescript
// Daily metrics
GET /analytics/daily?date=2025-01-03
Response: { tasksCompleted, minutesWorked, pomodorosCompleted, focusScore }

// Weekly summary
GET /analytics/weekly?weekStart=2025-01-01
Response: Array of daily metrics for the week

// Monthly summary
GET /analytics/monthly?monthStart=2025-01-01
Response: Array of daily metrics for the month

// Custom range
GET /analytics/range?startDate=...&endDate=...
Response: Array of daily metrics in range
```

---

## Pomodoro Timer Integration

### Timer Types

**1. Pomodoro Timer**
- Default duration: 25 minutes work + 5 minutes break
- Used for focused work sessions
- Automatically tracks to analytics on completion

**2. Continuous Timer**
- Custom duration (no preset)
- Used for meetings, deep work, etc.
- Also tracked to analytics

### Timer Lifecycle

```typescript
// 1. Start timer
POST /timers/start
Body: { taskId, type: 'POMODORO' | 'CONTINUOUS', duration? }
Response: { id, startTime, type, duration }

// 2. Stop timer
POST /timers/stop
Body: { sessionId }
Response: {
  id, endTime, duration,
  metrics: { focusScore, workTime, breakTime }
}

// 3. Pause/Resume
POST /timers/pause
POST /timers/resume
```

### Auto-Tracking Integration

**Trigger**: When timer stops (`TimersService.stop()`)

```typescript
// 1. Calculate focus score
const focusScore = await this.calculateFocusScore(session);

// 2. Update daily metrics
await this.dailyMetricsRepo.upsert({
  userId: session.userId,
  date: new Date(),
  update: {
    minutesWorked: { increment: session.workDuration },
    pomodorosCompleted: { increment: session.type === 'POMODORO' ? 1 : 0 },
  },
  create: { /* ... initial metrics ... */ }
});

// 3. Optionally complete associated task
if (session.type === 'POMODORO' && session.taskId) {
  await this.tasksService.complete(session.taskId);
}
```

### Task Switching Feature

**Endpoint**: `POST /timers/switch-task`

```typescript
// Switch current timer to a different task
// Useful when changing context mid-session
POST /timers/switch-task
Body: { taskId: newTaskId }
Response: {
  sessionId,
  previousTaskId,
  newTaskId,
  switchTime
}
```

**Use Case:**
- User is working on Task A
- Realizes Task B is more urgent
- Switches timer without stopping the session
- Both tasks get partial time tracked

### Timer Analytics

**Focus Score Calculation** (`packages/core/src/analytics/`):

```typescript
class CalculateFocusScoreUseCase {
  async execute(input: { timeSessionId }) {
    const session = await this.timeSessionRepo.findById(input.timeSessionId);

    const workTime = session.actualWorkDuration;
    const totalTime = session.duration;
    const pauseCount = session.pauseCount;

    // Formula: (workTime / totalTime) - (pauseCount * 0.02)
    const rawScore = (workTime / totalTime) - (pauseCount * 0.02);

    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, rawScore));
  }
}
```

---

## WebSocket Architecture

### Notifications Gateway

**Location**: `notifications/notifications.gateway.ts`

```typescript
@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway {
  // Namespace: /notifications
  // Authentication: JWT via handshake.auth.token

  handleConnection(client: Socket) {
    // 1. Verify JWT token
    // 2. Extract userId from token
    // 3. Join user-specific room: `user:${userId}`
    // 4. Track socket connection
  }

  sendNotification(userId: string, notification: Notification) {
    // Broadcast to user's room
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
```

**Events Emitted:**
- `notification:new` - New notification created
- `task:reminder` - Smart notification for upcoming task
- `timer:alert` - Timer complete/paused
- `ai:insight` - AI productivity insight

### Collaboration Gateway

**Location**: `collaboration/collaboration.gateway.ts`

```typescript
@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class CollaborationGateway {
  // Events:
  // - join-workspace: Subscribe to workspace updates
  // - leave-workspace: Unsubscribe
  // - join-task: Subscribe to task updates
  // - task-update: Broadcast task changes
  // - presence-update: Who's online in workspace
  // - task-presence: Who's viewing a task
}
```

**Room Structure:**
```
workspace:{workspaceId}    - All workspace members
task:{taskId}              - Users viewing specific task
user:{userId}               - User's personal notifications
```

### Connection Management

**Authentication Flow:**

```typescript
// Client connects
const socket = io('http://localhost:3101/notifications', {
  auth: { token: jwtToken }
});

// Server validates
socket.on('connect', () => {
  console.log('Connected with userId:', userId);
});

// Reconnection strategy
socket.on('disconnect', () => {
  // Cleanup: Remove socket from userSockets map
});

socket.on('reconnect', () => {
  // Re-authenticate and re-join rooms
});
```

**Reconnection Strategy:**
- Client: Auto-reconnect with exponential backoff
- Server: Allow reconnection with same token
- State: Rooms auto-joined on reconnection

### Rate Limiting for WebSocket

**Guard**: `WsThrottleGuard` (`common/guards/ws-throttle.guard.ts`)

```typescript
@Injectable()
export class WsThrottleGuard implements CanActivate {
  private connections = new Map<string, { count: number; resetAt: }>();

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const userId = client.data?.userId || client.id;

    const now = Date.now();
    const record = this.connections.get(userId);

    if (!record || now > record.resetAt) {
      this.connections.set(userId, { count: 1, resetAt: now + 60000 });
      return true;
    }

    if (record.count >= 50) {
      throw new WsException('Rate limit exceeded');
    }

    record.count++;
    return true;
  }
}
```

**Limits:**
- 50 messages per minute per user
- Auto-resets after 60 seconds
- Applied to all WebSocket events

### WebSocket Event Flow

**Example: Task Update Broadcast**

```
1. User updates task (HTTP PATCH /tasks/:id)
   ↓
2. TasksService.update() completes
   ↓
3. Emits to CollaborationGateway
   this.gateway.emitTaskUpdate(workspaceId, task);
   ↓
4. Gateway broadcasts to room
   this.server.to(`workspace:${workspaceId}`).emit('task:update', task);
   ↓
5. All workspace members receive update
   socket.on('task:update', (task) => { /* update UI */ });
```

## Best Practices Applied

### From architect-nestjs.md

1. ✅ **Scope Rule**: Code used by 2+ modules in `common/`, single-use in domain module
2. ✅ **Screaming Architecture**: Module names describe business domains
3. ✅ **Clean Architecture Layers**: Controller → Service → Repository
4. ✅ **DTOs with Validation**: class-validator + class-transformer
5. ✅ **Repository Pattern**: All data access through repositories
6. ✅ **Exception Filters**: GlobalExceptionFilter for consistent errors

### Additional Patterns

- Winston logging with daily rotate
- Environment-based configuration
- Prisma for type-safe database access
- Path aliases (`@common`, `@config`, etc.)

---

## Related Documentation

- [README.md](./README.md) - API endpoints reference
- [ai-features.md](./ai-features.md) - AI capabilities detail
- [SECURITY.md](./SECURITY.md) - Security implementation
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Planned enhancements
