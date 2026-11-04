# Data Fetching Hooks (packages/hooks)

**React Query hooks factory for ORDO**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hook Factory Pattern](#hook-factory-pattern)
3. [Creating Hooks](#creating-hooks)
4. [Usage in Apps](#usage-in-apps)
5. [Testing](#testing)

---

## 🪝 Overview

`packages/hooks` provides **React Query hooks** using a factory pattern. This allows the same hooks to be used across web, mobile, and desktop apps.

### Key Principles

1. **Factory Pattern**: Hooks are created from a factory function
2. **Type Safety**: Fully typed with TypeScript
3. **Caching**: Automatic caching with React Query
4. **Invalidation**: Automatic cache invalidation on mutations
5. **Reusable**: Same hooks work on all platforms

### Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@ordo-todo/api-client": "workspace:*",
    "@ordo-todo/core": "workspace:*"
  }
}
```

---

## 🏭 Hook Factory Pattern

### Why Factory Pattern?

The factory pattern allows us to:

1. **Pass API client**: Different platforms can provide different API clients
2. **Type safety**: Hooks are typed with the API client methods
3. **Customization**: Each platform can customize behavior

### Basic Factory

```typescript
// packages/hooks/src/hooks.ts (abridged)
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateTaskDto, OrdoApiClient } from "@ordo-todo/api-client";
import { queryKeys } from "./query-keys";

export function createHooks({ apiClient }: { apiClient: OrdoApiClient }) {
  const queryClient = useQueryClient();

  return {
    useTasks: () =>
      useQuery({
        queryKey: queryKeys.tasks(),
        queryFn: () => apiClient.getTasks(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      }),

    useCreateTask: () =>
      useMutation({
        mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        },
      }),

    useDeleteTask: () =>
      useMutation({
        mutationFn: (id: string) => apiClient.deleteTask(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        },
      }),
  };
}
```

---

## 🔨 Creating Hooks

### 1. Query Hooks

```typescript
export function createHooks({ apiClient }: { apiClient: OrdoApiClient }) {
  return {
    // Get all tasks
    useTasks: (options = {}) =>
      useQuery({
        queryKey: queryKeys.tasks(),
        queryFn: () => apiClient.getTasks(),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        ...options,
      }),

    // Get single task by ID
    useTask: (id: string, options = {}) =>
      useQuery({
        queryKey: queryKeys.task(id),
        queryFn: () => apiClient.getTask(id),
        enabled: !!id, // Only fetch if ID exists
        ...options,
      }),
  };
}
```

### 2. Mutation Hooks

```typescript
export function createHooks({ apiClient }: { apiClient: OrdoApiClient }) {
  const queryClient = useQueryClient();

  return {
    // Create task
    useCreateTask: () =>
      useMutation({
        mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
        onSuccess: (newTask) => {
          // Update cache optimistically
          queryClient.setQueryData(queryKeys.allTasks, (old: Task[] | undefined) => {
            return old ? [newTask, ...old] : [newTask];
          });

          // Invalidate to ensure fresh data
          queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        },
      }),

    // Update task
    // (imports: UpdateTaskDto, Task from "@ordo-todo/api-client")
    useUpdateTask: () =>
      useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
          apiClient.updateTask(id, data),
        onMutate: async ({ id, data }) => {
          // Cancel outgoing queries
          await queryClient.cancelQueries({ queryKey: queryKeys.allTasks });
          await queryClient.cancelQueries({ queryKey: queryKeys.task(id) });

          // Snapshot previous value
          const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.allTasks);
          const previousTask = queryClient.getQueryData<Task>(queryKeys.task(id));

          // Optimistically update
          queryClient.setQueryData<Task[]>(queryKeys.allTasks, (old = []) => {
            return old.map((task) =>
              task.id === id ? { ...task, ...data } : task,
            );
          });

          queryClient.setQueryData<Task>(queryKeys.task(id), (old) => {
            return old ? { ...old, ...data } : undefined;
          });

          // Return context for rollback
          return { previousTasks, previousTask };
        },
        onError: (error, variables, context) => {
          // Rollback on error
          if (context?.previousTasks) {
            queryClient.setQueryData(queryKeys.allTasks, context.previousTasks);
          }
          if (context?.previousTask) {
            queryClient.setQueryData(
              queryKeys.task(variables.id),
              context.previousTask,
            );
          }
        },
        onSuccess: (_, variables) => {
          // Invalidate on success
          queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
          queryClient.invalidateQueries({ queryKey: queryKeys.task(variables.id) });
        },
      }),

    // Delete task
    useDeleteTask: () =>
      useMutation({
        mutationFn: (id: string) => apiClient.deleteTask(id),
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: queryKeys.allTasks });

          const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.allTasks);

          queryClient.setQueryData<Task[]>(queryKeys.allTasks, (old = []) => {
            return old.filter((task) => task.id !== id);
          });

          return { previousTasks };
        },
        onError: (error, id, context) => {
          if (context?.previousTasks) {
            queryClient.setQueryData(queryKeys.allTasks, context.previousTasks);
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        },
      }),
  };
}
```

---

## 💻 Usage in Apps

### Web App (apps/web)

**Step 1: Initialize hooks in `apps/web/src/lib/api-hooks.ts`**

```typescript
// apps/web/src/lib/api-hooks.ts
import { createHooks } from "@ordo-todo/hooks";
import { packageApiClient as apiClient } from "./package-api-client";

// One factory call; destructure the hooks the app needs.
export const { useTasks, useCreateTask, useUpdateTask, useDeleteTask } =
  createHooks({ apiClient });
```

**Step 2: Use in components**

```typescript
// apps/web/src/app/dashboard/tasks/page.tsx
'use client';

import { useTasks, useCreateTask } from '@/lib/api-hooks';
import { useState } from 'react';

export function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const [newTitle, setNewTitle] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        createTask.mutate({ title: newTitle });
        setNewTitle('');
      }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task..."
        />
        <button type="submit">Create</button>
      </form>

      <ul>
        {tasks?.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Desktop App (apps/desktop)

Same factory, different client and file location:

```typescript
// apps/desktop/src/lib/shared-hooks.ts
import { createHooks } from "@ordo-todo/hooks";
import { apiClient } from "./api-client";

export const { useTasks, useCreateTask } = createHooks({ apiClient });
```

### Mobile App (apps/mobile)

No hook layer of its own: the mobile shell renders the desktop
frontend, so it consumes the desktop hooks above.

---

## 🧪 Testing

### Unit Test for Hooks

```typescript
// src/__tests__/tasks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHooks } from '@ordo-todo/hooks';

const mockApiClient = {
  getTasks: vi.fn(),
  createTask: vi.fn(),
};

describe('createHooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('useTasks', () => {
    it('should fetch tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];

      mockApiClient.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(
        () => createHooks({ apiClient: mockApiClient as any }).useTasks(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTasks);
      expect(mockApiClient.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCreateTask', () => {
    it('should create task', async () => {
      const newTask = { id: '3', title: 'New Task' };

      mockApiClient.createTask.mockResolvedValue(newTask);

      const { result } = renderHook(
        () => createHooks({ apiClient: mockApiClient as any }).useCreateTask(),
        { wrapper }
      );

      result.current.mutate({ title: 'New Task' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.createTask).toHaveBeenCalledWith({ title: 'New Task' });
    });
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use factory pattern**: Create hooks with `createHooks({ apiClient })`
2. **Type everything**: Use proper TypeScript types
3. **Set stale time**: Cache data appropriately
4. **Invalidate on mutations**: Keep cache fresh
5. **Use optimistic updates**: Better UX
6. **Handle loading/error states**: Provide feedback to users

### ❌ DON'T

1. **Create hooks without factory**: Use factory pattern
2. **Skip typing**: Use proper TypeScript interfaces
3. **Ignore errors**: Handle error states
4. **Forget invalidation**: Stale data causes bugs
5. **Hardcode API client**: Pass it via factory

---

## 📚 Further Reading

- [API Client Guide](./api-client.md)
- [Web Development Guide](../development/web-development.md)
- [State Management Guide](./stores.md)
