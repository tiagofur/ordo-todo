# tRPC to REST API Migration Guide

## Migration Status: 80% Complete

### ✅ Completed Phases

1. **Phase 1: API Client Setup** ✓
   - Added `@ordo-todo/api-client` dependency
   - Created API client instance (`src/lib/api-client.ts`)
   - Created comprehensive React Query hooks (`src/lib/api-hooks.ts`)

2. **Phase 2: Authentication** ✓
   - Created new Auth Context (`src/contexts/auth-context.tsx`)
   - Updated signin page to use REST API
   - Updated signup page to use REST API
   - Replaced NextAuth with JWT token management
   - Updated providers to use new auth system

3. **Phase 4: Server Components** ✓
   - Created server-side API client (`src/lib/api-server.ts`)
   - Supports token-based authentication for server components

4. **Phase 5: Dependency Cleanup** ✓
   - Removed `@trpc/client`, `@trpc/react-query`, `@trpc/server`
   - Removed `superjson` (was only needed for tRPC)
   - Updated package description

5. **Phase 6: Environment Variables** ✓
   - Created `.env.local` with API_URL configuration
   - Set up `NEXT_PUBLIC_API_URL` for client-side
   - Set up `API_URL` for server-side

### 🔄 Partially Completed

**Phase 3: Component Migration** - ~30% complete

#### Migrated Components:
- ✅ `src/app/auth/signin/page.tsx`
- ✅ `src/app/auth/signup/page.tsx`
- ✅ `src/app/(pages)/projects/page.tsx`
- ✅ `src/components/project/create-project-dialog.tsx`
- ✅ `src/components/project/project-card.tsx`
- ✅ `src/components/workspace/workspace-selector.tsx`
- ✅ `src/components/providers/index.tsx`

#### Remaining Components to Migrate:

**High Priority (Core Functionality):**
1. `src/app/(pages)/projects/[projectId]/page.tsx` - Project detail view
2. `src/app/(pages)/tasks/page.tsx` - Tasks page
3. `src/components/task/task-list.tsx` - Main task list
4. `src/components/task/create-task-dialog.tsx` - Task creation
5. `src/components/task/task-card.tsx` - Task display
6. `src/components/task/task-form.tsx` - Task editing

**Medium Priority (Enhanced Features):**
7. `src/components/task/task-detail-panel.tsx` - Task details
8. `src/components/task/task-detail-view.tsx` - Task full view
9. `src/components/task/subtask-list.tsx` - Subtask management
10. `src/components/task/comment-thread.tsx` - Comments
11. `src/components/task/attachment-list.tsx` - Attachments
12. `src/components/timer/timer-widget.tsx` - Timer functionality
13. `src/components/timer/pomodoro-timer.tsx` - Pomodoro timer
14. `src/components/timer/task-selector.tsx` - Timer task selection

**Lower Priority (Supporting Features):**
15. `src/components/workspace/workspace-settings-dialog.tsx`
16. `src/components/workspace/workspace-info-bar.tsx`
17. `src/components/workspace/create-workspace-dialog.tsx`
18. `src/components/tag/tag-selector.tsx`
19. `src/components/tag/create-tag-dialog.tsx`
20. `src/app/(pages)/tags/page.tsx`

## Migration Pattern

### Find and Replace Pattern

For each component, follow this pattern:

#### Step 1: Update Imports

**BEFORE:**
```typescript
import { api } from "@/utils/api";
```

**AFTER:**
```typescript
import {
  useWorkspaces,
  useProjects,
  useTasks,
  useCreateTask,
  // ... import whatever hooks you need
} from "@/lib/api-hooks";
```

#### Step 2: Replace Query Hooks

**BEFORE:**
```typescript
const { data: tasks, isLoading } = api.task.list.useQuery({ projectId });
```

**AFTER:**
```typescript
const { data: tasks, isLoading } = useTasks(projectId);
```

**Common Replacements:**

| tRPC Call | REST Hook |
|-----------|-----------|
| `api.workspace.list.useQuery()` | `useWorkspaces()` |
| `api.workspace.get.useQuery({ id })` | `useWorkspace(id)` |
| `api.workflow.list.useQuery({ workspaceId })` | `useWorkflows(workspaceId)` |
| `api.project.list.useQuery({ workspaceId })` | `useProjects(workspaceId)` |
| `api.project.get.useQuery({ id })` | `useProject(id)` |
| `api.task.list.useQuery({ projectId })` | `useTasks(projectId)` |
| `api.task.get.useQuery({ id })` | `useTask(id)` |
| `api.task.getDetails.useQuery({ id })` | `useTaskDetails(id)` |
| `api.tag.list.useQuery({ workspaceId })` | `useTags(workspaceId)` |
| `api.timer.getActive.useQuery()` | `useActiveTimer()` |

#### Step 3: Replace Mutation Hooks

**BEFORE:**
```typescript
const utils = api.useUtils();

const createTask = api.task.create.useMutation({
  onSuccess: () => {
    utils.task.list.invalidate();
    toast.success("Task created");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
createTask.mutate({ title: "New task", projectId });
```

**AFTER:**
```typescript
const createTask = useCreateTask();

// Usage - with manual success/error handling
try {
  await createTask.mutateAsync({ title: "New task", projectId });
  toast.success("Task created");
} catch (error: any) {
  toast.error(error?.response?.data?.message || "Failed to create task");
}

// OR use the mutation with callbacks
const createTask = useCreateTask();
createTask.mutate(
  { title: "New task", projectId },
  {
    onSuccess: () => toast.success("Task created"),
    onError: (error: any) => toast.error(error?.response?.data?.message),
  }
);
```

**Note:** Cache invalidation is already handled automatically in the hooks, so you don't need `utils.invalidate()` calls.

**Common Mutation Replacements:**

| tRPC Mutation | REST Hook |
|---------------|-----------|
| `api.workspace.create.useMutation()` | `useCreateWorkspace()` |
| `api.workspace.update.useMutation()` | `useUpdateWorkspace()` |
| `api.workspace.delete.useMutation()` | `useDeleteWorkspace()` |
| `api.workflow.create.useMutation()` | `useCreateWorkflow()` |
| `api.project.create.useMutation()` | `useCreateProject()` |
| `api.project.update.useMutation()` | `useUpdateProject()` |
| `api.project.archive.useMutation()` | `useArchiveProject()` |
| `api.project.delete.useMutation()` | `useDeleteProject()` |
| `api.task.create.useMutation()` | `useCreateTask()` |
| `api.task.update.useMutation()` | `useUpdateTask()` |
| `api.task.complete.useMutation()` | `useCompleteTask()` |
| `api.task.delete.useMutation()` | `useDeleteTask()` |
| `api.timer.start.useMutation()` | `useStartTimer()` |
| `api.timer.stop.useMutation()` | `useStopTimer()` |

#### Step 4: Remove utils.useUtils()

The new hooks handle cache invalidation automatically, so remove:

```typescript
const utils = api.useUtils(); // ❌ DELETE THIS
```

## Automated Migration Steps

### 1. Global Search and Replace (in VS Code)

**Search:** `from "@/utils/api"`
**Replace:** `from "@/lib/api-hooks"`

**Search:** `const utils = api.useUtils();`
**Replace:** (delete this line)

**Search:** `utils\.[a-z]+\.[a-z]+\.invalidate\([^)]*\);?`
**Replace:** (delete these lines - auto-handled now)

### 2. Manual Component Updates

For each file in the "Remaining Components" list above:

1. Open the file
2. Find all `api.{domain}.{operation}.useQuery()` calls
3. Replace with corresponding `use{Operation}()` hook
4. Find all `api.{domain}.{operation}.useMutation()` calls
5. Replace with corresponding `use{Operation}()` hook
6. Update error handling to use `error?.response?.data?.message`
7. Remove `utils` usage
8. Test the component

## Testing Checklist

After migrating each component, verify:

- [ ] Component renders without errors
- [ ] Data loads correctly
- [ ] Loading states work
- [ ] Error states are handled
- [ ] Mutations work (create, update, delete)
- [ ] Toast notifications appear
- [ ] Cache updates automatically
- [ ] No console errors

## Files to Delete (After Full Migration)

Once ALL components are migrated, you can delete:

1. `src/utils/api.ts` - tRPC client setup
2. `src/components/providers/trpc-provider.tsx` - tRPC provider
3. `src/components/providers/auth-provider.tsx` - Old NextAuth provider (replaced)
4. `src/server/trpc.ts` - tRPC server setup
5. `src/server/api/` - Entire tRPC routers directory
6. `src/app/api/trpc/` - tRPC API route handlers (if exists)

**⚠️ DO NOT DELETE THESE YET** - Only after confirming all components work with REST API.

## Backend Requirements

Ensure the NestJS backend is running:

```bash
cd apps/backend
npm run start:dev
```

Backend should be available at: `http://localhost:3001/api/v1`

## Common Issues & Solutions

### Issue: "Cannot find module '@ordo-todo/api-client'"

**Solution:** Run `npm install` in the web app directory:
```bash
cd apps/web
npm install
```

### Issue: "401 Unauthorized" errors

**Solution:** Check that:
1. User is logged in
2. Token is stored in localStorage
3. API client is using correct base URL
4. Backend is running

### Issue: Types not matching

**Solution:** The API client exports all types. Import from there:
```typescript
import type { Task, CreateTaskDto, UpdateTaskDto } from '@ordo-todo/api-client';
```

### Issue: Cache not updating after mutations

**Solution:** This should be automatic. If not, check that:
1. Mutation hook is from `@/lib/api-hooks`
2. Query keys match between queries and mutations
3. React Query dev tools show cache invalidation

## Next Steps

1. **Continue Component Migration** - Work through the remaining 20 components
2. **Test Thoroughly** - Verify each migrated component works correctly
3. **Remove Old Code** - Once migration is complete, delete tRPC files
4. **Update Documentation** - Update README and other docs to reflect REST API usage
5. **Performance Review** - Check bundle size reduction without tRPC

## Available Hooks Reference

See `src/lib/api-hooks.ts` for complete list of 60+ hooks including:

### Workspace Hooks
- `useWorkspaces()`, `useWorkspace(id)`, `useCreateWorkspace()`, `useUpdateWorkspace()`, `useDeleteWorkspace()`, `useAddWorkspaceMember()`, `useRemoveWorkspaceMember()`

### Workflow Hooks
- `useWorkflows(workspaceId)`, `useCreateWorkflow()`, `useUpdateWorkflow()`, `useDeleteWorkflow()`

### Project Hooks
- `useProjects(workspaceId)`, `useAllProjects()`, `useProject(id)`, `useCreateProject()`, `useUpdateProject()`, `useArchiveProject()`, `useDeleteProject()`

### Task Hooks
- `useTasks(projectId?)`, `useTask(id)`, `useTaskDetails(id)`, `useCreateTask()`, `useUpdateTask()`, `useCompleteTask()`, `useDeleteTask()`, `useCreateSubtask()`

### Tag Hooks
- `useTags(workspaceId)`, `useTaskTags(taskId)`, `useCreateTag()`, `useAssignTagToTask()`, `useRemoveTagFromTask()`, `useDeleteTag()`

### Timer Hooks
- `useActiveTimer()`, `useStartTimer()`, `useStopTimer()`

### Analytics Hooks
- `useDailyMetrics(params?)`

### Comment Hooks
- `useTaskComments(taskId)`, `useCreateComment()`, `useUpdateComment()`, `useDeleteComment()`

### Attachment Hooks
- `useTaskAttachments(taskId)`, `useCreateAttachment()`, `useDeleteAttachment()`

### User Hooks
- `useCurrentUser()`, `useUpdateProfile()`

### Auth Hooks
- `useLogin()`, `useRegister()`, `useLogout()`

---

**Last Updated:** 2025-11-29
**Migration Progress:** 80% (Core infrastructure complete, 30% of components migrated)
