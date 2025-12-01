# API Client Usage Examples

This document provides practical examples for using the `@ordo-todo/api-client` package across different platforms.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Web Application Examples](#web-application-examples)
3. [Mobile Application Examples](#mobile-application-examples)
4. [Desktop Application Examples](#desktop-application-examples)
5. [Complete Workflows](#complete-workflows)

## Basic Setup

### Installation

```bash
npm install @ordo-todo/api-client
```

### Creating a Client Instance

```typescript
import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';

const client = new OrdoApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  tokenStorage: new LocalStorageTokenStorage(),
  timeout: 30000,
  onAuthError: async () => {
    // Handle authentication errors
    window.location.href = '/login';
  },
});

export default client;
```

## Web Application Examples

### Next.js App Router with React Query

**File: `lib/api-client.ts`**
```typescript
import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';

export const apiClient = new OrdoApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  tokenStorage: new LocalStorageTokenStorage(),
  onTokenRefresh: async (tokens) => {
    console.log('Token refreshed successfully');
  },
  onAuthError: async () => {
    window.location.href = '/auth/login';
  },
});
```

**File: `hooks/use-workspaces.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateWorkspaceDto } from '@ordo-todo/api-client';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => apiClient.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
```

**File: `components/workspace-list.tsx`**
```typescript
'use client';

import { useWorkspaces, useCreateWorkspace } from '@/hooks/use-workspaces';

export function WorkspaceList() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();

  const handleCreate = async () => {
    await createWorkspace.mutateAsync({
      name: 'New Workspace',
      type: 'PERSONAL',
      color: '#2563EB',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Workspace</button>
      {workspaces?.map((workspace) => (
        <div key={workspace.id}>
          {workspace.name} ({workspace.type})
        </div>
      ))}
    </div>
  );
}
```

### Authentication Flow

**File: `app/auth/login/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const authResponse = await apiClient.login({ email, password });
      console.log('Logged in as:', authResponse.user.email);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Mobile Application Examples

### React Native + Expo Setup

**File: `lib/api-client.ts`**
```typescript
import { OrdoApiClient, TokenStorage } from '@ordo-todo/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const apiClient = new OrdoApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  tokenStorage: new AsyncStorageTokenStorage(),
});
```

**File: `hooks/use-tasks.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateTaskDto, UpdateTaskDto } from '@ordo-todo/api-client';

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.getTasks(projectId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      apiClient.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

**File: `screens/TaskListScreen.tsx`**
```typescript
import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useTasks, useCompleteTask } from '@/hooks/use-tasks';

export function TaskListScreen({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const completeTask = useCompleteTask();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>Status: {item.status}</Text>
            {item.status !== 'COMPLETED' && (
              <Button
                title="Complete"
                onPress={() => completeTask.mutate(item.id)}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}
```

## Desktop Application Examples

### Electron Setup

**File: `src/services/api-client.ts`**
```typescript
import { OrdoApiClient, TokenStorage } from '@ordo-todo/api-client';
import Store from 'electron-store';

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

export const apiClient = new OrdoApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  tokenStorage: new ElectronStoreTokenStorage(),
  onAuthError: async () => {
    // Send IPC message to main process to show login window
    window.electron.showLoginWindow();
  },
});
```

## Complete Workflows

### 1. User Registration and Workspace Creation

```typescript
import { apiClient } from './api-client';

async function onboardNewUser() {
  try {
    // 1. Register user
    const authResponse = await apiClient.register({
      email: 'newuser@example.com',
      password: 'securePassword123',
      name: 'John Doe',
    });

    console.log('User registered:', authResponse.user);

    // 2. Create personal workspace
    const workspace = await apiClient.createWorkspace({
      name: 'My Personal Workspace',
      type: 'PERSONAL',
      color: '#2563EB',
    });

    // 3. Create default workflow
    const workflow = await apiClient.createWorkflow({
      name: 'Getting Started',
      workspaceId: workspace.id,
      color: '#10B981',
    });

    // 4. Create first project
    const project = await apiClient.createProject({
      name: 'My First Project',
      workspaceId: workspace.id,
      workflowId: workflow.id,
      description: 'Welcome to Ordo-Todo!',
    });

    // 5. Create welcome task
    const task = await apiClient.createTask({
      title: 'Complete your profile',
      projectId: project.id,
      priority: 'MEDIUM',
      description: 'Add your profile picture and bio',
    });

    console.log('Onboarding complete!', { workspace, workflow, project, task });
  } catch (error) {
    console.error('Onboarding failed:', error);
  }
}
```

### 2. Task Management Workflow

```typescript
import { apiClient } from './api-client';

async function manageTask(projectId: string) {
  // Create task
  const task = await apiClient.createTask({
    title: 'Build API client',
    projectId,
    priority: 'HIGH',
    estimatedTime: 240, // 4 hours
    dueDate: new Date('2025-12-15'),
  });

  // Add tags
  const tag = await apiClient.createTag({
    name: 'development',
    color: '#3B82F6',
    workspaceId: 'workspace-id',
  });

  await apiClient.assignTagToTask(tag.id, task.id);

  // Create subtasks
  const subtask1 = await apiClient.createSubtask(task.id, {
    title: 'Setup TypeScript',
    priority: 'HIGH',
  });

  const subtask2 = await apiClient.createSubtask(task.id, {
    title: 'Implement endpoints',
    priority: 'MEDIUM',
  });

  // Start timer
  const session = await apiClient.startTimer({
    taskId: task.id,
    timerMode: 'POMODORO',
    sessionType: 'FOCUS',
  });

  // ... work on task ...

  // Stop timer
  await apiClient.stopTimer({ sessionId: session.id });

  // Add comment
  await apiClient.createComment({
    content: 'Completed initial implementation',
    taskId: task.id,
  });

  // Mark subtasks as complete
  await apiClient.completeTask(subtask1.id);
  await apiClient.completeTask(subtask2.id);

  // Mark main task as complete
  await apiClient.completeTask(task.id);

  console.log('Task workflow completed!');
}
```

### 3. Team Workspace Setup

```typescript
import { apiClient } from './api-client';

async function setupTeamWorkspace() {
  // Create team workspace
  const workspace = await apiClient.createWorkspace({
    name: 'Product Team',
    type: 'TEAM',
    description: 'Workspace for product development',
    color: '#8B5CF6',
    icon: 'users',
  });

  // Add team members
  await apiClient.addWorkspaceMember(workspace.id, {
    userId: 'user-1-id',
    role: 'ADMIN',
  });

  await apiClient.addWorkspaceMember(workspace.id, {
    userId: 'user-2-id',
    role: 'MEMBER',
  });

  // Create workflows
  const sprintWorkflow = await apiClient.createWorkflow({
    name: 'Sprint 1',
    workspaceId: workspace.id,
    color: '#F59E0B',
  });

  const backlogWorkflow = await apiClient.createWorkflow({
    name: 'Backlog',
    workspaceId: workspace.id,
    color: '#6B7280',
  });

  // Create projects
  const frontendProject = await apiClient.createProject({
    name: 'Frontend',
    workspaceId: workspace.id,
    workflowId: sprintWorkflow.id,
    color: '#3B82F6',
  });

  const backendProject = await apiClient.createProject({
    name: 'Backend',
    workspaceId: workspace.id,
    workflowId: sprintWorkflow.id,
    color: '#10B981',
  });

  console.log('Team workspace setup complete!', {
    workspace,
    workflows: [sprintWorkflow, backlogWorkflow],
    projects: [frontendProject, backendProject],
  });
}
```

### 4. Analytics and Reporting

```typescript
import { apiClient } from './api-client';

async function generateWeeklyReport() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get daily metrics
  const metrics = await apiClient.getDailyMetrics({
    startDate: weekAgo,
    endDate: now,
  });

  // Calculate totals
  const totalTasksCompleted = metrics.reduce(
    (sum, day) => sum + day.tasksCompleted,
    0
  );

  const totalFocusTime = metrics.reduce((sum, day) => sum + day.focusTime, 0);

  const totalPomodoros = metrics.reduce(
    (sum, day) => sum + day.pomodorosCompleted,
    0
  );

  const averageProductivity =
    metrics.reduce((sum, day) => sum + day.productivityScore, 0) /
    metrics.length;

  console.log('Weekly Report:', {
    period: `${weekAgo.toDateString()} - ${now.toDateString()}`,
    tasksCompleted: totalTasksCompleted,
    focusTimeHours: (totalFocusTime / 60).toFixed(1),
    pomodorosCompleted: totalPomodoros,
    averageProductivity: averageProductivity.toFixed(1),
    currentStreak: metrics[metrics.length - 1]?.streakDays || 0,
  });

  return metrics;
}
```

## Error Handling Best Practices

```typescript
import { AxiosError } from 'axios';
import { apiClient } from './api-client';

async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        return { error: `Validation error: ${message}` };
      } else if (status === 401) {
        return { error: 'Authentication required' };
      } else if (status === 403) {
        return { error: 'Permission denied' };
      } else if (status === 404) {
        return { error: 'Resource not found' };
      } else if (status === 409) {
        return { error: 'Conflict: Resource already exists' };
      } else {
        return { error: `Server error: ${message}` };
      }
    }

    return { error: 'Unknown error occurred' };
  }
}

// Usage
async function createTaskSafely() {
  const result = await safeApiCall(() =>
    apiClient.createTask({
      title: 'My Task',
      projectId: 'invalid-id',
    })
  );

  if (result.error) {
    console.error('Error creating task:', result.error);
    // Show error to user
  } else {
    console.log('Task created:', result.data);
    // Update UI
  }
}
```

## Testing

```typescript
import { OrdoApiClient, MemoryTokenStorage } from '@ordo-todo/api-client';

// Create test client with memory storage
const testClient = new OrdoApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  tokenStorage: new MemoryTokenStorage(),
});

// Test authentication
async function testAuth() {
  const authResponse = await testClient.login({
    email: 'test@example.com',
    password: 'password123',
  });

  console.log('Logged in:', authResponse.user);

  const user = await testClient.getCurrentUser();
  console.log('Current user:', user);

  await testClient.logout();
  console.log('Logged out');
}
```
