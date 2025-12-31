# @ordo-todo/hooks

Shared React Query hooks for Ordo-Todo applications (Web, Mobile, Desktop).

Provides type-safe data fetching and mutations for all 49 REST API endpoints using TanStack Query (React Query).

## Features

- Factory pattern for platform-specific API client binding
- Automatic cache invalidation and refetching
- Optimistic updates where applicable
- Type-safe requests and responses
- 90+ hooks across all domains
- Automatic query key management

## Installation

```bash
npm install @ordo-todo/hooks
```

## Quick Start

### Setup in Your App

The hooks package uses a factory pattern to bind to your specific API client instance:

```typescript
// apps/web/src/lib/shared-hooks.ts
import { createHooks } from "@ordo-todo/hooks";
import { apiClient } from "./api-client";

export const hooks = createHooks({ apiClient });
```

### Use Hooks in Components

```typescript
// apps/web/src/app/tasks/page.tsx
'use client';

import { hooks } from '@/lib/shared-hooks';

export default function TasksPage() {
  // Query hook
  const { data: tasks, isLoading, error } = hooks.useTasks();

  // Mutation hook
  const createTask = hooks.useCreateTask();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}

      <button onClick={() => createTask.mutate({ title: 'New Task', projectId: '...' })}>
        Create Task
      </button>
    </div>
  );
}
```

### Mobile Integration

```typescript
// apps/mobile/app/lib/shared-hooks.ts
import { createHooks } from "@ordo-todo/hooks";
import apiClient from "./api-client";

export const hooks = createHooks({ apiClient });
```

## Available Hooks

### Authentication (3 hooks)

```typescript
// Register new user
const register = hooks.useRegister();

// Login
const login = hooks.useLogin();

// Logout (clears query cache)
const logout = hooks.useLogout();
```

### Users (10 hooks)

```typescript
// Get current user
const { data: user } = hooks.useCurrentUser();

// Get full profile with workspaces
const { data: profile } = hooks.useFullProfile();

// Get user preferences
const { data: preferences } = hooks.useUserPreferences();

// Update user profile
const updateProfile = hooks.useUpdateProfile();

// Update preferences
const updatePreferences = hooks.useUpdatePreferences();

// Get user integrations
const { data: integrations } = hooks.useUserIntegrations();

// Export user data
const exportData = hooks.useExportData();

// Delete account
const deleteAccount = hooks.useDeleteAccount();
```

### Workspaces (17 hooks)

```typescript
// Get all workspaces
const { data: workspaces } = hooks.useWorkspaces();

// Get specific workspace
const { data: workspace } = hooks.useWorkspace("workspace-id");

// Get workspace by slug
const { data: workspace } = hooks.useWorkspaceBySlug(
  "username",
  "workspace-slug",
);

// Create workspace
const createWorkspace = hooks.useCreateWorkspace();

// Update workspace
const updateWorkspace = hooks.useUpdateWorkspace();

// Delete workspace
const deleteWorkspace = hooks.useDeleteWorkspace();

// Get deleted workspaces
const { data: deleted } = hooks.useDeletedWorkspaces();

// Restore workspace
const restoreWorkspace = hooks.useRestoreWorkspace();

// Permanent delete
const permanentDelete = hooks.usePermanentDeleteWorkspace();

// Get workspace members
const { data: members } = hooks.useWorkspaceMembers("workspace-id");

// Add member
const addMember = hooks.useAddWorkspaceMember();

// Remove member
const removeMember = hooks.useRemoveWorkspaceMember();

// Get invitations
const { data: invitations } = hooks.useWorkspaceInvitations("workspace-id");

// Invite member
const inviteMember = hooks.useInviteMember();

// Accept invitation
const acceptInvitation = hooks.useAcceptInvitation();

// Get settings
const { data: settings } = hooks.useWorkspaceSettings("workspace-id");

// Update settings
const updateSettings = hooks.useUpdateWorkspaceSettings();

// Get audit logs
const { data: logs } = hooks.useWorkspaceAuditLogs("workspace-id", {
  limit: 20,
});

// Archive workspace
const archiveWorkspace = hooks.useArchiveWorkspace();
```

### Workflows (4 hooks)

```typescript
// Get workflows for workspace
const { data: workflows } = hooks.useWorkflows("workspace-id");

// Create workflow
const createWorkflow = hooks.useCreateWorkflow();

// Update workflow
const updateWorkflow = hooks.useUpdateWorkflow();

// Delete workflow
const deleteWorkflow = hooks.useDeleteWorkflow();
```

### Projects (10 hooks)

```typescript
// Get projects for workspace
const { data: projects } = hooks.useProjects("workspace-id");

// Get all projects across workspaces
const { data: allProjects } = hooks.useAllProjects();

// Get specific project
const { data: project } = hooks.useProject("project-id");

// Get project by slugs
const { data: project } = hooks.useProjectBySlugs(
  "workspace-slug",
  "project-slug",
);

// Create project
const createProject = hooks.useCreateProject();

// Update project
const updateProject = hooks.useUpdateProject();

// Archive project
const archiveProject = hooks.useArchiveProject();

// Complete project
const completeProject = hooks.useCompleteProject();

// Delete project
const deleteProject = hooks.useDeleteProject();

// Update project status
const updateStatus = hooks.useUpdateProjectStatus();
```

### Tasks (15 hooks)

```typescript
// Get tasks (optionally filtered by project, tags, assignedToMe)
const { data: tasks } = hooks.useTasks("project-id", ["tag-1", "tag-2"], {
  assignedToMe: true,
});

// Get specific task
const { data: task } = hooks.useTask("task-id");

// Get task with all relations
const { data: taskDetails } = hooks.useTaskDetails("task-id");

// Create task
const createTask = hooks.useCreateTask();

// Update task
const updateTask = hooks.useUpdateTask();

// Complete task
const completeTask = hooks.useCompleteTask();

// Delete task
const deleteTask = hooks.useDeleteTask();

// Get subtasks
const { data: subtasks } = hooks.useSubtasks("task-id");

// Create subtask
const createSubtask = hooks.useCreateSubtask();

// Update subtask
const updateSubtask = hooks.useUpdateSubtask();

// Delete subtask
const deleteSubtask = hooks.useDeleteSubtask();

// Assign task to user
const assignTask = hooks.useAssignTask();

// Batch update tasks
const batchUpdate = hooks.useBatchUpdateTasks();

// Delete multiple tasks
const batchDelete = hooks.useBatchDeleteTasks();
```

### Tags (7 hooks)

```typescript
// Get tags for workspace
const { data: tags } = hooks.useTags("workspace-id");

// Create tag
const createTag = hooks.useCreateTag();

// Update tag
const updateTag = hooks.useUpdateTag();

// Delete tag
const deleteTag = hooks.useDeleteTag();

// Assign tag to task
const assignTag = hooks.useAssignTagToTask();

// Remove tag from task
const removeTag = hooks.useRemoveTagFromTask();

// Get tags for task
const { data: taskTags } = hooks.useTaskTags("task-id");
```

### Timers (6 hooks)

```typescript
// Get active timer
const { data: activeTimer } = hooks.useActiveTimer();

// Start timer
const startTimer = hooks.useStartTimer();

// Stop timer
const stopTimer = hooks.useStopTimer();

// Get session history
const { data: sessions } = hooks.useSessions({ startDate, endDate });

// Get today's sessions
const { data: todaySessions } = hooks.useTodaySessions();

// Update session
const updateSession = hooks.useUpdateSession();
```

### Analytics (3 hooks)

```typescript
// Get daily metrics
const { data: metrics } = hooks.useDailyMetrics({ startDate, endDate });

// Get weekly metrics
const { data: weeklyMetrics } = hooks.useWeeklyMetrics({ startDate, endDate });

// Get dashboard stats
const { data: stats } = hooks.useDashboardStats();
```

### Comments (4 hooks)

```typescript
// Get comments for task
const { data: comments } = hooks.useTaskComments("task-id");

// Create comment
const createComment = hooks.useCreateComment();

// Update comment
const updateComment = hooks.useUpdateComment();

// Delete comment
const deleteComment = hooks.useDeleteComment();
```

### Attachments (4 hooks)

```typescript
// Get attachments for task
const { data: attachments } = hooks.useTaskAttachments("task-id");

// Create attachment
const createAttachment = hooks.useCreateAttachment();

// Delete attachment
const deleteAttachment = hooks.useDeleteAttachment();

// Download attachment
const downloadAttachment = hooks.useDownloadAttachment();
```

### Habits (7 hooks)

```typescript
// Get habits for workspace
const { data: habits } = hooks.useHabits("workspace-id");

// Get specific habit
const { data: habit } = hooks.useHabit("habit-id");

// Create habit
const createHabit = hooks.useCreateHabit();

// Update habit
const updateHabit = hooks.useUpdateHabit();

// Delete habit
const deleteHabit = hooks.useDeleteHabit();

// Complete habit
const completeHabit = hooks.useCompleteHabit();

// Get habit completions
const { data: completions } = hooks.useHabitCompletions("habit-id", {
  startDate,
  endDate,
});
```

### Objectives/OKRs (8 hooks)

```typescript
// Get objectives for workspace
const { data: objectives } = hooks.useObjectives("workspace-id");

// Get specific objective
const { data: objective } = hooks.useObjective("objective-id");

// Create objective
const createObjective = hooks.useCreateObjective();

// Update objective
const updateObjective = hooks.useUpdateObjective();

// Delete objective
const deleteObjective = hooks.useDeleteObjective();

// Get key results for objective
const { data: keyResults } = hooks.useKeyResults("objective-id");

// Create key result
const createKeyResult = hooks.useCreateKeyResult();

// Update key result
const updateKeyResult = hooks.useUpdateKeyResult();
```

### Custom Fields (4 hooks)

```typescript
// Get custom fields for workspace
const { data: customFields } = hooks.useCustomFields("workspace-id");

// Create custom field
const createCustomField = hooks.useCreateCustomField();

// Update custom field
const updateCustomField = hooks.useUpdateCustomField();

// Delete custom field
const deleteCustomField = hooks.useDeleteCustomField();
```

## Query Keys

The package exports `queryKeys` for manual cache management:

```typescript
import { queryKeys } from "@ordo-todo/hooks";

// Invalidate all tasks
queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });

// Invalidate specific project
queryClient.invalidateQueries({
  queryKey: queryKeys.projects.byId("project-id"),
});

// Invalidate workspace members
queryClient.invalidateQueries({
  queryKey: queryKeys.workspaces.members("workspace-id"),
});
```

## Advanced Usage

### Optimistic Updates

```typescript
const updateTask = hooks.useUpdateTask({
  onMutate: async (variables) => {
    await queryClient.cancelQueries({
      queryKey: queryKeys.tasks.byId(variables.taskId),
    });

    const previousTask = queryClient.getQueryData(
      queryKeys.tasks.byId(variables.taskId),
    );

    queryClient.setQueryData(
      queryKeys.tasks.byId(variables.taskId),
      (old: Task) => ({
        ...old,
        ...variables,
      }),
    );

    return { previousTask };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(
      queryKeys.tasks.byId(variables.taskId),
      context?.previousTask,
    );
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.byId(variables.taskId),
    });
  },
});
```

### Pagination

```typescript
function useInfiniteTasks() {
  return useInfiniteQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: ({ pageParam = 0 }) =>
      hooks.useTasks(undefined, undefined, {
        page: pageParam,
        limit: 20,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length;
    },
  });
}
```

### Prefetching Data

```typescript
import { useEffect } from 'react';
import { hooks } from '@/lib/shared-hooks';

function ProjectList() {
  const { data: projects } = hooks.useProjects('workspace-id');
  const queryClient = useQueryClient();

  useEffect(() => {
    projects?.forEach(project => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.byId(project.id),
        queryFn: () => hooks.useProject(project.id).fetchQueryFn(),
      });
    });
  }, [projects]);

  return <div>{/* ... */}</div>;
}
```

## Development

```bash
# Build the package
npm run build --filter=@ordo-todo/hooks

# Watch mode
cd packages/hooks && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/hooks
```

## Dependencies

- `@tanstack/react-query` - React Query for data fetching
- `@ordo-todo/api-client` - Type-safe API client
- React 19+

## Related Documentation

- [API Client Package](/packages/api-client/README.md) - REST client
- [Core Package](/packages/core/README.md) - Business logic
- [UI Package](/packages/ui/README.md) - UI components
- [SHARED-CODE-ARCHITECTURE.md](/docs/SHARED-CODE-ARCHITECTURE.md) - Architecture overview

## License

Part of the Ordo-Todo monorepo.
