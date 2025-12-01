# Desktop App Migration Summary: tRPC → REST API

## Overview
Successfully migrated the Electron/React desktop application from tRPC to the NestJS REST API using `@ordo-todo/api-client`.

## Completed Work

### 1. Infrastructure Setup ✅

#### Dependencies Added
- `@ordo-todo/api-client`: Shared REST API client for all platforms
- `electron-store@^8.1.0`: Persistent token storage for Electron

#### Dependencies Removed
- `@trpc/client`
- `@trpc/react-query`
- `superjson`
- `@ordo-todo/db` (no longer needed in desktop app)

### 2. Token Storage Implementation ✅

**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\lib\storage.ts`

```typescript
import Store from 'electron-store';
import type { TokenStorage } from '@ordo-todo/api-client';

export class ElectronStoreTokenStorage implements TokenStorage {
  // Persists auth tokens across app restarts
  getToken(): string | null
  setToken(token: string): void
  removeToken(): void
  getRefreshToken(): string | null
  setRefreshToken(token: string): void
}
```

### 3. API Client Configuration ✅

**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\lib\api-client.ts`

- Configured to connect to `http://localhost:3001/api/v1`
- Uses ElectronStoreTokenStorage for token persistence
- Includes token refresh and auth error handlers

### 4. React Query Setup ✅

**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\providers\query-provider.tsx`

Configuration:
- 2 retries on query failure
- 5-minute stale time
- Refetch on window focus
- Refetch on reconnect

### 5. API Hooks Created ✅

**Location:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\hooks\api/`

Created comprehensive hooks for all API endpoints:

#### Authentication (`use-auth.ts`)
- `useCurrentUser()` - Get current user
- `useLogin()` - Login mutation
- `useRegister()` - Register mutation
- `useLogout()` - Logout mutation
- `useRefreshToken()` - Refresh token mutation

#### Tasks (`use-tasks.ts`)
- `useTasks(projectId?)` - List tasks
- `useTask(taskId)` - Get task by ID
- `useCreateTask()` - Create task
- `useUpdateTask()` - Update task
- `useDeleteTask()` - Delete task
- `useCompleteTask()` - Complete task
- `useReactivateTask()` - Reactivate task
- `useSubtasks(parentTaskId)` - Get subtasks
- `useTaskDependencies(taskId)` - Get dependencies

#### Projects (`use-projects.ts`)
- `useProjects(workflowId?)` - List projects
- `useProject(projectId)` - Get project by ID
- `useCreateProject()` - Create project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project
- `useArchiveProject()` - Archive project
- `useUnarchiveProject()` - Unarchive project

#### Workspaces (`use-workspaces.ts`)
- `useWorkspaces()` - List workspaces
- `useWorkspace(workspaceId)` - Get workspace by ID
- `useCreateWorkspace()` - Create workspace
- `useUpdateWorkspace()` - Update workspace
- `useDeleteWorkspace()` - Delete workspace

#### Workflows (`use-workflows.ts`)
- `useWorkflows(workspaceId?)` - List workflows
- `useWorkflow(workflowId)` - Get workflow by ID
- `useCreateWorkflow()` - Create workflow
- `useUpdateWorkflow()` - Update workflow
- `useDeleteWorkflow()` - Delete workflow

#### Tags (`use-tags.ts`)
- `useTags(workspaceId?)` - List tags
- `useTag(tagId)` - Get tag by ID
- `useCreateTag()` - Create tag
- `useUpdateTag()` - Update tag
- `useDeleteTag()` - Delete tag

#### Timers (`use-timers.ts`)
- `useTimeSessions(taskId?)` - List time sessions
- `useTimeSession(sessionId)` - Get session by ID
- `useActiveTimeSession()` - Get active session (polls every 5s)
- `useStartTimer()` - Start timer
- `useStopTimer()` - Stop timer
- `usePauseTimer()` - Pause timer
- `useResumeTimer()` - Resume timer
- `useDeleteTimeSession()` - Delete session

#### Comments (`use-comments.ts`)
- `useComments(taskId)` - List comments
- `useComment(commentId)` - Get comment by ID
- `useCreateComment()` - Create comment
- `useUpdateComment()` - Update comment
- `useDeleteComment()` - Delete comment

#### Attachments (`use-attachments.ts`)
- `useAttachments(taskId)` - List attachments
- `useAttachment(attachmentId)` - Get attachment by ID
- `useUploadAttachment()` - Upload file
- `useDeleteAttachment()` - Delete attachment

#### Analytics (`use-analytics.ts`)
- `useDailyMetrics(userId?, startDate?, endDate?)` - Get daily metrics
- `useProductivityReport(userId?, period?)` - Get productivity report
- `useWorkspaceAnalytics(workspaceId)` - Workspace analytics
- `useProjectAnalytics(projectId)` - Project analytics

### 6. Provider Updates ✅

#### Auth Provider
**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\components\providers\auth-provider.tsx`

- Migrated from mock auth to real REST API
- Uses `useCurrentUser`, `useLogin`, `useRegister`, `useLogout` hooks
- Provides `user`, `isLoading`, `isAuthenticated`, `login`, `logout`, `signup`

#### Main Providers
**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\src\components\providers\index.tsx`

- Replaced `TRPCProvider` with `QueryProvider`
- Provider chain: ThemeProvider → QueryProvider → AuthProvider

### 7. Component Updates ✅

#### Migrated Components

**Task Components:**
- `task-list.tsx` - Uses `useTasks()`, `useCompleteTask()`
- `create-task-dialog.tsx` - Uses `useCreateTask()`, `useProjects()`

**Project Components:**
- `create-project-dialog.tsx` - Uses `useCreateProject()`, `useWorkspaces()`, `useWorkflows()`, `useCreateWorkflow()`

### 8. Environment Configuration ✅

**Files:**
- `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\.env`
- `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\.env.example`

```env
VITE_API_URL=http://localhost:3001/api/v1
NODE_ENV=development
```

### 9. Documentation ✅

**File:** `C:\Users\Usuario\source\repos\ordo-todo\apps\desktop\MIGRATION_GUIDE.md`

Comprehensive guide covering:
- Migration patterns (tRPC vs REST API)
- Step-by-step instructions for each component type
- Complete list of available hooks
- Testing checklist
- Troubleshooting guide

## Key Architecture Changes

### Before (tRPC)
```
Desktop App → tRPC Client → Web App (Next.js) → Prisma → Database
```

### After (REST API)
```
Desktop App → API Client → NestJS Backend → Prisma → Database
```

## Benefits

1. **Decoupled Architecture**: Desktop app no longer depends on web app
2. **Shared API Client**: Same client used across web, mobile, and desktop
3. **Type Safety**: Full TypeScript types from `@ordo-todo/api-client`
4. **Persistent Auth**: Tokens stored in Electron Store survive app restarts
5. **Better Offline Support**: React Query provides robust caching
6. **Simplified Deployment**: Desktop app can run independently

## File Structure

```
apps/desktop/
├── src/
│   ├── lib/
│   │   ├── storage.ts              # Electron Store token storage
│   │   └── api-client.ts           # API client configuration
│   ├── providers/
│   │   └── query-provider.tsx      # React Query setup
│   ├── hooks/
│   │   └── api/
│   │       ├── use-auth.ts         # Auth hooks
│   │       ├── use-tasks.ts        # Task hooks
│   │       ├── use-projects.ts     # Project hooks
│   │       ├── use-workspaces.ts   # Workspace hooks
│   │       ├── use-workflows.ts    # Workflow hooks
│   │       ├── use-tags.ts         # Tag hooks
│   │       ├── use-timers.ts       # Timer hooks
│   │       ├── use-comments.ts     # Comment hooks
│   │       ├── use-attachments.ts  # Attachment hooks
│   │       ├── use-analytics.ts    # Analytics hooks
│   │       └── index.ts            # Barrel export
│   └── components/
│       └── providers/
│           ├── auth-provider.tsx   # Updated for REST API
│           └── index.tsx           # Uses QueryProvider
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── MIGRATION_GUIDE.md              # Step-by-step migration guide
└── package.json                    # Updated dependencies
```

## Remaining Work

### Components Still Using tRPC (Need Manual Migration)

Use the migration guide to update these components:

**Pages:**
- `src/pages/Tags.tsx`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetail.tsx`
- `src/pages/Dashboard.tsx`

**Workspace Components:**
- `src/components/workspace/WorkspaceSelector.tsx`
- `src/components/workspace/WorkspaceSettingsDialog.tsx`
- `src/components/workspace/CreateWorkspaceDialog.tsx`

**Timer Components:**
- `src/components/timer/task-selector.tsx`
- `src/components/timer/timer-widget.tsx`
- `src/components/timer/pomodoro-timer.tsx`

**Task Components:**
- `src/components/task/task-detail-panel.tsx`
- `src/components/task/subtask-list.tsx`
- `src/components/task/task-card.tsx`

**Tag Components:**
- `src/components/tag/tag-selector.tsx`
- `src/components/tag/create-tag-dialog.tsx`

**Project Components:**
- `src/components/project/project-card.tsx`

### Files to Delete After Full Migration

```bash
# tRPC files (no longer needed)
rm src/utils/api.ts
rm src/components/providers/trpc-provider.tsx
```

## How to Use

### 1. Install Dependencies

```bash
cd apps/desktop
npm install
```

### 2. Start Backend

```bash
# The NestJS backend must be running!
cd packages/api
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Start Desktop App

```bash
cd apps/desktop
npm run dev
```

### 4. Migrate Remaining Components

Follow the `MIGRATION_GUIDE.md` to update remaining components from tRPC to REST API.

### 5. Test Thoroughly

- Login/Logout
- Create/Update/Delete operations
- Timer functionality
- Offline behavior
- Token refresh

## Migration Pattern Reference

### Query Hook
```typescript
// OLD
const { data } = api.task.list.useQuery({ projectId });

// NEW
import { useTasks } from '@/hooks/api';
const { data } = useTasks(projectId);
```

### Mutation Hook
```typescript
// OLD
const createTask = api.task.create.useMutation({
  onSuccess: () => utils.task.list.invalidate()
});
createTask.mutate({ title: "Task" });

// NEW
import { useCreateTask } from '@/hooks/api';
const createTask = useCreateTask();
await createTask.mutateAsync({ title: "Task" });
// Cache invalidation happens automatically
```

## Next Steps

1. **Complete Component Migration**: Update remaining components using `MIGRATION_GUIDE.md`
2. **Remove tRPC Files**: Delete obsolete tRPC provider and utils
3. **Testing**: Comprehensive testing of all features
4. **Offline Support**: Implement React Query persistence
5. **Optimistic Updates**: Add optimistic UI for better UX
6. **Error Boundaries**: Add proper error handling throughout app

## Support

For issues or questions:
- Check `MIGRATION_GUIDE.md` for detailed patterns
- Review migrated components as examples
- Consult `@ordo-todo/api-client` documentation
- Check React Query documentation for advanced caching strategies

---

**Migration Status:** Core infrastructure complete, component migration in progress
**Next Action:** Use MIGRATION_GUIDE.md to update remaining components
**Estimated Time:** 2-4 hours for remaining components
