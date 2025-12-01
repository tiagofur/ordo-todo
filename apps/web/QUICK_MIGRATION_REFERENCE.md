# Quick Migration Reference

## 🚀 Fast Copy-Paste Patterns

### Import Statement
```typescript
// OLD
import { api } from "@/utils/api";

// NEW
import {
  useTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useProjects, useCreateProject,
  useWorkspaces, useCreateWorkspace,
  // ... add whatever you need
} from "@/lib/api-hooks";
```

---

## 📖 Query Patterns

### Simple Query
```typescript
// OLD
const { data, isLoading, error } = api.task.list.useQuery({ projectId });

// NEW
const { data, isLoading, error } = useTasks(projectId);
```

### Conditional Query
```typescript
// OLD
const { data } = api.project.get.useQuery(
  { id: projectId },
  { enabled: !!projectId }
);

// NEW (enabled check is built-in for ID-based queries)
const { data } = useProject(projectId);  // Won't fetch if projectId is falsy
```

### Query with Options
```typescript
// OLD
const { data } = api.task.list.useQuery(undefined, {
  refetchInterval: 1000,
});

// NEW
const { data } = useTasks();  // Uses default config
// For custom config, wrap in useQuery:
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api-hooks';
import { apiClient } from '@/lib/api-client';

const { data } = useQuery({
  queryKey: queryKeys.tasks(),
  queryFn: () => apiClient.getTasks(),
  refetchInterval: 1000,
});
```

---

## ✏️ Mutation Patterns

### Basic Mutation with Success/Error
```typescript
// OLD
const utils = api.useUtils();
const createTask = api.task.create.useMutation({
  onSuccess: () => {
    utils.task.list.invalidate();
    toast.success("Created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
createTask.mutate({ title: "New Task", projectId });

// NEW (Option 1: Async/await with try-catch)
const createTask = useCreateTask();

const handleCreate = async (data) => {
  try {
    await createTask.mutateAsync(data);
    toast.success("Created!");
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed");
  }
};

// Usage
await handleCreate({ title: "New Task", projectId });

// NEW (Option 2: With callbacks)
const createTask = useCreateTask();

createTask.mutate(
  { title: "New Task", projectId },
  {
    onSuccess: () => toast.success("Created!"),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed")
  }
);
```

### Mutation with Parameters
```typescript
// OLD
const deleteTask = api.task.delete.useMutation();
deleteTask.mutate({ id: taskId });

// NEW
const deleteTask = useDeleteTask();
await deleteTask.mutateAsync(taskId);  // Just pass the ID directly
```

### Mutation with Complex Parameters
```typescript
// OLD
const updateProject = api.project.update.useMutation();
updateProject.mutate({ id: projectId, data: { name: "New Name" } });

// NEW (some hooks expect an object with named parameters)
const updateProject = useUpdateProject();
await updateProject.mutateAsync({
  projectId: projectId,
  data: { name: "New Name" }
});
```

---

## 🔑 Common Hook Replacements

### Workspace
```typescript
// Queries
api.workspace.list.useQuery()                    → useWorkspaces()
api.workspace.get.useQuery({ id })               → useWorkspace(id)

// Mutations
api.workspace.create.useMutation()               → useCreateWorkspace()
api.workspace.update.useMutation()               → useUpdateWorkspace()
api.workspace.delete.useMutation()               → useDeleteWorkspace()
api.workspace.addMember.useMutation()            → useAddWorkspaceMember()
api.workspace.removeMember.useMutation()         → useRemoveWorkspaceMember()
```

### Workflow
```typescript
// Queries
api.workflow.list.useQuery({ workspaceId })      → useWorkflows(workspaceId)

// Mutations
api.workflow.create.useMutation()                → useCreateWorkflow()
api.workflow.update.useMutation()                → useUpdateWorkflow()
api.workflow.delete.useMutation()                → useDeleteWorkflow()
```

### Project
```typescript
// Queries
api.project.list.useQuery({ workspaceId })       → useProjects(workspaceId)
api.project.getAll.useQuery()                    → useAllProjects()
api.project.get.useQuery({ id })                 → useProject(id)

// Mutations
api.project.create.useMutation()                 → useCreateProject()
api.project.update.useMutation()                 → useUpdateProject()
api.project.archive.useMutation()                → useArchiveProject()
api.project.delete.useMutation()                 → useDeleteProject()
```

### Task
```typescript
// Queries
api.task.list.useQuery({ projectId })            → useTasks(projectId)
api.task.list.useQuery(undefined)                → useTasks()  // All tasks
api.task.get.useQuery({ id })                    → useTask(id)
api.task.getDetails.useQuery({ id })             → useTaskDetails(id)

// Mutations
api.task.create.useMutation()                    → useCreateTask()
api.task.update.useMutation()                    → useUpdateTask()
api.task.complete.useMutation()                  → useCompleteTask()
api.task.delete.useMutation()                    → useDeleteTask()
api.task.createSubtask.useMutation()             → useCreateSubtask()
```

### Tag
```typescript
// Queries
api.tag.list.useQuery({ workspaceId })           → useTags(workspaceId)
api.tag.getTaskTags.useQuery({ taskId })         → useTaskTags(taskId)

// Mutations
api.tag.create.useMutation()                     → useCreateTag()
api.tag.assignToTask.useMutation()               → useAssignTagToTask()
api.tag.removeFromTask.useMutation()             → useRemoveTagFromTask()
api.tag.delete.useMutation()                     → useDeleteTag()
```

### Timer
```typescript
// Queries
api.timer.getActive.useQuery()                   → useActiveTimer()

// Mutations
api.timer.start.useMutation()                    → useStartTimer()
api.timer.stop.useMutation()                     → useStopTimer()
```

### Comment
```typescript
// Queries
api.comment.getTaskComments.useQuery({ taskId }) → useTaskComments(taskId)

// Mutations
api.comment.create.useMutation()                 → useCreateComment()
api.comment.update.useMutation()                 → useUpdateComment()
api.comment.delete.useMutation()                 → useDeleteComment()
```

### Attachment
```typescript
// Queries
api.attachment.getTaskAttachments.useQuery({ taskId }) → useTaskAttachments(taskId)

// Mutations
api.attachment.create.useMutation()              → useCreateAttachment()
api.attachment.delete.useMutation()              → useDeleteAttachment()
```

### User & Auth
```typescript
// Queries
api.user.getCurrent.useQuery()                   → useCurrentUser()

// Mutations
api.user.updateProfile.useMutation()             → useUpdateProfile()

// Auth (via useAuth() context instead)
// In components, use:
import { useAuth } from "@/contexts/auth-context";
const { user, login, register, logout, isLoading } = useAuth();
```

---

## 🗑️ Always Remove

```typescript
// DELETE THESE LINES:
const utils = api.useUtils();
utils.{anything}.invalidate();  // Cache invalidation is automatic now
```

---

## ⚠️ Error Handling

```typescript
// OLD
onError: (error) => {
  toast.error(error.message);
}

// NEW
onError: (error: any) => {
  toast.error(error?.response?.data?.message || "Operation failed");
}
// or in try-catch:
catch (error: any) {
  toast.error(error?.response?.data?.message || "Operation failed");
}
```

---

## 🔄 Cache Invalidation (Automatic)

**You don't need to manually invalidate!** All mutation hooks auto-invalidate related queries.

For example, `useCreateTask()` automatically invalidates:
- All task queries for that project
- All task queries globally

If you need manual control:
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api-hooks';

const queryClient = useQueryClient();

// Manual invalidation (rarely needed)
queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) });
```

---

## 📝 Full Example: Before & After

### Before (tRPC)
```typescript
import { api } from "@/utils/api";
import { toast } from "sonner";

export function TaskList({ projectId }: Props) {
  const utils = api.useUtils();

  const { data: tasks, isLoading } = api.task.list.useQuery({ projectId });

  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate({ projectId });
      toast.success("Task created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate({ projectId });
      toast.success("Task deleted");
    },
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {tasks?.map(task => (
        <div key={task.id}>
          {task.title}
          <button onClick={() => deleteTask.mutate({ id: task.id })}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => createTask.mutate({
        title: "New Task",
        projectId
      })}>
        Add Task
      </button>
    </div>
  );
}
```

### After (REST API)
```typescript
import { useTasks, useCreateTask, useDeleteTask } from "@/lib/api-hooks";
import { toast } from "sonner";

export function TaskList({ projectId }: Props) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  const handleCreate = async () => {
    try {
      await createTask.mutateAsync({
        title: "New Task",
        projectId
      });
      toast.success("Task created");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {tasks?.map(task => (
        <div key={task.id}>
          {task.title}
          <button onClick={() => handleDelete(task.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={handleCreate}>
        Add Task
      </button>
    </div>
  );
}
```

---

## ✅ Checklist Per Component

- [ ] Replace `import { api } from "@/utils/api"` with hook imports
- [ ] Replace all `api.*.*.useQuery()` with corresponding hooks
- [ ] Replace all `api.*.*.useMutation()` with corresponding hooks
- [ ] Remove `const utils = api.useUtils()`
- [ ] Remove all `utils.*.invalidate()` calls
- [ ] Update error handling to use `error?.response?.data?.message`
- [ ] Test the component
- [ ] Check browser console for errors
- [ ] Verify functionality works

---

**Pro Tip:** Keep this file open while migrating. Copy-paste patterns as needed!
