"use client";

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateSubtask } from '../api-hooks';
import type { ReactNode } from 'react';

// Mock the API client
vi.mock('../api-client', () => ({
  apiClient: {
    createSubtask: vi.fn(),
    getTasks: vi.fn(),
    getTaskDetails: vi.fn(),
  },
}));

describe('Subtask Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCreateSubtask', () => {
    it('should create a subtask successfully', async () => {
      const newSubtask = {
        title: 'New Subtask',
      };

      const createdSubtask = {
        id: 'subtask-1',
        title: 'New Subtask',
        status: 'TODO',
        parentTaskId: 'parent-task-1',
        createdAt: new Date().toISOString(),
      };

      const { apiClient } = await import('../api-client');
      vi.mocked(apiClient.createSubtask).mockResolvedValue(createdSubtask as any);

      const { result } = renderHook(() => useCreateSubtask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          parentTaskId: 'parent-task-1',
          data: newSubtask,
        });
      });

      expect(apiClient.createSubtask).toHaveBeenCalledWith('parent-task-1', newSubtask);
    });

    it('should invalidate parent task queries on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const createdSubtask = {
        id: 'subtask-1',
        title: 'New Subtask',
        status: 'TODO',
        parentTaskId: 'parent-task-1',
      };

      const { apiClient } = await import('../api-client');
      vi.mocked(apiClient.createSubtask).mockResolvedValue(createdSubtask as any);

      const { result } = renderHook(() => useCreateSubtask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          parentTaskId: 'parent-task-1',
          data: { title: 'New Subtask' },
        });
      });

      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('should handle errors when creating subtask', async () => {
      const { apiClient } = await import('../api-client');
      const errorMessage = 'Failed to create subtask';
      vi.mocked(apiClient.createSubtask).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCreateSubtask(), { wrapper });

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.mutateAsync({
            parentTaskId: 'parent-task-1',
            data: { title: 'New Subtask' },
          });
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe(errorMessage);
    });

    it('should pass all subtask data correctly', async () => {
      const subtaskWithDetails = {
        title: 'Detailed Subtask',
        description: 'This is a detailed description',
        priority: 'HIGH' as const,
      };

      const createdSubtask = {
        id: 'subtask-2',
        ...subtaskWithDetails,
        status: 'TODO',
        parentTaskId: 'parent-task-1',
      };

      const { apiClient } = await import('../api-client');
      vi.mocked(apiClient.createSubtask).mockResolvedValue(createdSubtask as any);

      const { result } = renderHook(() => useCreateSubtask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          parentTaskId: 'parent-task-1',
          data: subtaskWithDetails,
        });
      });

      expect(apiClient.createSubtask).toHaveBeenCalledWith('parent-task-1', subtaskWithDetails);
    });
  });
});
