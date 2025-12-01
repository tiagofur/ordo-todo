# @ordo-todo/api-client

Shared TypeScript API client for Ordo-Todo applications (Web, Mobile, Desktop).

Provides type-safe access to all 49 REST API endpoints of the NestJS backend with automatic JWT token management and refresh logic.

## Features

- Type-safe API calls with full TypeScript support
- Automatic JWT token attachment and refresh
- Platform-agnostic token storage interface
- Built-in token storage implementations (Memory, LocalStorage)
- Request/Response interceptors for error handling
- Comprehensive DTOs matching backend validation
- Support for all 49 endpoints across 11 domains

## Installation

```bash
npm install @ordo-todo/api-client
```

## Quick Start

### Web Application (Next.js)

```typescript
import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';

// Create client instance
const apiClient = new OrdoApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  tokenStorage: new LocalStorageTokenStorage(),
  timeout: 30000, // optional, default 30s
  onAuthError: () => {
    // Redirect to login page
    window.location.href = '/login';
  },
});

// Use in your app
async function login(email: string, password: string) {
  const authResponse = await apiClient.login({ email, password });
  // Tokens are automatically stored
  return authResponse.user;
}

async function loadWorkspaces() {
  const workspaces = await apiClient.getWorkspaces();
  return workspaces;
}
```

### Mobile Application (React Native + Expo)

```typescript
import { OrdoApiClient, TokenStorage } from '@ordo-todo/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create custom storage for React Native
class AsyncStorageTokenStorage implements TokenStorage {
  async getToken() {
    return await AsyncStorage.getItem('ordo_access_token');
  }

  async setToken(token: string) {
    await AsyncStorage.setItem('ordo_access_token', token);
  }

  async removeToken() {
    await AsyncStorage.removeItem('ordo_access_token');
  }

  async getRefreshToken() {
    return await AsyncStorage.getItem('ordo_refresh_token');
  }

  async setRefreshToken(token: string) {
    await AsyncStorage.setItem('ordo_refresh_token', token);
  }

  async removeRefreshToken() {
    await AsyncStorage.removeItem('ordo_refresh_token');
  }
}

// Create client
const apiClient = new OrdoApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  tokenStorage: new AsyncStorageTokenStorage(),
});

export default apiClient;
```

### Desktop Application (Electron)

```typescript
import { OrdoApiClient, TokenStorage } from '@ordo-todo/api-client';
import Store from 'electron-store';

// Create custom storage for Electron
class ElectronStoreTokenStorage implements TokenStorage {
  private store = new Store();

  getToken(): string | null {
    return this.store.get('ordo_access_token') as string | null;
  }

  setToken(token: string): void {
    this.store.set('ordo_access_token', token);
  }

  removeToken(): void {
    this.store.delete('ordo_access_token');
  }

  getRefreshToken(): string | null {
    return this.store.get('ordo_refresh_token') as string | null;
  }

  setRefreshToken(token: string): void {
    this.store.set('ordo_refresh_token', token);
  }

  removeRefreshToken(): void {
    this.store.delete('ordo_refresh_token');
  }
}

// Create client
const apiClient = new OrdoApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  tokenStorage: new ElectronStoreTokenStorage(),
});

export default apiClient;
```

## API Reference

### Authentication (3 endpoints)

```typescript
// Register new user
const authResponse = await apiClient.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe', // optional
});

// Login
const authResponse = await apiClient.login({
  email: 'user@example.com',
  password: 'password123',
});

// Logout (clears tokens)
await apiClient.logout();

// Manual token refresh (handled automatically on 401)
const newTokens = await apiClient.refreshToken({
  refreshToken: 'your-refresh-token',
});
```

### Users (2 endpoints)

```typescript
// Get current user
const user = await apiClient.getCurrentUser();

// Update profile
await apiClient.updateProfile({
  name: 'New Name',
  image: 'https://example.com/avatar.jpg',
});
```

### Workspaces (7 endpoints)

```typescript
// Create workspace
const workspace = await apiClient.createWorkspace({
  name: 'My Workspace',
  type: 'PERSONAL', // 'PERSONAL' | 'WORK' | 'TEAM'
  description: 'Optional description',
  color: '#2563EB',
  icon: 'briefcase',
});

// Get all workspaces
const workspaces = await apiClient.getWorkspaces();

// Get specific workspace with members
const workspace = await apiClient.getWorkspace('workspace-id');

// Update workspace
const updated = await apiClient.updateWorkspace('workspace-id', {
  name: 'Updated Name',
  color: '#DC2626',
});

// Delete workspace
await apiClient.deleteWorkspace('workspace-id');

// Add member
await apiClient.addWorkspaceMember('workspace-id', {
  userId: 'user-id',
  role: 'MEMBER', // 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
});

// Remove member
await apiClient.removeWorkspaceMember('workspace-id', 'user-id');
```

### Workflows (4 endpoints)

```typescript
// Create workflow
const workflow = await apiClient.createWorkflow({
  name: 'Development',
  workspaceId: 'workspace-id',
  description: 'Development workflow',
  color: '#10B981',
});

// Get workflows for workspace
const workflows = await apiClient.getWorkflows('workspace-id');

// Update workflow
const updated = await apiClient.updateWorkflow('workflow-id', {
  name: 'Updated Name',
  position: 1,
});

// Delete workflow
await apiClient.deleteWorkflow('workflow-id');
```

### Projects (7 endpoints)

```typescript
// Create project
const project = await apiClient.createProject({
  name: 'Website Redesign',
  workspaceId: 'workspace-id',
  workflowId: 'workflow-id',
  description: 'Redesign company website',
  color: '#8B5CF6',
});

// Get projects for workspace
const projects = await apiClient.getProjects('workspace-id');

// Get all projects (across all workspaces)
const allProjects = await apiClient.getAllProjects();

// Get specific project
const project = await apiClient.getProject('project-id');

// Update project
const updated = await apiClient.updateProject('project-id', {
  name: 'Updated Name',
  workflowId: 'new-workflow-id',
});

// Archive project
const archived = await apiClient.archiveProject('project-id');

// Delete project
await apiClient.deleteProject('project-id');
```

### Tasks (8 endpoints)

```typescript
// Create task
const task = await apiClient.createTask({
  title: 'Implement login page',
  projectId: 'project-id',
  description: 'Create responsive login page',
  priority: 'HIGH', // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: new Date('2025-12-31'),
  estimatedTime: 120, // minutes
});

// Mark task as complete
const completed = await apiClient.completeTask('task-id');

// Get all tasks (optionally filtered by project)
const allTasks = await apiClient.getTasks();
const projectTasks = await apiClient.getTasks('project-id');

// Get specific task
const task = await apiClient.getTask('task-id');

// Get task with all relations (subtasks, comments, attachments)
const taskDetails = await apiClient.getTaskDetails('task-id');

// Update task
const updated = await apiClient.updateTask('task-id', {
  title: 'Updated Title',
  status: 'IN_PROGRESS', // 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'URGENT',
  estimatedTime: 180,
});

// Delete task
await apiClient.deleteTask('task-id');

// Create subtask
const subtask = await apiClient.createSubtask('parent-task-id', {
  title: 'Subtask title',
  description: 'Subtask description',
  priority: 'MEDIUM',
});
```

### Tags (6 endpoints)

```typescript
// Create tag
const tag = await apiClient.createTag({
  name: 'frontend',
  color: '#3B82F6',
  workspaceId: 'workspace-id',
});

// Get tags for workspace
const tags = await apiClient.getTags('workspace-id');

// Assign tag to task
await apiClient.assignTagToTask('tag-id', 'task-id');

// Remove tag from task
await apiClient.removeTagFromTask('tag-id', 'task-id');

// Get all tags for a task
const taskTags = await apiClient.getTaskTags('task-id');

// Delete tag
await apiClient.deleteTag('tag-id');
```

### Timers (3 endpoints)

```typescript
// Start timer
const session = await apiClient.startTimer({
  taskId: 'task-id',
  timerMode: 'POMODORO', // 'POMODORO' | 'CONTINUOUS' | 'HYBRID'
  sessionType: 'FOCUS', // 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
});

// Stop timer
const stoppedSession = await apiClient.stopTimer({
  sessionId: 'session-id',
});

// Get active timer
const activeTimer = await apiClient.getActiveTimer();
// Returns: { session: TimeSession | null, elapsedSeconds: number }
```

### Analytics (1 endpoint)

```typescript
// Get daily metrics
const metrics = await apiClient.getDailyMetrics({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
});

// Metrics include: tasksCompleted, focusTime, pomodorosCompleted, etc.
```

### Comments (4 endpoints)

```typescript
// Create comment
const comment = await apiClient.createComment({
  content: 'This is a comment',
  taskId: 'task-id',
});

// Update comment
const updated = await apiClient.updateComment('comment-id', {
  content: 'Updated comment text',
});

// Delete comment
await apiClient.deleteComment('comment-id');

// Get all comments for a task
const comments = await apiClient.getTaskComments('task-id');
```

### Attachments (3 endpoints)

```typescript
// Create attachment
const attachment = await apiClient.createAttachment({
  filename: 'screenshot.png',
  url: 'https://cdn.example.com/files/screenshot.png',
  mimeType: 'image/png',
  size: 1024000, // bytes
  taskId: 'task-id',
});

// Delete attachment
await apiClient.deleteAttachment('attachment-id');

// Get all attachments for a task
const attachments = await apiClient.getTaskAttachments('task-id');
```

## Error Handling

The client automatically handles common errors:

```typescript
import { AxiosError } from 'axios';

try {
  const task = await apiClient.createTask({
    title: 'New Task',
    projectId: 'invalid-id',
  });
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data);
    } else if (error.response?.status === 401) {
      console.error('Authentication error');
      // Client will automatically try to refresh token
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    }
  }
}
```

## Token Refresh

The client automatically handles token refresh on 401 errors:

1. When a request receives a 401 Unauthorized response
2. The client attempts to refresh the token using the stored refresh token
3. If successful, the original request is retried with the new token
4. If refresh fails, the `onAuthError` callback is called

You can provide callbacks for token lifecycle events:

```typescript
const apiClient = new OrdoApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  tokenStorage: new LocalStorageTokenStorage(),
  onTokenRefresh: async (tokens) => {
    console.log('Tokens refreshed successfully');
    // Update your app state if needed
  },
  onAuthError: async () => {
    console.log('Authentication failed, redirecting to login');
    // Redirect to login page
    window.location.href = '/login';
  },
});
```

## Custom Token Storage

Implement the `TokenStorage` interface for your platform:

```typescript
import { TokenStorage } from '@ordo-todo/api-client';

class CustomTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null> {
    // Your implementation
  }

  async setToken(token: string): Promise<void> {
    // Your implementation
  }

  async removeToken(): Promise<void> {
    // Your implementation
  }

  async getRefreshToken(): Promise<string | null> {
    // Your implementation
  }

  async setRefreshToken(token: string): Promise<void> {
    // Your implementation
  }

  async removeRefreshToken(): Promise<void> {
    // Your implementation
  }
}
```

## TypeScript Support

All DTOs and responses are fully typed:

```typescript
import type {
  Task,
  CreateTaskDto,
  Workspace,
  Project,
  TaskStatus,
  TaskPriority,
} from '@ordo-todo/api-client';

// Type-safe task creation
const taskData: CreateTaskDto = {
  title: 'My Task',
  projectId: 'project-id',
  priority: 'HIGH', // Autocomplete works!
};

const task: Task = await apiClient.createTask(taskData);

// TypeScript knows all the fields
console.log(task.id, task.status, task.createdAt);
```

## Integration with React Query

Perfect for use with TanStack Query (React Query):

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';

// Query for tasks
function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.getTasks(projectId),
  });
}

// Mutation for creating tasks
function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Usage in component
function TaskList({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const createTask = useCreateTask();

  const handleCreate = async () => {
    await createTask.mutateAsync({
      title: 'New Task',
      projectId,
      priority: 'MEDIUM',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {tasks?.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
      <button onClick={handleCreate}>Create Task</button>
    </div>
  );
}
```

## Development

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Type check
npm run check-types

# Clean build artifacts
npm run clean
```

## License

Part of the Ordo-Todo monorepo.
