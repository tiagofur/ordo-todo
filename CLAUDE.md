# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Current Project Status (January 6, 2026)

### ✅ Backend: FULLY FUNCTIONAL
- **All 34 domain modules enabled** and operational
- **74 REST endpoints** working across all features
- **Module restoration completed** - previously commented out modules now active
- **See**: [apps/backend/BACKEND_RESTORATION.md](apps/backend/BACKEND_RESTORATION.md) for full restoration details

### ✅ Dependencies: 100% Updated
- **NestJS**: 11.1.11 (Core), 11.0.14 (CLI)
- **Next.js**: 16.1.1 (Latest)
- **React**: 19.2.3 (Latest)
- **UUID**: 11.0.0 (Latest CJS-compatible version for dual-format builds)
- **TypeScript**: 5.9.3 (Latest)
- **Zero vulnerabilities**: `npm audit` confirms 0 CVEs

### ✅ Quality Metrics
- **TypeScript**: 0 errors across all packages
- **Tests**: 526/633 passing (83%)
- **Build**: Successful for all packages
- **Production Ready**: YES

### Active Backend Modules (34 total)
**Foundation**: Health, Metrics, Auth, Images, Users, Workspaces
**Core Tasks**: Workflows, Projects, Tasks, Notes, Tags, Timers
**Advanced**: Analytics, AI, Chat, Comments, Attachments, Upload, Notifications, Gamification, Templates, Collaboration, Habits, Objectives, CustomFields, Focus, Meetings, Search
**Public Content**: Blog, Changelog, Newsletter, Contact, Roadmap

---

## 🤖 Specialized Agents System

This project uses **elite specialist agents** for autonomous development. Each agent is highly specialized and follows a complete workflow: research → implement → test → document → validate.

**Available Agents** (see [`.claude/agents/README.md`](.claude/agents/README.md) for complete guide):

1. **[NestJS Backend](.claude/agents/nestjs-backend.md)** - REST APIs, services, controllers (NestJS 11+)
2. **[Next.js Frontend](.claude/agents/nextjs-frontend.md)** - React components, pages, hooks (Next.js 15+, React 19)
3. **[React Native](.claude/agents/react-native-specialist.md)** - Mobile screens, native modules
4. **[Electron](.claude/agents/electron-specialist.md)** - Desktop features, IPC communication
5. **[PostgreSQL](.claude/agents/postgres-specialist.md)** - Database schema, migrations, optimization
6. **[Testing Specialist](.claude/agents/testing-specialist.md)** - Unit, integration, E2E tests (100% coverage)
7. **[Documentation Specialist](.claude/agents/documentation-specialist.md)** - API docs, README, diagrams
8. **[Refactoring Specialist](.claude/agents/refactoring-specialist.md)** - Code quality, SOLID principles

**All agents**:
- ✅ Search for latest versions and best practices
- ✅ Write comprehensive tests (unit + integration + E2E)
- ✅ Generate complete documentation
- ✅ Validate quality gates (type check, lint, coverage)
- ✅ Iterate until everything is perfect

## Project Overview

**Ordo-Todo** is a modern task organization platform built with **DDD (Domain-Driven Design) + Clean Architecture** in a **Turborepo monorepo**. The project features:

- **Web app** (Next.js 16 + REST API)
- **Mobile app** (React Native + Expo)
- **Desktop app** (Electron + React)
- **Shared domain core** (packages/core)
- **Shared database** (packages/db with Prisma)
- **Shared UI components** (packages/ui) 🆕

Key features include intelligent AI assistance, advanced Pomodoro timer with task switching, real-time sync, and cross-platform support.

## Build & Development Commands

### Root Commands (uses Turborepo)

```bash
# Development
npm run dev                    # Run all apps in dev mode
npm run dev:desktop            # Run only desktop app
npm run dev --filter=@ordo-todo/web    # Run only web app
npm run dev --filter=@ordo-todo/mobile # Run only mobile app

# Building
npm run build                  # Build all packages and apps
npm run build --filter=@ordo-todo/core # Build only core package

# Quality Checks
npm run lint                   # Lint all workspaces
npm run check-types            # Type check all workspaces
npm run format                 # Format with Prettier
npm run test                   # Run all tests

# Testing
npm run test --filter=@ordo-todo/core  # Test core package (unit tests)
cd packages/core && npm run test       # Watch mode for core tests
```

### Database Commands (from apps/web)

```bash
cd apps/web
npx prisma db push             # Push schema to database
npx prisma generate            # Generate Prisma client
npx prisma studio              # Open Prisma Studio GUI
npx prisma migrate dev         # Create and apply migration
```

### Desktop-Specific Commands

```bash
cd apps/desktop
npm run dev                    # Vite dev server
npm run electron:dev           # Dev with Electron
npm run build:win              # Build for Windows
npm run build:mac              # Build for macOS
npm run build:linux            # Build for Linux
npm run build:all              # Build for all platforms
```

### Mobile-Specific Commands

```bash
cd apps/mobile
npm run start                  # Start Expo dev server
npm run android                # Run on Android
npm run ios                    # Run on iOS
npm run web                    # Run on web
```

## Architecture & Domain Patterns

### Layer Structure

```
┌─ Presentation (apps/web, apps/mobile, apps/desktop)
│  └─ React components, hooks, providers
├─ Application (tRPC routers, API hooks)
│  └─ HTTP calls, state management, routing
├─ Domain (packages/core)
│  └─ Entities, Value Objects, Use Cases (pure TypeScript)
└─ Infrastructure (packages/db, external services)
   └─ Prisma repositories, external APIs
```

### Entity Pattern (packages/core)

All domain entities extend the base `Entity` class from `packages/core/src/shared/entity.ts`:

```typescript
// Entities are immutable with validation
export class Task extends Entity<TaskProps> {
  constructor(props: TaskProps, mode: EntityMode = "valid") {
    super(props, mode);
    // Validation happens in constructor when mode is "valid"
  }
}

// Create valid entity (validates)
const task = new Task({ title: "Write docs", status: "TODO" });

// Create draft entity (skips validation for forms)
const draft = new Task({ title: "" }, "draft");

// Immutable updates using clone
const updated = task.clone({ status: "IN_PROGRESS" });
```

Key methods:
- `clone(newProps)` - Create new instance with updated props
- `asDraft()` - Convert to draft mode
- `asValid()` - Convert to valid mode (validates)
- `equals(entity)` - Compare by ID

### Use Cases Pattern

Use cases implement business logic and are testable without infrastructure:

```typescript
export interface UseCase<IN, OUT> {
  execute(data: IN, loggedUser?: User): Promise<OUT>;
}

// Implementation
export class CreateTaskUseCase implements UseCase<CreateTaskInput, Task> {
  constructor(private readonly taskRepo: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const task = new Task(input);
    await this.taskRepo.save(task);
    return task;
  }
}
```

## Web App (Next.js) + Backend (NestJS)

### API Architecture

**IMPORTANTE**: El proyecto usa **NestJS REST API** (no tRPC)

- **Backend**: `apps/backend/src/` - NestJS controllers and services
- **Controllers**: Domain-specific REST endpoints
- **Services**: Business logic implementation
- **Repositories**: `apps/backend/src/repositories/` - Prisma implementations

Available endpoints: auth, user, workspace, workflow, project, task, tag, timer, analytics, comment, attachment

### NestJS Controllers

```typescript
// Protected endpoint (requires JWT auth)
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto, user.id);
  }
}

// Public endpoint (no auth required)
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### ⚠️ CRITICAL: Backend Module Management

**As of January 6, 2026, ALL 34 backend modules are enabled** in `apps/backend/src/app.module.ts`.

**When working with the backend**:
- ✅ All domain modules are IMPORTED and ACTIVE
- ✅ All controllers, services, and repositories are functional
- ✅ 74 REST endpoints are operational
- ⚠️ **DO NOT comment out modules** - this was a previous issue that has been resolved

**If you need to verify module status**:
```typescript
// apps/backend/src/app.module.ts - imports array
imports: [
  // Infrastructure (always active)
  ScheduleModule.forRoot(),
  ThrottlerModule.forRoot([...]),
  CacheModule, ConfigModule, DatabaseModule, RepositoriesModule,

  // All 34 domain modules (ACTIVE)
  HealthModule, MetricsModule, AuthModule, ImagesModule, UsersModule,
  WorkspacesModule, WorkflowsModule, ProjectsModule, TasksModule,
  NotesModule, TagsModule, TimersModule, AnalyticsModule,
  AIModule, ChatModule, CommentsModule, AttachmentsModule,
  UploadModule, NotificationsModule, GamificationModule,
  TemplatesModule, CollaborationModule, HabitsModule,
  ObjectivesModule, CustomFieldsModule, FocusModule,
  MeetingsModule, SearchModule, BlogPostModule, ChangelogModule,
  NewsletterModule, ContactModule, RoadmapModule,

  WinstonModule.forRoot(loggerConfig),
]
```

**Module Dependency Order** (if ever rebuilding):
1. Infrastructure: Config, Database, Repositories
2. Core: Auth, Images, Users
3. Organization: Workspaces, Workflows, Projects
4. Tasks: Tasks, Tags, Comments, Attachments
5. Features: Timers, Analytics, AI, Chat, etc.
6. Public: Blog, Changelog, Newsletter, Contact, Roadmap

### Frontend API Client

```typescript
import { apiClient } from "@/lib/api-client";
import { useTasks } from "@/lib/api-hooks";

function TaskList() {
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();

  // Use the mutation
  await createTask.mutateAsync({ title: "New task" });
}
```

## Database (Prisma)

Schema location: `packages/db/prisma/schema.prisma`

### Key Models

- **User** - Auth and user data
- **Workspace** - Top-level organization (PERSONAL, WORK, TEAM)
- **Workflow** - Groups of projects within workspace
- **Project** - Contains tasks
- **Task** - Main aggregate with subtasks, dependencies, time tracking
- **TimeSession** - Pomodoro/continuous time tracking
- **Tag** - Task categorization
- **Comment** - Task discussions
- **Attachment** - File uploads
- **AIProfile** - User productivity patterns
- **DailyMetrics** - Analytics data

### Important Relationships

```prisma
Workspace -> Workflow[] -> Project[] -> Task[]
Task -> SubTasks[] (self-referencing)
Task -> TaskDependency[] (blocking/blocked by)
Task -> TimeSession[] (time tracking)
Task -> Tag[] (many-to-many via TaskTag)
User -> WorkspaceMember[] (many-to-many)
```

## State Management

### Client State (Zustand)

Used for UI state in `apps/web/src/stores/`:

```typescript
interface UIStore {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "auto";
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  theme: "auto",
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  })),
}));
```

### Server State (TanStack Query + Axios)

Custom API hooks using React Query for server state management:

```typescript
// API Client (apps/web/src/lib/api-client.ts)
export const apiClient = {
  getTasks: () => axios.get('/tasks').then((res) => res.data),
  createTask: (data) => axios.post('/tasks', data).then((res) => res.data),
};

// React Query Hooks (apps/web/src/lib/api-hooks.ts)
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: apiClient.getTasks,
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: apiClient.createTask,
  });
}
```

## UI Components

### Component Structure

```
components/
├── ui/              # Base components (Radix UI + Tailwind)
├── shared/          # App-specific shared components
├── providers/       # Context providers
└── [domain]/        # Domain-specific components
```

### Styling

- **TailwindCSS 4** - Utility-first CSS
- **Radix UI** - Accessible headless components
- **class-variance-authority** - Component variants
- **tailwind-merge** - Merge class names

Example variant pattern:

```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
    },
    size: {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2",
    },
  },
});
```

### Form Handling

Uses **React Hook Form + Zod**:

```typescript
const schema = z.object({
  title: z.string().min(1, 'Title required'),
  dueDate: z.date().optional()
});

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
}
```

## Analytics System

### Auto-tracking de Métricas

El sistema de analytics rastrea automáticamente la productividad del usuario:

**Backend (Auto-tracking)**:
- Al completar una sesión del timer (`TimersService.stop()`), se ejecuta automáticamente:
  - `CalculateFocusScoreUseCase` - Calcula focus score basado en trabajo vs pausas
  - `UpdateDailyMetricsUseCase` - Actualiza o crea métricas del día
  - Se registran: minutos trabajados, pomodoros completados, focus score

**Endpoints REST**:
```typescript
GET /analytics/daily?date=2025-11-30       // Métricas de un día
GET /analytics/weekly?weekStart=2025-11-24  // Métricas de semana
GET /analytics/monthly?monthStart=2025-11-01 // Métricas de mes
GET /analytics/range?startDate=...&endDate=... // Rango personalizado
```

**Frontend Components** (`apps/web/src/components/analytics/`):
- `DailyMetricsCard` - Resumen diario (tareas, tiempo, pomodoros, focus score)
- `WeeklyChart` - Gráfico de barras con últimos 7 días (recharts)
- `FocusScoreGauge` - Gauge circular animado con colores dinámicos
- `Analytics Page` - Dashboard completo con tabs (Overview, Semanal, Enfoque)

**Hooks**:
```typescript
const { data: dailyMetrics } = useDailyMetrics();
const { data: weeklyMetrics } = useWeeklyMetrics();
const { data: monthlyMetrics } = useMonthlyMetrics();
```

**Focus Score Formula**:
```
focusScore = (workTime / totalTime) - (pauseCount * 0.02)
// Range: 0-1 (0-100%)
// Green: 80-100%, Yellow: 50-79%, Red: 0-49%
```

**Ubicación**: `/analytics` - Dashboard con visualización completa

## Critical Patterns

1. **Domain First**: Implement entities/use cases in `packages/core` before UI
2. **Pure Domain**: Keep `packages/core` free of external dependencies (except uuid, testing libs)
3. **Immutable Entities**: Always use `entity.clone()` for updates, never mutate
4. **Draft Mode**: Use `new Entity(props, "draft")` for forms to skip validation
5. **NestJS Guards**: Use `@UseGuards(JwtAuthGuard)` for protected endpoints, `@Public()` for public ones
6. **Repository Pattern**: Infrastructure (Prisma) stays in `apps/backend/src/repositories/`
7. **Type Safety**: Use TypeScript interfaces and DTOs, validate with class-validator
8. **Shared Configs**: Extend from `@ordo-todo/eslint-config` and `@ordo-todo/typescript-config`
9. **Auto-tracking**: TimeSessions → DailyMetrics automático, transparente para el usuario
10. **Shared Components**: ALL UI components MUST live in `packages/ui` (see Component Guidelines below)
11. **Project Organization**: Keep root clean. Follow [PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md) for file placement.

## Component Generation Guidelines (MANDATORY)

> **IMPORTANT**: See full documentation at [docs/COMPONENT_GUIDELINES.md](/docs/COMPONENT_GUIDELINES.md)

### Quick Rules

1. **ALL new UI components go to `packages/ui/`** - Never create UI components in `apps/`
2. **Components must be platform-agnostic** - Pass data/callbacks via props, no hooks inside
3. **Use relative imports with `.js`** in packages
4. **Export from barrel files** (`index.ts`)
5. **Apps import from `@ordo-todo/ui`**

### Component Location Decision

| Type | Location |
|------|----------|
| Reusable UI (buttons, cards, dialogs) | `packages/ui/src/components/ui/` |
| Domain components (TaskCard, ProjectBoard) | `packages/ui/src/components/[domain]/` |
| Pages/Routes | `apps/[app]/src/app/` or `apps/[app]/src/pages/` |
| App-specific providers | `apps/[app]/src/providers/` |
| Container components (connect UI to data) | `apps/[app]/src/components/` |

### Platform-Agnostic Component Pattern

```typescript
// packages/ui/src/components/task/task-card.tsx

// NO hooks from @ordo-todo/hooks
// NO store access
// NO API calls
// NO i18n hooks

interface TaskCardProps {
  task: Task;                          // Data (from parent)
  onTaskClick: (id: string) => void;   // Callback (from parent)
  onComplete?: (id: string) => void;   // Optional callback
  labels?: {                           // i18n labels (from parent)
    complete?: string;
    delete?: string;
  };
}

export function TaskCard({ task, onTaskClick, onComplete, labels = {} }: TaskCardProps) {
  return (
    <Card onClick={() => onTaskClick(task.id)}>
      <h3>{task.title}</h3>
      {onComplete && (
        <Button onClick={() => onComplete(task.id)}>
          {labels.complete ?? 'Complete'}
        </Button>
      )}
    </Card>
  );
}
```

### Using in Apps

```typescript
// apps/web/src/components/task/task-list-container.tsx
'use client';

import { TaskCard } from '@ordo-todo/ui';
import { useTasks, useCompleteTask } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';

export function TaskListContainer() {
  const { data: tasks } = useTasks();
  const completeTask = useCompleteTask();
  const t = useTranslations('TaskCard');

  return (
    <div>
      {tasks?.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskClick={(id) => router.push(`/tasks/${id}`)}
          onComplete={(id) => completeTask.mutate(id)}
          labels={{
            complete: t('complete'),
            delete: t('delete'),
          }}
        />
      ))}
    </div>
  );
}
```

### Migration Status (as of 2025-12-09)

| Package | Components | Status |
|---------|------------|--------|
| `packages/ui` | 91+ | ✅ Active |
| `packages/hooks` | 100+ hooks (factory) | ✅ Active |
| `packages/stores` | 4 stores | ✅ Active |
| `packages/api-client` | 49+ endpoints | ✅ Active |
| `packages/i18n` | 3 languages | ✅ Active |

**Components in packages/ui**: ui (31), task (15), timer (4), analytics (7), project (11), workspace (3), tag (3), dashboard (5), ai (2), shared (7), layout (2), auth (1)

## Environment Setup

### Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL 16 (local or cloud like Supabase/Neon)

### First Time Setup

```bash
# Install dependencies
npm install

# Setup database (Option 1: Docker)
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d postgres:16

# Configure environment
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your DATABASE_URL

# Push schema and generate client
cd apps/web
npx prisma db push
npx prisma generate

# Start development
cd ../..
npm run dev
```

### Environment Variables

**apps/web/.env.local:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - App URL (http://localhost:3000)

## Key Files Reference

### Core Domain
- `packages/core/src/shared/entity.ts` - Base entity class
- `packages/core/src/analytics/` - Analytics domain (DailyMetrics, use cases)
- `packages/db/prisma/schema.prisma` - Database schema

### Backend (NestJS)
- `apps/backend/src/*/` - Controllers and services by domain
- `apps/backend/src/repositories/` - Prisma repository implementations
- `apps/backend/src/timers/timers.service.ts` - Timer service with auto-tracking

### Frontend
- `apps/web/src/lib/api-client.ts` - Axios API client
- `apps/web/src/lib/api-hooks.ts` - React Query hooks
- `apps/web/src/components/analytics/` - Analytics UI components

### Documentation
- `.agent/workflows/ANALYTICS-AI-PLAN.md` - Complete analytics implementation plan (Fases 1-5)
- `docs/IMPLEMENTATION_STATUS.md` - Project status tracking
- `turbo.json` - Turborepo build pipeline

## Platform-Specific Notes

### Web (Next.js)
- Uses App Router with Server Components
- tRPC endpoints under `/api/trpc`
- Supports PWA features

### Mobile (Expo)
- File-based routing via Expo Router
- Uses Expo SDK 52+
- Native features: Haptics, Notifications, Quick Actions

### Desktop (Electron)
- Vite for bundling
- React Router for navigation
- Electron Builder for packaging

## Workspace Structure

This is a monorepo with workspaces:

**Applications:**
- `apps/web` - @ordo-todo/web (Next.js 16)
- `apps/mobile` - @ordo-todo/mobile (React Native + Expo)
- `apps/desktop` - @ordo-todo/desktop (Electron)
- `apps/backend` - @ordo-todo/backend (NestJS REST API)

**Shared Packages:**
- `packages/core` - @ordo-todo/core (Domain logic, entities, use cases)
- `packages/db` - @ordo-todo/db (Prisma schema)
- `packages/ui` - @ordo-todo/ui 🆕 (Shared React components, providers, utilities)
- `packages/hooks` - @ordo-todo/hooks (React Query hooks factory)
- `packages/stores` - @ordo-todo/stores (Zustand stores)
- `packages/api-client` - @ordo-todo/api-client (REST client with types)
- `packages/i18n` - @ordo-todo/i18n (Translations for 3 languages)
- `packages/config` - @ordo-todo/config (Shared configurations)
- `packages/eslint-config` - @ordo-todo/eslint-config
- `packages/typescript-config` - @ordo-todo/typescript-config

Dependencies between packages are managed via workspace protocol (`"@ordo-todo/core": "*"`).

## ⚠️ Important Constraints

### UUID Version Limitation
**Current Version**: `uuid@11.0.0` (NOT v13)

**Why NOT v13**: UUID v12+ is **ESM-only** and does NOT support CommonJS. Since `packages/core` builds BOTH CJS (`dist/index.js`) and ESM (`dist/index.mjs`) formats, we must use UUID v11 - the last version supporting both formats.

**Impact**: None - UUID v11 includes all TypeScript types and full functionality. Only migrate to v13 if the project becomes ESM-only (removes CJS build).

### Backend Module Dependencies
All 34 domain modules are interdependent. When adding new modules:
1. Follow the dependency order listed above
2. Use `forwardRef()` for circular dependencies
3. Verify imports in `app.module.ts`
4. Run `npm run check-types` and `npm run build` before committing
