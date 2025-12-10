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
