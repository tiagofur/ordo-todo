# Technical Design Document

## Ordo-Todo: Architecture & Implementation Specification

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│  Web App     │  Mobile App  │ Desktop App  │   Browser Ext     │
│  (Next.js)   │  (RN/Expo)   │  (Electron)  │   (Optional)      │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬──────────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                           │
                    ┌──────▼──────┐
                    │   CDN/Edge  │
                    │ (Cloudflare)│
│  │ Auth Svc │ Task Svc │ AI Svc   │ Sync Svc │      │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┘      │
└───────┼──────────┼──────────┼──────────┼────────────┘
        │          │          │          │
┌───────▼──────────▼──────────▼──────────▼────────────┐
│                DATA LAYER                            │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │PostgreSQL│  Redis   │ S3/Blob  │ Vector DB│      │
│  │(Primary) │ (Cache)  │ (Files)  │(AI/Search)│     │
│  └──────────┴──────────┴──────────┴──────────┘      │
└──────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend Stack

```typescript
// Core
- React 18.3+ (with Concurrent Features)
- TypeScript 5.3+
- Next.js 14 (App Router, Server Components)

// State Management
- Zustand (client state)
- React Query / TanStack Query (server state)
- Jotai (atomic state for complex forms)

// Styling
- TailwindCSS 3.4+
- Radix UI (headless components)
- Framer Motion (animations)
- CSS Variables (theming)

// Forms & Validation
- React Hook Form
- Zod (schema validation)

// Date/Time
- date-fns (lightweight)
- react-day-picker (calendar component)

// Rich Text
- Tiptap (markdown editor)
- @tiptap/extension-*

// Charts
- Recharts (analytics)
- react-heatmap-grid (productivity heatmap)
```

#### Mobile Stack

```typescript
// Core
- React Native 0.73+
- Expo SDK 50+
- TypeScript

// Navigation
- Expo Router (file-based)

// UI Components
- React Native Paper (Material Design)
- Custom component library

// Animations
- React Native Reanimated 3
- React Native Gesture Handler

// Storage
- Expo SQLite (offline)
- Expo SecureStore (credentials)

// Notifications
- Expo Notifications
- Firebase Cloud Messaging (background)
```

#### PWA Stack (Web & Mobile)

```typescript
// Progressive Web App Features
// Core PWA APIs
- Service Worker API (caching, background sync)
- Web App Manifest (installability, metadata)
- Cache API (offline content storage)
- Web Notifications API (push notifications)
- Background Sync API (offline action queuing)

// Web PWA Implementation
- Service Worker: sw.js (caching strategies, push handling)
- Web App Manifest: manifest.json (icons, theme, display mode)
- Offline Page: offline.html (graceful degradation)
- Push Notifications: Notification.requestPermission(), service worker push events
- Keyboard Shortcuts: Global hotkeys for productivity
- Install Prompt: Custom PWA install banner

// Mobile Native PWA Features
- Expo Notifications: Push notifications with native iOS/Android integration
- Quick Actions: 3D Touch / long-press shortcuts on home screen
- Haptics: Tactile feedback for user interactions
- NetInfo: Network connectivity detection and offline handling
- Background Refresh: Content updates when app is backgrounded

// Cross-Platform Hooks
- usePushNotifications: Unified push notification handling
- useKeyboardShortcuts: Global keyboard shortcuts (web)
- useQuickActions: Home screen shortcuts (mobile)
- useOfflineDetection: Network status monitoring
- useHaptics: Tactile feedback (mobile only)

// Build Tools
- Sharp: Image processing for PWA icons and screenshots
- Next.js PWA Plugin: Automatic service worker generation
- Expo Application Services: Native mobile PWA features
```

#### Backend Stack

```typescript
// Runtime & Framework
- Node.js 20 LTS
- TypeScript 5.3+
- NestJS (REST API)
- Express (underlying framework)

// ORM & Database
- Prisma 5
- PostgreSQL 16
- Redis 7 (caching, sessions, real-time)

// Authentication
- NextAuth.js / Auth.js
- JWT tokens
- OAuth providers (Google, GitHub, Microsoft)

// File Storage
- AWS S3 / Cloudflare R2
- Presigned URLs for uploads

// Real-time
- Socket.io (WebSocket)
- Redis Pub/Sub (scaling)

// AI/ML
- OpenAI API (GPT-4 Turbo)
- Langchain (orchestration)
- Pinecone (vector database)
- Hugging Face Transformers (local models)

// Background Jobs
- BullMQ (queue)
- Redis (broker)

// Monitoring
- Sentry (errors)
- PostHog (analytics)
- OpenTelemetry (traces)
```

#### Infrastructure

```yaml
# Hosting
Frontend: Vercel (Web + API Routes)
Backend: Railway / Fly.io (Node services)
Database: Supabase / Neon (PostgreSQL)
Cache: Upstash Redis
CDN: Cloudflare
Files: Cloudflare R2 / AWS S3

# CI/CD
- GitHub Actions
- Vercel auto-deploy
- E2E tests before deploy

# Environment
- Development: Local Docker Compose
- Staging: Separate Vercel project
- Production: Multi-region (US-East, EU-West)
```

---

## 2. Database Design

### 2.1 Schema Architecture

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ USER & AUTH ============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?

  // Auth
  hashedPassword String?
  accounts       Account[]
  sessions       Session[]

  // Settings
  preferences    UserPreferences?
  subscription   Subscription?

  // Relationships
  workspaces     WorkspaceMember[]
  tasks          Task[]
  comments       Comment[]

  // AI Data
  aiProfile      AIProfile?

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timer Settings
  timerMode             TimerMode @default(POMODORO)
  pomodoroDuration      Int       @default(25) // minutes
  shortBreakDuration    Int       @default(5)
  longBreakDuration     Int       @default(15)
  pomodorosUntilLongBreak Int     @default(4)

  // Notifications
  enableSounds          Boolean   @default(true)
  enableNotifications   Boolean   @default(true)

  // UI
  theme                 Theme     @default(LIGHT)
  startOfWeek           Int       @default(1) // 0=Sunday, 1=Monday
  defaultView           ViewType  @default(LIST)

  // AI
  enableAI              Boolean   @default(true)
  aiAggressiveness      Int       @default(5) // 1-10 scale

  // Energy Profile (for Energy Matching)
  morningEnergy         EnergyLevel @default(MEDIUM)
  afternoonEnergy       EnergyLevel @default(MEDIUM)
  eveningEnergy         EnergyLevel @default(LOW)
}

enum TimerMode {
  POMODORO
  CONTINUOUS
  HYBRID
}

enum Theme {
  LIGHT
  DARK
  AUTO
}

enum ViewType {
  LIST
  KANBAN
  CALENDAR
  TIMELINE
  FOCUS
}

enum EnergyLevel {
  LOW
  MEDIUM
  HIGH
}

// ============ WORKSPACES ============

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        WorkspaceType
  color       String   @default("#2563EB")
  icon        String?

  // Owner
  ownerId     String?

  // Members
  members     WorkspaceMember[]

  // Content
  projects    Project[]

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
}

enum WorkspaceType {
  PERSONAL
  WORK
  TEAM
}

model WorkspaceMember {
  id          String   @id @default(cuid())

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String

  role        MemberRole @default(MEMBER)

  joinedAt    DateTime @default(now())

  @@unique([workspaceId, userId])
  @@index([userId])
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============ PROJECTS & TASKS ============

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#6B7280")
  icon        String?

  // Workspace
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String

  // Organization
  position    Int      @default(0)
  archived    Boolean  @default(false)

  // Content
  tasks       Task[]

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([workspaceId])
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text

  // Status
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)

  // Scheduling
  dueDate     DateTime?
  startDate   DateTime?
  completedAt DateTime?

  // Time Tracking
  estimatedMinutes Int?
  actualMinutes    Int?     @default(0)

  // Organization
  position    Int      @default(0)

  // Relationships
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String

  creator     User     @relation(fields: [creatorId], references: [id])
  creatorId   String

  assignee    String?  // userId

  // Hierarchy
  parentTask  Task?    @relation("SubTasks", fields: [parentTaskId], references: [id], onDelete: Cascade)
  parentTaskId String?
  subTasks    Task[]   @relation("SubTasks")

  // Dependencies
  blockedBy   TaskDependency[] @relation("BlockedTask")
  blocking    TaskDependency[] @relation("BlockingTask")

  // Recurrence
  recurrence  Recurrence?

  // Tags & Attachments
  tags        TaskTag[]
  attachments Attachment[]
  comments    Comment[]

  // AI Metadata
  aiSuggestions Json?  // Stores AI-generated suggestions
  energyRequired EnergyLevel @default(MEDIUM)

  // Time Sessions
  timeSessions TimeSession[]

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
  @@index([creatorId])
  @@index([status])
  @@index([dueDate])
  @@index([priority])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TaskDependency {
  id              String @id @default(cuid())

  blockingTask    Task   @relation("BlockingTask", fields: [blockingTaskId], references: [id], onDelete: Cascade)
  blockingTaskId  String

  blockedTask     Task   @relation("BlockedTask", fields: [blockedTaskId], references: [id], onDelete: Cascade)
  blockedTaskId   String

  createdAt       DateTime @default(now())

  @@unique([blockingTaskId, blockedTaskId])
}

model Recurrence {
  id          String   @id @default(cuid())

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String   @unique

  pattern     RecurrencePattern
  interval    Int      @default(1) // Every X days/weeks/months
  daysOfWeek  Int[]    // [0,1,2,3,4,5,6] for Sunday-Saturday
  dayOfMonth  Int?     // 1-31
  endDate     DateTime?

  createdAt   DateTime @default(now())
}

enum RecurrencePattern {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

model Tag {
  id          String   @id @default(cuid())
  name        String
  color       String   @default("#6B7280")

  tasks       TaskTag[]

  createdAt   DateTime @default(now())

  @@unique([name])
}

model TaskTag {
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String

  tag         Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId       String

  @@id([taskId, tagId])
}

model Attachment {
  id          String   @id @default(cuid())

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String

  filename    String
  filesize    Int      // bytes
  mimeType    String
  url         String   // S3/R2 URL

  uploadedAt  DateTime @default(now())

  @@index([taskId])
}

model Comment {
  id          String   @id @default(cuid())

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String

  author      User     @relation(fields: [authorId], references: [id])
  authorId    String

  content     String   @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([taskId])
  @@index([authorId])
}

// ============ TIME TRACKING ============

model TimeSession {
  id          String   @id @default(cuid())

  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String

  userId      String   // Who worked on it

  startedAt   DateTime
  endedAt     DateTime?
  duration    Int?     // minutes (calculated)

  type        SessionType @default(WORK)

  // Pomodoro specific
  wasCompleted Boolean  @default(false)
  wasInterrupted Boolean @default(false)

  createdAt   DateTime @default(now())

  @@index([taskId])
  @@index([userId])
  @@index([startedAt])
}

enum SessionType {
  WORK
  SHORT_BREAK
  LONG_BREAK
}

// ============ AI & ANALYTICS ============

model AIProfile {
  id          String   @id @default(cuid())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String   @unique

  // Productivity Patterns
  peakHours   Json     // { hour: productivityScore }
  peakDays    Json     // { dayOfWeek: productivityScore }

  // Task Preferences
  avgTaskDuration Int  @default(30) // minutes
  completionRate  Float @default(0.7)

  // Learning
  categoryPreferences Json  // What types of tasks user prefers

  updatedAt   DateTime @updatedAt
}

model DailyMetrics {
  id              String   @id @default(cuid())

  userId          String
  date            DateTime @db.Date

  // Tasks
  tasksCreated    Int      @default(0)
  tasksCompleted  Int      @default(0)

  // Time
  minutesWorked   Int      @default(0)
  pomodorosCompleted Int   @default(0)

  // Focus
  focusScore      Float?   // 0-1 scale

  createdAt       DateTime @default(now())

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}

// ============ SUBSCRIPTIONS ============

model Subscription {
  id          String   @id @default(cuid())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String   @unique

  plan        SubscriptionPlan
  status      SubscriptionStatus

  stripeCustomerId       String?  @unique
  stripeSubscriptionId   String?  @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum SubscriptionPlan {
  FREE
  PRO
  TEAM
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  PAST_DUE
  TRIALING
  UNPAID
}
```

### 2.2 Indexing Strategy

```sql
-- Performance-critical indexes

-- Tasks: Frequent queries
CREATE INDEX idx_tasks_user_status ON tasks(creator_id, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_due_date_status ON tasks(due_date, status);
CREATE INDEX idx_tasks_priority_status ON tasks(priority, status);

-- Full-text search
CREATE INDEX idx_tasks_title_search ON tasks USING gin(to_tsvector('english', title));
CREATE INDEX idx_tasks_description_search ON tasks USING gin(to_tsvector('english', description));

-- Time sessions: Analytics queries
CREATE INDEX idx_time_sessions_user_date ON time_sessions(user_id, started_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_workspace_status ON tasks(workspace_id, status, due_date);
```

---

### 3.1 API Structure (NestJS)

The API is built using NestJS controllers and services, exposing standard REST endpoints.

```typescript
// Example Controller
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }
}
```

### 3.2 Task Router Example

```typescript
// src/server/api/routers/task.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CreateTaskUseCase, CompleteTaskUseCase } from "@ordo-todo/core";
import { PrismaTaskRepository } from "../../repositories/task.prisma";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z.date().optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taskRepository = new PrismaTaskRepository(ctx.db);
      const createTaskUseCase = new CreateTaskUseCase(taskRepository);

      const user = ctx.session.user as any;
      const task = await createTaskUseCase.execute({
        ...input,
        creatorId: user.id,
      });

      return task.props;
    }),

  complete: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const taskRepository = new PrismaTaskRepository(ctx.db);
      const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

      const user = ctx.session.user as any;
      const task = await completeTaskUseCase.execute({
        taskId: input.taskId,
        creatorId: user.id,
      });

      return task.props;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const taskRepository = new PrismaTaskRepository(ctx.db);
    const user = ctx.session.user as any;
    const tasks = await taskRepository.findByCreatorId(user.id);
    return tasks.map((t) => t.props);
  }),
});
});

export const taskRouter = createTRPCRouter({
  // Create task
  create: protectedProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          workspace: {
            members: {
              some: { userId: ctx.session.user.id },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // AI: Analyze task and add suggestions
      const aiSuggestions = await ctx.ai.analyzeNewTask({
        title: input.title,
        description: input.description,
        userId: ctx.session.user.id,
      });

      const task = await ctx.db.task.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
          aiSuggestions,
          energyRequired: aiSuggestions.estimatedEnergy,
          tags: input.tags
            ? {
                create: input.tags.map((tagName) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: tagName },
                      create: { name: tagName },
                    },
                  },
                })),
              }
            : undefined,
        },
        include: {
          tags: { include: { tag: true } },
          project: true,
        },
      });

      // Emit real-time update
      ctx.pubsub.publish(`project:${input.projectId}:taskCreated`, task);

      return task;
    }),

  // Get tasks with filters
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().cuid().optional(),
        projectId: z.string().cuid().optional(),
        status: z
          .enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
          .optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z
          .object({
            from: z.date().optional(),
            to: z.date().optional(),
          })
          .optional(),
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.db.task.findMany({
        where: {
          creatorId: ctx.session.user.id,
          ...(input.projectId && { projectId: input.projectId }),
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
          ...(input.dueDate && {
            dueDate: {
              gte: input.dueDate.from,
              lte: input.dueDate.to,
            },
          }),
          ...(input.tags && {
            tags: {
              some: {
                tag: { name: { in: input.tags } },
              },
            },
          }),
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { description: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          tags: { include: { tag: true } },
          project: true,
          subTasks: true,
          _count: { select: { comments: true } },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (tasks.length > input.limit) {
        const nextItem = tasks.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: tasks,
        nextCursor,
      };
    }),

  // Update task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: taskSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: { project: true },
      });

      if (!existing || existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updated = await ctx.db.task.update({
        where: { id: input.id },
        data: input.data,
        include: {
          tags: { include: { tag: true } },
          project: true,
        },
      });

      ctx.pubsub.publish(`project:${existing.projectId}:taskUpdated`, updated);

      return updated;
    }),

  // Complete task
  complete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.update({
        where: { id: input.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        include: { project: true },
      });

      // Update metrics
      await ctx.db.dailyMetrics.upsert({
        where: {
          userId_date: {
            userId: ctx.session.user.id,
            date: new Date(),
          },
        },
        update: {
          tasksCompleted: { increment: 1 },
        },
        create: {
          userId: ctx.session.user.id,
          date: new Date(),
          tasksCompleted: 1,
        },
      });

      // Check for achievements/streaks
      await ctx.gamification.checkAchievements(ctx.session.user.id);

      ctx.pubsub.publish(`project:${task.projectId}:taskCompleted`, task);

      return task;
    }),

  // Delete task
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
      });

      if (!task || task.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.task.delete({
        where: { id: input.id },
      });

      ctx.pubsub.publish(`project:${task.projectId}:taskDeleted`, {
        id: input.id,
      });

      return { success: true };
    }),

  // Subscribe to real-time updates
  onUpdate: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid(),
      })
    )
    .subscription(async ({ ctx, input }) => {
      return ctx.pubsub.subscribe(`project:${input.projectId}:*`);
    }),
});
```

### 3.3 AI Router Example

```typescript
// src/server/api/routers/ai.ts

export const aiRouter = createTRPCRouter({
  // Suggest next tasks
  suggestNextTasks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's AI profile and preferences
      const [profile, preferences] = await Promise.all([
        ctx.db.aiProfile.findUnique({ where: { userId } }),
        ctx.db.userPreferences.findUnique({ where: { userId } }),
      ]);

      // Get all pending tasks
      const tasks = await ctx.db.task.findMany({
        where: {
          creatorId: userId,
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
        include: {
          project: true,
          tags: { include: { tag: true } },
          blockedBy: { include: { blockingTask: true } },
        },
      });

      // AI scoring algorithm
      const scoredTasks = tasks.map((task) => ({
        task,
        score: calculateTaskScore(task, profile, preferences),
      }));

      // Sort by score and return top N
      scoredTasks.sort((a, b) => b.score - a.score);

      return scoredTasks.slice(0, input.limit).map(({ task, score }) => ({
        ...task,
        aiRecommendationScore: score,
      }));
    }),

  // Estimate task duration
  estimateDuration: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use GPT-4 to analyze task
      const completion = await ctx.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a task duration estimator. 
            Analyze the task and provide a realistic time estimate in minutes.
            Consider complexity, typical execution time, and common blockers.
            Respond with JSON: { "estimatedMinutes": number, "confidence": number (0-1), "reasoning": string }`,
          },
          {
            role: "user",
            content: `Task: ${input.title}\nDescription: ${
              input.description || "N/A"
            }`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content);

      // Learn from user's actual time vs estimates
      // This feeds back into the model over time

      return result;
    }),

  // Smart scheduling
  smartSchedule: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string().cuid()),
        targetDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get user's energy profile and existing schedule
      const [preferences, existingTasks] = await Promise.all([
        ctx.db.userPreferences.findUnique({ where: { userId } }),
        ctx.db.task.findMany({
          where: {
            creatorId: userId,
            dueDate: {
              gte: startOfDay(input.targetDate),
              lte: endOfDay(input.targetDate),
            },
          },
        }),
      ]);

      // Use AI to schedule tasks optimally
      const schedule = await ctx.ai.generateOptimalSchedule({
        tasks: input.taskIds,
        preferences,
        existingCommitments: existingTasks,
        targetDate: input.targetDate,
      });

      return schedule;
    }),

  // Parse natural language
  parseNaturalLanguage: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use GPT-4 to extract task details
      const completion = await ctx.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `Parse task creation from natural language.
            Extract: title, dueDate, priority, tags, estimatedMinutes.
            Examples:
            - "Meeting with John tomorrow at 3pm #work @high" 
            - "Buy groceries this weekend"
            - "Review PR for 30 minutes today @urgent #coding"
            
            Return JSON with extracted fields. Use null for missing data.`,
          },
          {
            role: "user",
            content: input.text,
          },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(completion.choices[0].message.content);
    }),

  // Generate daily brief
  generateDailyBrief: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = new Date();

    // Get today's tasks and recent metrics
    const [todayTasks, metrics, upcomingDeadlines] = await Promise.all([
      ctx.db.task.findMany({
        where: {
          creatorId: userId,
          OR: [
            { dueDate: { gte: startOfDay(today), lte: endOfDay(today) } },
            { status: "IN_PROGRESS" },
          ],
        },
        include: { project: true, tags: { include: { tag: true } } },
      }),
      ctx.db.dailyMetrics.findMany({
        where: {
          userId,
          date: { gte: subDays(today, 7) },
        },
        orderBy: { date: "desc" },
      }),
      ctx.db.task.findMany({
        where: {
          creatorId: userId,
          status: { not: "COMPLETED" },
          dueDate: {
            gte: today,
            lte: addDays(today, 7),
          },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    // Generate brief with GPT-4
    const completion = await ctx.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a productivity assistant. 
            Generate a motivating, concise daily brief for the user.
            Include: summary of today's tasks, productivity trends, upcoming deadlines, and one actionable tip.
            Keep it under 200 words. Be encouraging and specific.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            todayTasks,
            recentProductivity: metrics,
            upcomingDeadlines,
          }),
        },
      ],
    });

    return {
      brief: completion.choices[0].message.content,
      stats: {
        tasksToday: todayTasks.length,
        avgProductivityLast7Days: avg(metrics.map((m) => m.tasksCompleted)),
        upcomingDeadlines: upcomingDeadlines.length,
      },
    };
  }),
});
```

---

## 4. Real-time Synchronization

### 4.1 WebSocket Architecture

```typescript
// src/server/websocket/index.ts

import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { verifyJWT } from "../auth/jwt";

export async function initializeWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Redis adapter for multi-instance scaling
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const payload = await verifyJWT(token);
      socket.data.userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join workspace rooms
    socket.on("joinWorkspace", (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("leaveWorkspace", (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // Task updates
    socket.on("taskUpdate", async (data) => {
      // Broadcast to all users in the workspace
      socket.to(`workspace:${data.workspaceId}`).emit("taskUpdated", data);
    });

    // Presence (who's online)
    socket.on("presence:online", async () => {
      await pubClient.setex(`presence:${userId}`, 300, "online");
      io.emit("presence:update", { userId, status: "online" });
    });

    socket.on("disconnect", async () => {
      await pubClient.del(`presence:${userId}`);
      io.emit("presence:update", { userId, status: "offline" });
    });
  });

  return io;
}
```

### 4.2 Optimistic Updates Pattern

```typescript
// src/hooks/useTaskMutations.ts

import { api } from "@/utils/api";
import { useQueryClient } from "@tanstack/react-query";

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  const updateTask = api.task.update.useMutation({
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.task.list.cancel();

      // Snapshot previous value
      const previousTasks = utils.task.list.getData();

      // Optimistically update cache
      utils.task.list.setData(undefined, (old) =>
        old?.map((task) =>
          task.id === variables.id ? { ...task, ...variables.data } : task
        )
      );

      return { previousTasks };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        utils.task.list.setData(undefined, context.previousTasks);
      }
      toast.error("Failed to update task");
    },

    // Refetch on success
    onSuccess: () => {
      utils.task.list.invalidate();
      toast.success("Task updated");
    },
  });

  return { updateTask };
}
```

---

### 4.3 Offline Synchronization Strategy

To support full offline capabilities (PWA & Mobile), we implement a **"Store-and-Forward"** architecture using a local Action Queue.

**1. Local Storage Layer:**
- **Web**: IndexedDB (via `idb` or `TanStack Query Persister`)
- **Mobile**: Expo SQLite
- **Data**: Stores a local replica of `tasks`, `projects`, and `userPreferences`.

**2. Action Queue (Mutation Log):**
When the device is **offline**:
1.  User performs an action (e.g., `updateTask`).
2.  **Optimistic Update**: UI updates immediately via React Query cache.
3.  **Queue**: The mutation is serialized and stored in `MutationQueue` (IndexedDB/SQLite).
    ```typescript
    interface QueuedMutation {
      id: string;
      type: 'CREATE' | 'UPDATE' | 'DELETE';
      entity: 'TASK' | 'PROJECT';
      payload: any;
      timestamp: number;
      retryCount: number;
    }
    ```
4.  **Sync Manager**: Monitors network status (`navigator.onLine` / `NetInfo`).

**3. Reconnection & Replay:**
When the device comes **online**:
1.  **Process Queue**: Iterate through `MutationQueue` in FIFO order.
2.  **Send to API**: Execute tRPC mutations.
3.  **Ack/Nack**:
    - **Success**: Remove from queue.
    - **Error (Retryable)**: Exponential backoff (e.g., 500 error).
    - **Error (Fatal)**: Move to "Dead Letter Queue" and notify user (e.g., 403 Forbidden).

**4. Recommended Libraries (Local-First Approach):**
While the custom Action Queue is suitable for MVP, for a robust production-grade offline experience (V2+), we recommend adopting a specialized "Local-First" database library to handle complexity (sync protocol, conflict resolution, observable queries).

- **WatermelonDB**:
  - **Pros**: Optimized for React Native performance (JSI), relational model fits Prisma backend, mature ecosystem.
  - **Cons**: Requires native plugin (Expo Config Plugin available), strict schema definition.
  - **Verdict**: **Recommended** for Ordo-Todo due to mobile performance requirements.

- **RxDB**:
  - **Pros**: NoSQL (flexible), truly reactive (RxJS), works everywhere (Web/Mobile/Electron), extensive plugin system.
  - **Cons**: Document-based model might require mapping from relational backend.

### 4.4 Conflict Resolution Protocol

We use a **"Server Authority with Last-Write-Wins (LWW)"** strategy, refined by field-level granularity.

**1. Versioning:**
Every entity (`Task`, `Project`) has an `updatedAt` timestamp and a `version` (integer).

**2. Resolution Logic (Server-Side):**
When the server receives an update:
```typescript
// Server Logic
async function handleUpdate(id, changes, clientTimestamp) {
  const current = await db.task.find(id);

  // Case 1: No conflict (Server hasn't changed since client read)
  // (In a simple LWW, we just compare timestamps)

  if (clientTimestamp > current.updatedAt.getTime()) {
    // Client is newer -> ACCEPT
    return db.task.update(id, changes);
  } else {
    // Server is newer -> REJECT or MERGE
    // For MVP: "Server Wins" on conflict to preserve integrity.
    // Ideally: Field-level merge (if client changed 'title' and server changed 'status', keep both).
    return mergeChanges(current, changes);
  }
}
```

**3. MVP Strategy (Simple LWW):**
- We trust the **Server's Timestamp** of receipt for ordering, OR we trust the Client's timestamp if within a reasonable window.
- **Rule**: If a client sends an update based on an old version, the server accepts it **ONLY IF** the specific fields being modified haven't changed on the server.
- **Fallback**: If the same field was modified, the **Server's current state wins**. The client receives the new state in the response and updates its UI (overwriting the optimistic update).

**4. User Notification:**
If a significant conflict occurs (e.g., user deleted a task that was modified by someone else), show a "Conflict Detected" toast and reload the latest data.

---

## 5. Frontend Architecture

### 5.1 Component Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx     # Main app layout
│   │   ├── today/
│   │   ├── projects/
│   │   ├── calendar/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
│
├── components/
│   ├── ui/                # Radix UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── task/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskKanban.tsx
│   │   ├── TaskCalendar.tsx
│   │   ├── TaskTimeline.tsx
│   │   └── TaskFocusView.tsx
│   ├── timer/
│   │   ├── PomodoroTimer.tsx
│   │   ├── ContinuousTimer.tsx
│   │   └── TimerWidget.tsx
│   ├── workspace/
│   │   ├── WorkspaceSwitcher.tsx
│   │   └── WorkspaceSettings.tsx
│   ├── analytics/
│   │   ├── ProductivityChart.tsx
│   │   ├── HeatmapCalendar.tsx
│   │   └── StatsCards.tsx
│   └── ai/
│       ├── AIAssistant.tsx
│       ├── SmartSuggestions.tsx
│       └── DailyBrief.tsx
│
├── hooks/
│   ├── useTaskMutations.ts
│   ├── useTimer.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useWorkspace.ts
│   └── useRealtime.ts
│
├── stores/
│   ├── timerStore.ts      # Zustand store
│   ├── uiStore.ts
│   └── syncStore.ts
│
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   └── prompts.ts
│   ├── db/
│   │   └── client.ts
│   ├── auth/
│   │   └── auth.ts
│   └── utils/
│       ├── date.ts
│       ├── task-utils.ts
│       └── cn.ts
│
├── server/
│   ├── api/
│   │   ├── routers/
│   │   ├── trpc.ts
│   │   └── root.ts
│   ├── db/
│   │   └── schema.prisma
│   └── auth/
│       └── config.ts
│
└── styles/
    └── globals.css
```

### 5.2 State Management Strategy

```typescript
// Global UI State (Zustand)
// src/stores/uiStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  currentView: "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";
  theme: "light" | "dark" | "auto";
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setView: (view: UIStore["currentView"]) => void;
  setTheme: (theme: UIStore["theme"]) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentView: "LIST",
      theme: "auto",
      commandPaletteOpen: false,

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
      setView: (view) => set({ currentView: view }),
      setTheme: (theme) => set({ theme }),
      toggleCommandPalette: () =>
        set((state) => ({
          commandPaletteOpen: !state.commandPaletteOpen,
        })),
    }),
    { name: "ui-storage" }
  )
);

// Timer State (Zustand)
// src/stores/timerStore.ts

interface TimerStore {
  isRunning: boolean;
  mode: "POMODORO" | "CONTINUOUS" | "HYBRID";
  currentPhase: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  secondsRemaining: number;
  pomodorosCompleted: number;
  currentTaskId: string | null;

  start: (taskId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  mode: "POMODORO",
  currentPhase: "WORK",
  secondsRemaining: 25 * 60,
  pomodorosCompleted: 0,
  currentTaskId: null,

  start: (taskId) =>
    set({
      isRunning: true,
      currentTaskId: taskId,
      currentPhase: "WORK",
    }),

  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),

  stop: () =>
    set({
      isRunning: false,
      currentTaskId: null,
      secondsRemaining: 25 * 60,
      currentPhase: "WORK",
    }),

  tick: () => {
    const state = get();
    if (!state.isRunning) return;

    if (state.secondsRemaining > 0) {
      set({ secondsRemaining: state.secondsRemaining - 1 });
    } else {
      // Phase completed
      handlePhaseComplete(state);
    }
  },

  skip: () => {
    const state = get();
    handlePhaseComplete(state);
  },
}));

// Server State (React Query via tRPC)
// Handled automatically by tRPC hooks

// Form State (React Hook Form + Zod)
// Handled per-component basis
```

---

## 6. Mobile Architecture (React Native)

### 6.1 Project Structure

```
mobile/
├── app/                   # Expo Router
│   ├── (tabs)/
│   │   ├── index.tsx      # Today view
│   │   ├── projects.tsx
│   │   ├── calendar.tsx
│   │   ├── analytics.tsx
│   │   └── more.tsx
│   ├── (modals)/
│   │   ├── task-detail.tsx
│   │   ├── quick-add.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
│
├── components/
│   ├── TaskCard.tsx
│   ├── PomodoroTimer.tsx
│   └── ...
│
├── hooks/
│   ├── useTaskMutations.ts
│   ├── usePushNotifications.ts
│   └── useOfflineSync.ts
│
├── store/
│   └── offlineStore.ts    # WatermelonDB
│
├── utils/
│   └── trpc.ts
│
└── app.json
```

### 6.2 Offline-First Strategy

```typescript
// mobile/store/database.ts

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { Task, Project, Workspace } from "./models";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // JSI for performance
  onSetUpError: (error) => {
    console.error("Database setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Task, Project, Workspace],
});

// Sync with server
export async function syncDatabase() {
  const lastSyncedAt = await getLastSyncTimestamp();

  // Pull changes from server
  const changes = await api.sync.pull.query({ since: lastSyncedAt });

  await database.write(async () => {
    await database.batch(
      ...changes.created.map((record) =>
        database.collections.get(record.table).prepareCreate(record.data)
      ),
      ...changes.updated.map((record) =>
        database.collections
          .get(record.table)
          .prepareUpdate(record.id, record.data)
      ),
      ...changes.deleted.map((record) =>
        database.collections.get(record.table).prepareMarkAsDeleted(record.id)
      )
    );
  });

  // Push local changes to server
  const localChanges = await database.getLocalChanges();
  await api.sync.push.mutate(localChanges);

  await setLastSyncTimestamp(Date.now());
}
```

---

## 7. Performance Optimization

### 7.1 Frontend Performance

```typescript
// Code splitting by route
const TaskDetailModal = dynamic(() => import("@/components/TaskDetailModal"), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Virtual scrolling for long lists
import { useVirtualizer } from "@tanstack/react-virtual";

function TaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <TaskCard
            key={tasks[virtualItem.index].id}
            task={tasks[virtualItem.index]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Image optimization
import Image from "next/image";

<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  loading="lazy"
  placeholder="blur"
/>;

// Debounce search
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

const { data } = api.task.list.useQuery({ search: debouncedSearch });
```

### 7.2 Backend Performance

```typescript
// Database query optimization
// Use select to limit fields
const tasks = await prisma.task.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    dueDate: true,
    // Don't select heavy fields like description unless needed
  },
});

// Use includes judiciously
// Bad: N+1 queries
const projects = await prisma.project.findMany();
for (const project of projects) {
  const tasks = await prisma.task.findMany({
    where: { projectId: project.id },
  });
}

// Good: Single query with include
const projects = await prisma.project.findMany({
  include: {
    tasks: {
      where: { status: "TODO" },
      take: 10,
    },
    _count: { select: { tasks: true } },
  },
});

// Caching with Redis
import { redis } from "@/lib/redis";

async function getTasksWithCache(userId: string) {
  const cacheKey = `tasks:${userId}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from DB
  const tasks = await prisma.task.findMany({
    where: { creatorId: userId },
  });

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(tasks));

  return tasks;
}

// Background job processing
import { Queue } from "bullmq";

const emailQueue = new Queue("email", {
  connection: { host: "localhost", port: 6379 },
});

// Add job
await emailQueue.add(
  "dailyBrief",
  {
    userId: user.id,
    date: new Date(),
  },
  {
    delay: 1000 * 60 * 60 * 24, // 24 hours
  }
);

// Process job
const worker = new Worker(
  "email",
  async (job) => {
    if (job.name === "dailyBrief") {
      await sendDailyBrief(job.data.userId);
    }
  },
  { connection }
);
```

---

## 8. Security Implementation

### 8.1 Authentication Flow

```typescript
// src/server/auth/config.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

export default NextAuth(authOptions);
```

### 8.2 Authorization Middleware

```typescript
// src/server/api/trpc.ts

import { TRPCError, initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";

const t = initTRPC.create();

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session,
    },
  });
});

// Workspace-level authorization
export const workspaceProtectedProcedure = protectedProcedure
  .input(z.object({ workspaceId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const member = await ctx.db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: ctx.session.user.id,
        },
      },
    });

    if (!member) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({
      ctx: {
        ...ctx,
        workspace: { id: input.workspaceId, role: member.role },
      },
    });
  });
```

### 8.3 Data Encryption

```typescript
// Encrypt sensitive task data
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Use for sensitive descriptions
const task = await prisma.task.create({
  data: {
    title: input.title,
    description: input.isSensitive
      ? encrypt(input.description)
      : input.description,
  },
});
```

---

## 9. Testing Strategy

### 9.1 Testing Pyramid

```
                    ┌─────────────┐
                    │    E2E      │  ~10% (Critical paths)
                    │   Tests     │
                ┌───┴─────────────┴───┐
                │   Integration       │  ~30% (API, DB)
                │      Tests          │
            ┌───┴─────────────────────┴───┐
            │       Unit Tests            │  ~60% (Functions, Components)
            └─────────────────────────────┘
```

### 9.2 Unit Testing

```typescript
// Framework: Vitest (compatible con Jest API)
// Coverage goal: > 80%

// Ejemplo: Task Service
// src/server/services/__tests__/task.service.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../task.service";
import { prismaMock } from "../../test/mocks/prisma";

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService(prismaMock);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a task with valid data", async () => {
      const taskData = {
        title: "Test Task",
        projectId: "project-123",
        creatorId: "user-123",
      };

      prismaMock.task.create.mockResolvedValue({
        id: "task-123",
        ...taskData,
        status: "TODO",
        priority: "MEDIUM",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await taskService.create(taskData);

      expect(result.id).toBe("task-123");
      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining(taskData),
      });
    });

    it("should throw error if title is empty", async () => {
      await expect(
        taskService.create({ title: "", projectId: "p-1", creatorId: "u-1" })
      ).rejects.toThrow("Title is required");
    });
  });

  describe("complete", () => {
    it("should mark task as completed with timestamp", async () => {
      const taskId = "task-123";
      const now = new Date();

      prismaMock.task.update.mockResolvedValue({
        id: taskId,
        status: "COMPLETED",
        completedAt: now,
      });

      const result = await taskService.complete(taskId);

      expect(result.status).toBe("COMPLETED");
      expect(result.completedAt).toBeDefined();
    });
  });
});

// Ejemplo: React Component
// src/components/__tests__/TaskCard.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "../TaskCard";

describe("TaskCard", () => {
  const mockTask = {
    id: "task-123",
    title: "Test Task",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date("2024-12-01"),
  };

  it("renders task title", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("shows priority indicator", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByTestId("priority-high")).toBeInTheDocument();
  });

  it("calls onComplete when checkbox clicked", () => {
    const onComplete = vi.fn();
    render(<TaskCard task={mockTask} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onComplete).toHaveBeenCalledWith("task-123");
  });
});
```

### 9.3 Integration Testing

```typescript
// Framework: Vitest + Supertest
// Database: PostgreSQL test container

// src/server/api/__tests__/task.router.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCaller } from "../root";
import { createTestContext } from "../../test/context";
import { prisma } from "../../db/client";

describe("Task Router Integration", () => {
  let caller: ReturnType<typeof createCaller>;
  let testUser: { id: string };
  let testProject: { id: string };

  beforeAll(async () => {
    // Setup test database
    const ctx = await createTestContext();
    caller = createCaller(ctx);

    // Create test fixtures
    testUser = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });

    const workspace = await prisma.workspace.create({
      data: { name: "Test Workspace", type: "PERSONAL", ownerId: testUser.id },
    });

    testProject = await prisma.project.create({
      data: { name: "Test Project", workspaceId: workspace.id },
    });
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE tasks, projects, workspaces, users CASCADE`;
  });

  it("creates task and returns with project info", async () => {
    const result = await caller.task.create({
      title: "Integration Test Task",
      projectId: testProject.id,
    });

    expect(result.id).toBeDefined();
    expect(result.title).toBe("Integration Test Task");
    expect(result.project.id).toBe(testProject.id);
  });

  it("lists tasks with pagination", async () => {
    // Create 15 tasks
    for (let i = 0; i < 15; i++) {
      await caller.task.create({
        title: `Task ${i}`,
        projectId: testProject.id,
      });
    }

    const page1 = await caller.task.list({ limit: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page1.nextCursor).toBeDefined();

    const page2 = await caller.task.list({
      limit: 10,
      cursor: page1.nextCursor,
    });
    expect(page2.items.length).toBeGreaterThan(0);
  });
});
```

### 9.4 End-to-End Testing

```typescript
// Framework: Playwright
// playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});

// e2e/auth.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("user can sign up and complete onboarding", async ({ page }) => {
    await page.goto("/signup");

    // Fill signup form
    await page.fill('[data-testid="email-input"]', "newuser@example.com");
    await page.fill('[data-testid="password-input"]', "SecurePass123!");
    await page.fill('[data-testid="name-input"]', "New User");
    await page.click('[data-testid="signup-button"]');

    // Verify onboarding started
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator("h1")).toContainText("Welcome");

    // Complete onboarding steps
    await page.click('[data-testid="workspace-personal"]');
    await page.click('[data-testid="next-button"]');

    // Create first task
    await page.fill('[data-testid="task-input"]', "My first task");
    await page.click('[data-testid="create-task-button"]');

    // Finish onboarding
    await page.click('[data-testid="finish-onboarding"]');

    // Verify dashboard
    await expect(page).toHaveURL("/today");
    await expect(page.locator('[data-testid="task-card"]')).toContainText(
      "My first task"
    );
  });

  test("user can login with existing account", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email-input"]', "existing@example.com");
    await page.fill('[data-testid="password-input"]', "Password123!");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL("/today");
  });
});

// e2e/tasks.spec.ts

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "Password123!");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/today");
  });

  test("user can create task with natural language", async ({ page }) => {
    await page.click('[data-testid="quick-add-button"]');
    await page.fill(
      '[data-testid="task-input"]',
      "Meeting with John tomorrow at 3pm #work @high"
    );
    await page.click('[data-testid="create-button"]');

    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toContainText("Meeting with John");
    await expect(
      taskCard.locator('[data-testid="priority-high"]')
    ).toBeVisible();
    await expect(taskCard.locator('[data-testid="tag-work"]')).toBeVisible();
  });

  test("user can complete task with animation", async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="quick-add-button"]');
    await page.fill('[data-testid="task-input"]', "Complete this task");
    await page.click('[data-testid="create-button"]');

    // Complete the task
    const checkbox = page.locator('[data-testid="task-checkbox"]').first();
    await checkbox.click();

    // Verify completion animation and status
    await expect(
      page.locator('[data-testid="task-completed"]').first()
    ).toBeVisible();
  });

  test("drag and drop reorders tasks", async ({ page }) => {
    // Create multiple tasks
    for (const title of ["Task 1", "Task 2", "Task 3"]) {
      await page.click('[data-testid="quick-add-button"]');
      await page.fill('[data-testid="task-input"]', title);
      await page.click('[data-testid="create-button"]');
    }

    // Drag Task 3 to top
    const task3 = page
      .locator('[data-testid="task-card"]')
      .filter({ hasText: "Task 3" });
    const task1 = page
      .locator('[data-testid="task-card"]')
      .filter({ hasText: "Task 1" });

    await task3.dragTo(task1);

    // Verify new order
    const tasks = await page
      .locator('[data-testid="task-card"]')
      .allTextContents();
    expect(tasks[0]).toContain("Task 3");
  });
});
```

### 9.5 Testing Commands

```bash
# Package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 10. CI/CD Pipeline

### 10.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: "20"
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ordo_test

jobs:
  # ==================== LINT & TYPE CHECK ====================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: cd web && npm ci

      - name: Run ESLint
        run: cd web && npm run lint

      - name: Type Check
        run: cd web && npm run type-check

  # ==================== UNIT TESTS ====================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: cd web && npm ci

      - name: Run Unit Tests
        run: cd web && npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./web/coverage/lcov.info
          fail_ci_if_error: true

  # ==================== INTEGRATION TESTS ====================
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ordo_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: cd web && npm ci

      - name: Generate Prisma Client
        run: cd web && npx prisma generate

      - name: Push Database Schema
        run: cd web && npx prisma db push

      - name: Run Integration Tests
        run: cd web && npm run test:integration
        env:
          REDIS_URL: redis://localhost:6379

  # ==================== E2E TESTS ====================
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint, unit-tests]
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ordo_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: cd web && npm ci

      - name: Install Playwright Browsers
        run: cd web && npx playwright install --with-deps

      - name: Setup Database
        run: |
          cd web
          npx prisma generate
          npx prisma db push
          npx prisma db seed

      - name: Build Application
        run: cd web && npm run build

      - name: Run E2E Tests
        run: cd web && npm run test:e2e
        env:
          NEXTAUTH_SECRET: test-secret-key
          NEXTAUTH_URL: http://localhost:3000

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: web/playwright-report/
          retention-days: 7

  # ==================== BUILD ====================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: cd web && npm ci

      - name: Build
        run: cd web && npm run build

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: web/.next/

  # ==================== DEPLOY STAGING ====================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.ordo-todo.app
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.ordo-todo.app

  # ==================== DEPLOY PRODUCTION ====================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://ordo-todo.app
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Run Database Migrations
        run: |
          cd web
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🚀 Deployed to production!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Ordo-Todo* deployed to production\nCommit: ${{ github.sha }}\nBy: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 10.2 Database Migrations

```yaml
# .github/workflows/db-migration.yml

name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to run migration"
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: cd web && npm ci

      - name: Run Migrations
        run: cd web && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Verify Migration
        run: cd web && npx prisma db pull --print
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 11. Monitoring & Observability

### 11.1 Metrics & Alerting

```typescript
// src/lib/monitoring/metrics.ts

import { PostHog } from "posthog-node";
import * as Sentry from "@sentry/nextjs";

// Initialize PostHog
export const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

// Custom metrics
export const metrics = {
  // Business metrics
  taskCreated: (userId: string, metadata: object) => {
    posthog.capture({
      distinctId: userId,
      event: "task_created",
      properties: metadata,
    });
  },

  taskCompleted: (userId: string, metadata: object) => {
    posthog.capture({
      distinctId: userId,
      event: "task_completed",
      properties: metadata,
    });
  },

  pomodoroCompleted: (userId: string, duration: number) => {
    posthog.capture({
      distinctId: userId,
      event: "pomodoro_completed",
      properties: { duration },
    });
  },

  // Technical metrics
  apiLatency: (endpoint: string, duration: number) => {
    posthog.capture({
      distinctId: "system",
      event: "api_latency",
      properties: { endpoint, duration },
    });
  },

  errorOccurred: (error: Error, context: object) => {
    Sentry.captureException(error, { extra: context });
  },
};

// Health check endpoint
// src/app/api/health/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { redis } from "@/lib/redis";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = { status: "up" };
  } catch (error) {
    health.services.database = { status: "down", error: error.message };
    health.status = "unhealthy";
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.redis = { status: "up" };
  } catch (error) {
    health.services.redis = { status: "down", error: error.message };
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

### 11.2 Alerting Rules

```yaml
# monitoring/alerts.yml

groups:
  - name: ordo-todo-alerts
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected (> 5%)"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Slow API Response
      - alert: SlowAPIResponse
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "API response time is slow (p95 > 2s)"
          description: "95th percentile response time is {{ $value }}s"

      # Database Connection Pool Exhausted
      - alert: DatabasePoolExhausted
        expr: |
          pg_stat_activity_count / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Connection usage is {{ $value | humanizePercentage }}"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: |
          container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage (> 90%)"

      # Task Sync Failures
      - alert: TaskSyncFailures
        expr: |
          rate(task_sync_failures_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate of task sync failures"
```

### 11.3 Logging Strategy

```typescript
// src/lib/logger.ts

import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: process.env.NODE_ENV === "development",
    },
  },
  base: {
    service: "ordo-todo",
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  },
  redact: ["password", "email", "token", "accessToken", "refreshToken"],
});

export { logger };

// Usage in API routes
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId });

  log.info({ path: "/api/tasks" }, "Task creation started");

  try {
    const result = await createTask(data);
    log.info({ taskId: result.id }, "Task created successfully");
    return NextResponse.json(result);
  } catch (error) {
    log.error({ error, data }, "Task creation failed");
    throw error;
  }
}
```

### 11.4 Dashboard Metrics

```yaml
# Key Performance Indicators Dashboard

Business Metrics:
  - Daily Active Users (DAU)
  - Monthly Active Users (MAU)
  - DAU/MAU Ratio (Stickiness)
  - Tasks Created per Day
  - Tasks Completed per Day
  - Completion Rate (%)
  - Pomodoros Completed per Day
  - Average Session Duration
  - Free to Paid Conversion Rate
  - Monthly Recurring Revenue (MRR)
  - Churn Rate

Technical Metrics:
  - API Response Time (p50, p95, p99)
  - Error Rate (%)
  - Uptime (%)
  - Database Query Performance
  - Cache Hit Rate
  - WebSocket Connection Count
  - Background Job Queue Length
  - CDN Cache Hit Rate

Infrastructure Metrics:
  - CPU Usage
  - Memory Usage
  - Disk I/O
  - Network Throughput
  - Container Restart Count
  - Database Connection Pool Usage
```

---

## 12. Rate Limiting & Throttling

### 12.1 API Rate Limiting

```typescript
// src/middleware/rateLimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different endpoints
const limiters = {
  // Standard API calls: 100 requests per minute
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:standard",
  }),

  // Authentication: 10 attempts per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // AI endpoints: 20 requests per minute (expensive)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "ratelimit:ai",
  }),

  // File uploads: 10 per minute
  uploads: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:uploads",
  }),

  // Export data: 5 per hour
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
    prefix: "ratelimit:export",
  }),
};

export async function rateLimitMiddleware(
  request: NextRequest,
  type: keyof typeof limiters = "standard"
) {
  const ip =
    request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const userId = request.headers.get("x-user-id") ?? ip;

  const limiter = limiters[type];
  const { success, limit, reset, remaining } = await limiter.limit(userId);

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (!success) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { status: 429, headers }
    );
  }

  return { headers };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const rateLimit = await rateLimitMiddleware(request, "ai");
  if (rateLimit instanceof NextResponse) {
    return rateLimit;
  }

  // Process request...
  return NextResponse.json({ data }, { headers: rateLimit.headers });
}
```

### 12.2 Rate Limits by Plan

```typescript
// Rate limits per subscription tier

const rateLimitsByPlan = {
  free: {
    api: { requests: 100, window: "1m" },
    ai: { requests: 10, window: "1m" },
    uploads: { requests: 5, window: "1m" },
    export: { requests: 1, window: "1h" },
  },
  pro: {
    api: { requests: 500, window: "1m" },
    ai: { requests: 50, window: "1m" },
    uploads: { requests: 20, window: "1m" },
    export: { requests: 10, window: "1h" },
  },
  team: {
    api: { requests: 1000, window: "1m" },
    ai: { requests: 100, window: "1m" },
    uploads: { requests: 50, window: "1m" },
    export: { requests: 30, window: "1h" },
  },
  enterprise: {
    api: { requests: 5000, window: "1m" },
    ai: { requests: 500, window: "1m" },
    uploads: { requests: 200, window: "1m" },
    export: { requests: 100, window: "1h" },
  },
};
```

---

## 13. Disaster Recovery & Backups

### 13.1 Backup Strategy

```yaml
# Backup Configuration

Database Backups:
  Provider: Supabase / Neon / AWS RDS

  Automated Backups:
    - Frequency: Every 6 hours
    - Retention: 7 days
    - Type: Full snapshot

  Point-in-Time Recovery:
    - Enabled: Yes
    - Retention: 7 days
    - Granularity: 1 minute

  Manual Backups:
    - Before major deployments
    - Before migrations
    - Retention: 30 days

File Storage Backups:
  Provider: Cloudflare R2 / AWS S3

  Replication:
    - Cross-region replication enabled
    - Primary: US-East
    - Replica: EU-West

  Versioning:
    - Enabled for all objects
    - Retention: 30 days

Redis Cache:
  - Not backed up (ephemeral by design)
  - Rebuild from database on failure
```

### 13.2 Disaster Recovery Procedures

```yaml
# Disaster Recovery Plan

Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour

Scenarios:

1. Database Failure:
  Steps:
    - Automatic failover to replica (if available)
    - If no replica: restore from latest backup
    - Verify data integrity
    - Update connection strings if needed
    - Notify users of any data loss

  Runbook:
    - Check Supabase/Neon dashboard for status
    - Initiate point-in-time recovery if needed
    - Run data verification scripts
    - Monitor error rates post-recovery

2. Complete Region Failure:
  Steps:
    - Activate secondary region
    - Update DNS to point to secondary
    - Restore database from cross-region replica
    - Verify all services operational

  DNS Failover:
    - TTL: 60 seconds
    - Health checks every 30 seconds
    - Automatic failover on 3 consecutive failures

3. Data Corruption:
  Steps:
    - Identify scope of corruption
    - Isolate affected data
    - Restore from point-in-time backup
    - Replay transactions if needed
    - Verify restored data

4. Security Breach:
  Steps:
    - Revoke all access tokens
    - Rotate all secrets and API keys
    - Audit access logs
    - Notify affected users
    - Restore from pre-breach backup if needed
    - Engage security incident response team
```

### 13.3 Backup Verification

```typescript
// scripts/verify-backup.ts

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function verifyBackup() {
  console.log("🔍 Starting backup verification...");

  // 1. Check latest backup exists
  const backups = await listBackups();
  if (backups.length === 0) {
    throw new Error("No backups found!");
  }

  const latestBackup = backups[0];
  const backupAge = Date.now() - new Date(latestBackup.created_at).getTime();
  const maxAge = 6 * 60 * 60 * 1000; // 6 hours

  if (backupAge > maxAge) {
    throw new Error(
      `Latest backup is too old: ${backupAge / 1000 / 60} minutes`
    );
  }

  console.log(
    `✅ Latest backup: ${latestBackup.id} (${
      backupAge / 1000 / 60
    } minutes ago)`
  );

  // 2. Restore to test database
  console.log("🔄 Restoring to test database...");
  await restoreToTestDb(latestBackup.id);

  // 3. Verify data integrity
  console.log("🔍 Verifying data integrity...");
  const checks = await runIntegrityChecks();

  if (!checks.passed) {
    throw new Error(`Integrity check failed: ${checks.errors.join(", ")}`);
  }

  console.log("✅ All integrity checks passed");

  // 4. Cleanup test database
  await cleanupTestDb();

  console.log("✅ Backup verification complete");
}

// Run weekly
verifyBackup().catch(console.error);
```

---

## 14. API Versioning

### 14.1 Versioning Strategy

```typescript
// API Versioning via URL path

// Routes structure:
// /api/v1/tasks    - Version 1 (stable)
// /api/v2/tasks    - Version 2 (current)
// /api/v3/tasks    - Version 3 (beta)

// src/app/api/v1/tasks/route.ts - Legacy
// src/app/api/v2/tasks/route.ts - Current
// src/app/api/v3/tasks/route.ts - Beta

// Version Header Alternative:
// Accept: application/vnd.ordo-todo.v2+json

// Middleware to handle versioning
export function versionMiddleware(request: NextRequest) {
  // Check URL path first
  const pathMatch = request.nextUrl.pathname.match(/\/api\/v(\d+)\//);
  if (pathMatch) {
    return { version: parseInt(pathMatch[1]) };
  }

  // Check Accept header
  const accept = request.headers.get("Accept") || "";
  const headerMatch = accept.match(/application\/vnd\.ordo-todo\.v(\d+)\+json/);
  if (headerMatch) {
    return { version: parseInt(headerMatch[1]) };
  }

  // Default to latest stable version
  return { version: 2 };
}
```

### 14.2 Deprecation Policy

```yaml
# API Deprecation Policy

Timeline:
  - Announcement: 6 months before deprecation
  - Deprecation Warning Headers: 3 months before
  - Sunset: After 6 months from announcement
  - Removal: 12 months after announcement

Communication:
  - Email to all API users
  - Dashboard notification
  - API response headers:
    - Deprecation: true
    - Sunset: Sat, 01 Jan 2025 00:00:00 GMT
    - Link: <https://docs.ordo-todo.app/migration>; rel="deprecation"
  - Changelog update
  - Documentation update

Migration Support:
  - Migration guide documentation
  - Code examples for new endpoints
  - Support tickets priority handling
  - Office hours for enterprise customers

Response Headers Example:
  Deprecation: @1735689600
  Sunset: Sat, 01 Jan 2026 00:00:00 GMT
  X-API-Version: v1
  X-API-Version-Latest: v2
  Link: <https://docs.ordo-todo.app/api/v2/migration>; rel="successor-version"
```

### 14.3 Changelog

```markdown
# API Changelog

## v2.0.0 (Current) - 2024-11-01

### Breaking Changes

- Task `status` enum now uses UPPERCASE values
- Removed deprecated `dueDate` string format, use ISO 8601
- Pagination now uses cursor-based instead of offset

### New Features

- Added `energyRequired` field to tasks
- New `/ai/suggest` endpoint for AI recommendations
- WebSocket support for real-time updates

### Deprecations

- `GET /tasks?page=X` deprecated, use `cursor` instead
- `priority` numeric values deprecated, use string enum

## v1.5.0 - 2024-08-01

...

## v1.0.0 - 2024-05-01

- Initial public API release
```

---

## 15. Development Phases

### 15.1 Phase Alignment with PRD

```yaml
# Development Phases (aligned with PRD roadmap)

Phase 1 - MVP (Months 1-4):
  Backend:
    - Authentication system (NextAuth.js)
    - Database schema (Prisma)
    - Core tRPC routers (task, project, workspace)
    - Basic timer logic
    - Real-time sync foundation

  Frontend:
    - Login/Signup pages
    - Dashboard layout
    - Task CRUD UI
    - List and Calendar views
    - Pomodoro timer widget
    - Onboarding flow
    - Empty states
    - Error handling UI

  Infrastructure:
    - CI/CD pipeline
    - Staging environment
    - Basic monitoring
    - Database backups

Phase 2 - V1.0 (Months 5-6):
  Backend:
    - AI integration (OpenAI)
    - Team collaboration logic
    - Calendar sync API
    - Offline sync engine

  Frontend:
    - Kanban view
    - Team workspace UI
    - AI suggestions panel
    - Calendar integration
    - i18n (ES, PT)

  Mobile:
    - React Native setup
    - Core screens
    - Push notifications

  Infrastructure:
    - Production multi-region
    - Enhanced monitoring
    - Rate limiting

Phase 3 - V1.5 (Months 7-9):
  Backend:
    - Advanced AI features
    - Integration APIs (Gmail, Slack)
    - Analytics engine

  Frontend:
    - Timeline view
    - Advanced analytics
    - Integration hub
    - Focus Shield mode
    - i18n (FR, DE, IT)

  Desktop:
    - Electron wrapper (if PWA insufficient)
    - System tray
    - Global shortcuts

  Infrastructure:
    - API versioning
    - Enhanced disaster recovery
    - Performance optimization

Phase 4 - V2.0 (Months 10-12):
  Backend:
    - Energy matching algorithm
    - Custom automation engine
    - Public API
    - Template marketplace backend

  Frontend:
    - Energy matching UI
    - Automation builder
    - API documentation
    - Widget builder
    - i18n (JA, KO, ZH, AR)

  Infrastructure:
    - API gateway
    - CDN optimization
    - Global edge deployment
```

---

**Documento Técnico Completo**

Este documento ahora incluye todas las secciones identificadas como faltantes:
✅ Testing Strategy (Unit, Integration, E2E)
✅ CI/CD Pipeline detallado
✅ Monitoring & Observability
✅ Rate Limiting & Throttling
✅ Disaster Recovery & Backups
✅ API Versioning
✅ Development Phases alineadas con PRD

**Versión**: 1.1  
**Última actualización**: Noviembre 2025  
**Owner**: Equipo Ordo-Todo  
**Status**: Aprobado para desarrollo
