# Desktop App Migration Guide: tRPC to REST API

This guide helps you migrate remaining components from tRPC to the REST API client.

## Migration Status

### ✅ Completed
- Added `@ordo-todo/api-client` and `electron-store` dependencies
- Created Electron Store token storage implementation
- Created API client instance configuration
- Created React Query provider
- Created all API hooks (auth, tasks, workspaces, projects, tags, timers, comments, attachments, analytics)
- Updated Auth context to use REST API hooks
- Replaced tRPC provider with QueryProvider
- Updated key components (task-list, create-task-dialog, create-project-dialog)
- Created .env configuration

### 🔄 Remaining Components to Update

The following components still use tRPC and need to be migrated:

#### Pages
- `src/pages/Tags.tsx`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetail.tsx`
- `src/pages/Dashboard.tsx`

#### Workspace Components
- `src/components/workspace/WorkspaceSelector.tsx`
- `src/components/workspace/WorkspaceSettingsDialog.tsx`
- `src/components/workspace/CreateWorkspaceDialog.tsx`

#### Timer Components
- `src/components/timer/task-selector.tsx`
- `src/components/timer/timer-widget.tsx`
- `src/components/timer/pomodoro-timer.tsx`

#### Task Components
- `src/components/task/task-detail-panel.tsx`
- `src/components/task/subtask-list.tsx`
- `src/components/task/task-card.tsx`

#### Tag Components
- `src/components/tag/tag-selector.tsx`
- `src/components/tag/create-tag-dialog.tsx`

#### Project Components
- `src/components/project/project-card.tsx`

## Migration Pattern

### OLD (tRPC):
```typescript
import { api } from "@/utils/api";

function Component() {
  const utils = api.useUtils();
  const { data, isLoading } = api.task.list.useQuery();

  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
    },
  });

  // Usage
  createTask.mutate({ title: "Task" });
}
```

### NEW (REST API):
```typescript
import { useTasks, useCreateTask } from "@/hooks/api";

function Component() {
  const { data, isLoading } = useTasks();
  const createTask = useCreateTask();

  // Usage
  const handleCreate = async () => {
    try {
      await createTask.mutateAsync({ title: "Task" });
      toast.success("Task created!");
    } catch (error) {
      toast.error(error.message);
    }
  };
}
```

## Step-by-Step Migration for Each Component

### 1. Update Imports
Replace:
```typescript
import { api } from "@/utils/api";
```

With specific hooks:
```typescript
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/api";
```

### 2. Replace useQuery calls

**Tasks:**
```typescript
// OLD
api.task.list.useQuery(undefined)
// NEW
useTasks()

// OLD with params
api.task.list.useQuery({ projectId })
// NEW
useTasks(projectId)
```

**Projects:**
```typescript
// OLD
api.project.listAll.useQuery()
// NEW
useProjects()

// OLD with ID
api.project.getById.useQuery(projectId)
// NEW
useProject(projectId)
```

**Workspaces:**
```typescript
// OLD
api.workspace.list.useQuery()
// NEW
useWorkspaces()
```

**Tags:**
```typescript
// OLD
api.tag.list.useQuery({ workspaceId })
// NEW
useTags(workspaceId)
```

**Timers:**
```typescript
// OLD
api.timer.active.useQuery()
// NEW
useActiveTimeSession()

// OLD
api.timer.sessions.useQuery({ taskId })
// NEW
useTimeSessions(taskId)
```

### 3. Replace useMutation calls

**Tasks:**
```typescript
// OLD
const createTask = api.task.create.useMutation({
  onSuccess: () => {
    utils.task.list.invalidate();
  }
});
createTask.mutate(data);

// NEW
const createTask = useCreateTask();
await createTask.mutateAsync(data);
// Invalidation happens automatically in the hook
```

**Projects:**
```typescript
// OLD
const updateProject = api.project.update.useMutation();
updateProject.mutate({ id, data });

// NEW
const updateProject = useUpdateProject();
await updateProject.mutateAsync({ projectId: id, data });
```

### 4. Remove utils usage

The `utils` object from tRPC is no longer needed. Cache invalidation is handled automatically in the mutation hooks.

```typescript
// OLD - Remove this
const utils = api.useUtils();
utils.task.list.invalidate();

// NEW - Happens automatically
// No manual invalidation needed
```

### 5. Update enabled queries

```typescript
// OLD
api.task.list.useQuery(projectId, {
  enabled: !!projectId && open,
});

// NEW
useTasks(projectId);
// The hook already has enabled: !!projectId internally
// Add custom enabled logic like this:
const { data } = useTasks(projectId);
const shouldFetch = !!projectId && open;
// Use conditional rendering or custom query wrapper if needed
```

### 6. Handle dates properly

REST API uses ISO strings for dates:

```typescript
// OLD
createTask.mutate({
  dueDate: new Date(dateString),
});

// NEW
createTask.mutateAsync({
  dueDate: new Date(dateString).toISOString(),
});
```

## Available Hooks

### Authentication
- `useCurrentUser()` - Get current user
- `useLogin()` - Login mutation
- `useRegister()` - Register mutation
- `useLogout()` - Logout mutation

### Tasks
- `useTasks(projectId?)` - Get all tasks
- `useTask(taskId)` - Get task by ID
- `useCreateTask()` - Create task
- `useUpdateTask()` - Update task
- `useDeleteTask()` - Delete task
- `useCompleteTask()` - Complete task
- `useReactivateTask()` - Reactivate task
- `useSubtasks(parentTaskId)` - Get subtasks
- `useTaskDependencies(taskId)` - Get dependencies

### Projects
- `useProjects(workflowId?)` - Get all projects
- `useProject(projectId)` - Get project by ID
- `useCreateProject()` - Create project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project
- `useArchiveProject()` - Archive project
- `useUnarchiveProject()` - Unarchive project

### Workspaces
- `useWorkspaces()` - Get all workspaces
- `useWorkspace(workspaceId)` - Get workspace by ID
- `useCreateWorkspace()` - Create workspace
- `useUpdateWorkspace()` - Update workspace
- `useDeleteWorkspace()` - Delete workspace

### Workflows
- `useWorkflows(workspaceId?)` - Get all workflows
- `useWorkflow(workflowId)` - Get workflow by ID
- `useCreateWorkflow()` - Create workflow
- `useUpdateWorkflow()` - Update workflow
- `useDeleteWorkflow()` - Delete workflow

### Tags
- `useTags(workspaceId?)` - Get all tags
- `useTag(tagId)` - Get tag by ID
- `useCreateTag()` - Create tag
- `useUpdateTag()` - Update tag
- `useDeleteTag()` - Delete tag

### Timers
- `useTimeSessions(taskId?)` - Get time sessions
- `useTimeSession(sessionId)` - Get session by ID
- `useActiveTimeSession()` - Get active session (polls every 5s)
- `useStartTimer()` - Start timer
- `useStopTimer()` - Stop timer
- `usePauseTimer()` - Pause timer
- `useResumeTimer()` - Resume timer
- `useDeleteTimeSession()` - Delete session

### Comments
- `useComments(taskId)` - Get comments for task
- `useComment(commentId)` - Get comment by ID
- `useCreateComment()` - Create comment
- `useUpdateComment()` - Update comment
- `useDeleteComment()` - Delete comment

### Attachments
- `useAttachments(taskId)` - Get attachments for task
- `useAttachment(attachmentId)` - Get attachment by ID
- `useUploadAttachment()` - Upload file
- `useDeleteAttachment()` - Delete attachment

### Analytics
- `useDailyMetrics(userId?, startDate?, endDate?)` - Get daily metrics
- `useProductivityReport(userId?, period?)` - Get productivity report
- `useWorkspaceAnalytics(workspaceId)` - Get workspace analytics
- `useProjectAnalytics(projectId)` - Get project analytics

## Testing After Migration

After migrating each component:

1. **Test data fetching** - Ensure data loads correctly
2. **Test mutations** - Create, update, delete operations work
3. **Test error handling** - Errors display properly
4. **Test loading states** - Loading indicators appear
5. **Test cache invalidation** - Data refreshes after mutations

## Running the App

```bash
# Install new dependencies
npm install

# Start the NestJS backend (required!)
cd packages/api
npm run dev

# Start the desktop app
cd apps/desktop
npm run dev
```

The desktop app will connect to `http://localhost:3001/api/v1` by default.

## Troubleshooting

### "Cannot find module '@/hooks/api'"
Make sure your tsconfig has the correct path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Token storage error"
Ensure electron-store is properly imported. Check that you're not in a browser context.

### "Network error"
1. Check that the NestJS backend is running on port 3001
2. Verify VITE_API_URL in .env file
3. Check browser console for CORS errors

### "Type errors"
Import types from `@ordo-todo/api-client`:
```typescript
import type { Task, CreateTaskDto, UpdateTaskDto } from '@ordo-todo/api-client';
```

## Final Cleanup

After all components are migrated:

1. Remove tRPC dependencies from package.json:
   ```bash
   npm uninstall @trpc/client @trpc/react-query superjson
   ```

2. Delete tRPC files:
   ```bash
   rm -rf src/utils/api.ts
   rm -rf src/components/providers/trpc-provider.tsx
   ```

3. Remove @ordo-todo/db dependency (no longer needed in desktop):
   ```bash
   npm uninstall @ordo-todo/db
   ```

4. Test the entire application thoroughly

## Next Steps

Once migration is complete:
- Add offline support with React Query persistence
- Implement optimistic updates for better UX
- Add request retry logic for failed mutations
- Consider adding a service worker for background sync
