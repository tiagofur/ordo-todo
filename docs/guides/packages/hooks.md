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
// ideas.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { ApiClient } from "@ordo-todo/api-client";
import { Idea, CreateIdeaDto, UpdateIdeaDto } from "@ordo-todo/core";

export function createIdeaHooks(apiClient: ApiClient) {
  const queryClient = useQueryClient();

  return {
    useIdeas: (options = {}) =>
      useQuery({
        queryKey: ["ideas"],
        queryFn: apiClient.ideas.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        ...options,
      }),

    useIdea: (id: string, options = {}) =>
      useQuery({
        queryKey: ["ideas", id],
        queryFn: () => apiClient.ideas.getOne(id),
        enabled: !!id,
        ...options,
      }),

    useCreateIdea: () =>
      useMutation({
        mutationFn: (data: CreateIdeaDto) => apiClient.ideas.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
        },
      }),

    useUpdateIdea: () =>
      useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateIdeaDto }) =>
          apiClient.ideas.update(id, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
          queryClient.invalidateQueries({ queryKey: ["ideas", variables.id] });
        },
      }),

    useDeleteIdea: () =>
      useMutation({
        mutationFn: (id: string) => apiClient.ideas.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
        },
      }),

    useMoveIdeaToContent: () =>
      useMutation({
        mutationFn: (id: string) => apiClient.ideas.moveToContent(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
          queryClient.invalidateQueries({ queryKey: ["contentPieces"] });
        },
      }),
  };
}
```

---

## 🔨 Creating Hooks

### 1. Query Hooks

```typescript
export function createIdeaHooks(apiClient: ApiClient) {
  return {
    // Get all ideas
    useIdeas: (options = {}) =>
      useQuery({
        queryKey: ["ideas"],
        queryFn: apiClient.ideas.getAll,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        ...options,
      }),

    // Get single idea by ID
    useIdea: (id: string, options = {}) =>
      useQuery({
        queryKey: ["ideas", id],
        queryFn: () => apiClient.ideas.getOne(id),
        enabled: !!id, // Only fetch if ID exists
        ...options,
      }),

    // Get ideas by status
    useIdeasByStatus: (status: IdeaStatus, options = {}) =>
      useQuery({
        queryKey: ["ideas", "status", status],
        queryFn: () => apiClient.ideas.getByStatus(status),
        enabled: !!status,
        ...options,
      }),
  };
}
```

### 2. Mutation Hooks

```typescript
export function createIdeaHooks(apiClient: ApiClient) {
  const queryClient = useQueryClient();

  return {
    // Create idea
    useCreateIdea: () =>
      useMutation({
        mutationFn: (data: CreateIdeaDto) => apiClient.ideas.create(data),
        onSuccess: (newIdea) => {
          // Update cache optimistically
          queryClient.setQueryData(["ideas"], (old: Idea[] | undefined) => {
            return old ? [newIdea, ...old] : [newIdea];
          });

          // Invalidate to ensure fresh data
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
        },
      }),

    // Update idea
    useUpdateIdea: () =>
      useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateIdeaDto }) =>
          apiClient.ideas.update(id, data),
        onMutate: async ({ id, data }) => {
          // Cancel outgoing queries
          await queryClient.cancelQueries({ queryKey: ["ideas"] });
          await queryClient.cancelQueries({ queryKey: ["ideas", id] });

          // Snapshot previous value
          const previousIdeas = queryClient.getQueryData<Idea[]>(["ideas"]);
          const previousIdea = queryClient.getQueryData<Idea>(["ideas", id]);

          // Optimistically update
          queryClient.setQueryData<Idea[]>(["ideas"], (old = []) => {
            return old.map((idea) =>
              idea.id === id ? { ...idea, ...data } : idea,
            );
          });

          queryClient.setQueryData<Idea>(["ideas", id], (old) => {
            return old ? { ...old, ...data } : undefined;
          });

          // Return context for rollback
          return { previousIdeas, previousIdea };
        },
        onError: (error, variables, context) => {
          // Rollback on error
          if (context?.previousIdeas) {
            queryClient.setQueryData(["ideas"], context.previousIdeas);
          }
          if (context?.previousIdea) {
            queryClient.setQueryData(
              ["ideas", variables.id],
              context.previousIdea,
            );
          }
        },
        onSuccess: (_, variables) => {
          // Invalidate on success
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
          queryClient.invalidateQueries({ queryKey: ["ideas", variables.id] });
        },
      }),

    // Delete idea
    useDeleteIdea: () =>
      useMutation({
        mutationFn: (id: string) => apiClient.ideas.delete(id),
        onMutate: async (id) => {
          await queryClient.cancelQueries({ queryKey: ["ideas"] });

          const previousIdeas = queryClient.getQueryData<Idea[]>(["ideas"]);

          queryClient.setQueryData<Idea[]>(["ideas"], (old = []) => {
            return old.filter((idea) => idea.id !== id);
          });

          return { previousIdeas };
        },
        onError: (error, id, context) => {
          if (context?.previousIdeas) {
            queryClient.setQueryData(["ideas"], context.previousIdeas);
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
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
import {
  createIdeaHooks,
  createContentHooks,
  createSeriesHooks,
} from "@ordo-todo/hooks";
import { apiClient } from "./api-client";

// Initialize hooks with apiClient
const ideaHooks = createIdeaHooks(apiClient);
const contentHooks = createContentHooks(apiClient);
const seriesHooks = createSeriesHooks(apiClient);

// Export individual hooks
export const useIdeas = ideaHooks.useIdeas;
export const useIdea = ideaHooks.useIdea;
export const useCreateIdea = ideaHooks.useCreateIdea;
export const useUpdateIdea = ideaHooks.useUpdateIdea;
export const useDeleteIdea = ideaHooks.useDeleteIdea;
export const useMoveIdeaToContent = ideaHooks.useMoveIdeaToContent;

export const useContentPieces = contentHooks.useContentPieces;
export const useContentPiece = contentHooks.useContentPiece;
export const usePublishContent = contentHooks.usePublishContent;
export const useMoveContentPipeline = contentHooks.useMoveContentPipeline;

export const useSeries = seriesHooks.useSeries;
export const useCreateSeries = seriesHooks.useCreateSeries;
```

**Step 2: Use in components**

```typescript
// apps/web/src/app/dashboard/ideas/page.tsx
'use client';

import { useIdeas, useCreateIdea } from '@/lib/api-hooks';
import { IdeaCard } from '@ordo-todo/ui';
import { useState } from 'react';

export function IdeasPage() {
  const { data: ideas, isLoading, error } = useIdeas();
  const createIdea = useCreateIdea();
  const [newTitle, setNewTitle] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        createIdea.mutate({ title: newTitle });
        setNewTitle('');
      }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New idea..."
        />
        <button type="submit">Create</button>
      </form>

      <div>
        {ideas?.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onClick={(id) => router.push(`/dashboard/ideas/${id}`)}
            labels={{ view: 'View', delete: 'Delete' }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Mobile App (apps/mobile)

Same pattern, just different file location:

```typescript
// apps/mobile/src/lib/api-hooks.ts
import { createIdeaHooks, createContentHooks } from "@ordo-todo/hooks";
import { apiClient } from "./api-client";

const ideaHooks = createIdeaHooks(apiClient);
const contentHooks = createContentHooks(apiClient);

export const useIdeas = ideaHooks.useIdeas;
export const useCreateIdea = ideaHooks.useCreateIdea;
export const useContentPieces = contentHooks.useContentPieces;
```

### Desktop App (apps/desktop)

Same pattern again:

```typescript
// apps/desktop/src/lib/api-hooks.ts
import { createIdeaHooks, createContentHooks } from "@ordo-todo/hooks";
import { apiClient } from "./api-client";

const ideaHooks = createIdeaHooks(apiClient);
const contentHooks = createContentHooks(apiClient);

export const useIdeas = ideaHooks.useIdeas;
export const useCreateIdea = ideaHooks.useCreateIdea;
export const useContentPieces = contentHooks.useContentPieces;
```

---

## 🧪 Testing

### Unit Test for Hooks

```typescript
// src/__tests__/ideas.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createIdeaHooks } from '../ideas';

const mockApiClient = {
  ideas: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    moveToContent: vi.fn(),
  },
};

describe('createIdeaHooks', () => {
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

  describe('useIdeas', () => {
    it('should fetch ideas', async () => {
      const mockIdeas = [
        { id: '1', title: 'Idea 1' },
        { id: '2', title: 'Idea 2' },
      ];

      mockApiClient.ideas.getAll.mockResolvedValue(mockIdeas);

      const { result } = renderHook(
        () => createIdeaHooks(mockApiClient as any).useIdeas(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockIdeas);
      expect(mockApiClient.ideas.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCreateIdea', () => {
    it('should create idea', async () => {
      const newIdea = { id: '3', title: 'New Idea' };

      mockApiClient.ideas.create.mockResolvedValue(newIdea);

      const { result } = renderHook(
        () => createIdeaHooks(mockApiClient as any).useCreateIdea(),
        { wrapper }
      );

      result.current.mutate({ title: 'New Idea' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.ideas.create).toHaveBeenCalledWith({ title: 'New Idea' });
    });
  });
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use factory pattern**: Create hooks with `createXxxHooks()`
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
