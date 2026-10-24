# Mobile App API Migration Guide

## Overview

The Ordo-Todo mobile app has been migrated from tRPC to the NestJS REST API using the `@ordo-todo/api-client` package.

## What Changed

### Dependencies

**Added:**
- `@ordo-todo/api-client` - Shared API client with type-safe REST endpoints

**Removed:**
- `@trpc/client` - No longer using tRPC
- `@trpc/react-query` - Replaced with direct React Query hooks
- `superjson` - No longer needed (REST API uses standard JSON)

### File Structure

**New Files:**
```
apps/mobile/
├── app/
│   ├── lib/
│   │   ├── storage.ts              # AsyncStorage token storage
│   │   └── api-client.ts           # Configured API client instance
│   ├── providers/
│   │   └── query-provider.tsx      # React Query configuration
│   ├── contexts/
│   │   └── auth.context.tsx        # New auth context
│   └── hooks/
│       └── api/
│           ├── use-auth.ts         # Auth hooks
│           ├── use-tasks.ts        # Task hooks
│           ├── use-workspaces.ts   # Workspace hooks
│           ├── use-workflows.ts    # Workflow hooks
│           ├── use-projects.ts     # Project hooks
│           ├── use-tags.ts         # Tag hooks
│           ├── use-timers.ts       # Timer hooks
│           ├── use-analytics.ts    # Analytics hooks
│           ├── use-comments.ts     # Comment hooks
│           ├── use-attachments.ts  # Attachment hooks
│           └── index.ts            # Centralized exports
```

**Removed Files:**
- `components/providers/trpc-provider.tsx`
- `utils/api.ts`
- `app/data/contexts/session.context.tsx`
- `app/data/hooks/use-api.hook.ts`

**Updated Files:**
- `app/_layout.tsx` - Now uses QueryProvider and AuthProvider
- `app/data/hooks/use-session.hook.ts` - Backwards compatibility wrapper
- `app/data/hooks/use-profile.hook.ts` - Uses new API hooks
- `app/data/hooks/use-auth-form.hook.ts` - Uses new auth context

### API Client Configuration

The API client automatically handles:
- Token storage in AsyncStorage
- Token refresh on expiration
- Platform-specific URL configuration
- Request/response interceptors
- Error handling

### Environment Configuration

**File: `.env`**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Platform-specific URLs:**
- iOS Simulator: `http://localhost:3001/api/v1`
- Android Emulator: `http://10.0.2.2:3001/api/v1`
- Physical Device: `http://YOUR_MACHINE_IP:3001/api/v1`

The API client (`app/lib/api-client.ts`) automatically selects the correct URL based on the platform.

## Migration Examples

### Authentication

**Old (tRPC + custom API):**
```typescript
const { httpPost } = useAPI();
const { startSession } = useSession();

const token = await httpPost("auth/login", { email, password });
startSession(token);
```

**New (API Client):**
```typescript
import { useAuth } from '../../contexts/auth.context';

const { login } = useAuth();
await login({ email, password });
```

### Fetching Data

**Old (tRPC):**
```typescript
import { trpc } from '../../utils/api';

const { data: tasks } = trpc.task.list.useQuery({ projectId });
```

**New (API Hooks):**
```typescript
import { useTasks } from '../../hooks/api';

const { data: tasks } = useTasks(projectId);
```

### Mutations

**Old (tRPC):**
```typescript
const createTask = trpc.task.create.useMutation();
await createTask.mutateAsync({ title: "New task", projectId });
```

**New (API Hooks):**
```typescript
import { useCreateTask } from '../../hooks/api';

const createTask = useCreateTask();
await createTask.mutateAsync({ title: "New task", projectId });
```

## Available Hooks

All hooks are exported from `app/hooks/api/index.ts`:

### Authentication
- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useLogout()` - Logout user
- `useCurrentUser()` - Get current user
- `useUpdateProfile()` - Update user profile

### Tasks
- `useTasks(projectId?)` - Get tasks
- `useTask(taskId)` - Get single task
- `useCreateTask()` - Create task
- `useUpdateTask()` - Update task
- `useCompleteTask()` - Mark task as complete
- `useDeleteTask()` - Delete task
- `useAssignTask()` - Assign task to user
- `useUnassignTask()` - Unassign task from user

### Workspaces
- `useWorkspaces()` - Get all workspaces
- `useWorkspace(id)` - Get single workspace
- `useCreateWorkspace()` - Create workspace
- `useUpdateWorkspace()` - Update workspace
- `useDeleteWorkspace()` - Delete workspace
- `useWorkspaceMembers(id)` - Get workspace members
- `useAddWorkspaceMember()` - Add member to workspace
- `useRemoveWorkspaceMember()` - Remove member from workspace

### Workflows
- `useWorkflows(workspaceId)` - Get workflows
- `useWorkflow(id)` - Get single workflow
- `useCreateWorkflow()` - Create workflow
- `useUpdateWorkflow()` - Update workflow
- `useDeleteWorkflow()` - Delete workflow

### Projects
- `useProjects(workflowId?)` - Get projects
- `useProject(id)` - Get single project
- `useCreateProject()` - Create project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project

### Tags
- `useTags(workspaceId)` - Get tags
- `useTag(id)` - Get single tag
- `useCreateTag()` - Create tag
- `useUpdateTag()` - Update tag
- `useDeleteTag()` - Delete tag
- `useAddTaskTag()` - Add tag to task
- `useRemoveTaskTag()` - Remove tag from task

### Timers
- `useTimerSessions(taskId)` - Get timer sessions
- `useTimerSession(id)` - Get single session
- `useCreateTimerSession()` - Create session
- `useUpdateTimerSession()` - Update session
- `useStartTimer()` - Start timer
- `usePauseTimer()` - Pause timer
- `useStopTimer()` - Stop timer
- `useDeleteTimerSession()` - Delete session

### Analytics
- `useDailyMetrics(userId, startDate?, endDate?)` - Get daily metrics
- `useProductivitySummary(userId, period?)` - Get productivity summary
- `useTaskCompletionStats(userId, workspaceId?)` - Get completion stats
- `useTimeTrackingSummary(userId, startDate?, endDate?)` - Get time tracking summary

### Comments
- `useComments(taskId)` - Get comments
- `useComment(id)` - Get single comment
- `useCreateComment()` - Create comment
- `useUpdateComment()` - Update comment
- `useDeleteComment()` - Delete comment

### Attachments
- `useAttachments(taskId)` - Get attachments
- `useAttachment(id)` - Get single attachment
- `useUploadAttachment()` - Upload attachment
- `useDeleteAttachment()` - Delete attachment

## Usage Example

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTasks, useCreateTask, useCompleteTask } from '../hooks/api';

function TaskList({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask();
  const completeTask = useCompleteTask();

  const handleCreateTask = async () => {
    await createTask.mutateAsync({
      title: 'New Task',
      projectId,
      status: 'TODO',
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
  };

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      {tasks?.map(task => (
        <View key={task.id}>
          <Text>{task.title}</Text>
          <Button
            title="Complete"
            onPress={() => handleCompleteTask(task.id)}
          />
        </View>
      ))}
      <Button title="Add Task" onPress={handleCreateTask} />
    </View>
  );
}
```

## Next Steps

1. **Install dependencies:**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Build the API client:**
   ```bash
   cd ../../packages/api-client
   npm run build
   ```

4. **Start the mobile app:**
   ```bash
   cd ../../apps/mobile
   npm start
   ```

## Troubleshooting

### Connection Issues

**iOS Simulator:**
- Use `http://localhost:3001/api/v1`
- Ensure backend is running on port 3001

**Android Emulator:**
- Use `http://10.0.2.2:3001/api/v1`
- `10.0.2.2` is Android's alias for host machine's `localhost`

**Physical Device:**
- Use your machine's IP address: `http://192.168.1.X:3001/api/v1`
- Ensure device is on the same WiFi network
- Check firewall settings

### Token Storage Issues

If you encounter authentication issues:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear stored tokens
await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
```

### API Client Debugging

Enable debug logging:
```typescript
// In app/lib/api-client.ts
if (__DEV__) {
  console.log('[API Client] Request:', method, url, data);
  console.log('[API Client] Response:', response);
}
```

## Additional Resources

- [API Client Documentation](../../packages/api-client/README.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Expo Documentation](https://docs.expo.dev/)
