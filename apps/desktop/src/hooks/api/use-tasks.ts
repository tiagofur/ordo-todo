import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateTaskDto } from '@ordo-todo/api-client';

/**
 * Task Management Hooks
 * 
 * Re-exports shared hooks and implements desktop-specific ones.
 */

// Re-export standard hooks from shared collection
export {
  useTasks,
  useTask,
  useTaskDetails,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
} from '@/lib/shared-hooks';

// ============ DESKTOP SPECIFIC / NOT YET SHARED HOOKS ============

export function useAvailableTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', 'available', projectId],
    queryFn: () => apiClient.getAvailableTasks(projectId),
  });
}

export function useTimeBlocks(start?: Date | string, end?: Date | string) {
  return useQuery({
    queryKey: ['time-blocks', start instanceof Date ? start.toISOString() : start, end instanceof Date ? end.toISOString() : end],
    queryFn: () => apiClient.getTimeBlocks(start, end),
  });
}

export function useTaskDependencies(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'dependencies'],
    queryFn: () => apiClient.getTaskDependencies(taskId),
    enabled: !!taskId,
  });
}

export function useAddDependency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockedTaskId, blockingTaskId }: { blockedTaskId: string, blockingTaskId: string }) =>
      apiClient.addTaskDependency(blockedTaskId, blockingTaskId),
    onSuccess: (_, { blockedTaskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', blockedTaskId, 'dependencies'] });
      // Maybe invalidate task details too if we show blocked status there
      queryClient.invalidateQueries({ queryKey: ['tasks', blockedTaskId] });
    }
  });
}

export function useRemoveDependency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockedTaskId, blockingTaskId }: { blockedTaskId: string, blockingTaskId: string }) =>
      apiClient.removeTaskDependency(blockedTaskId, blockingTaskId),
    onSuccess: (_, { blockedTaskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', blockedTaskId, 'dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', blockedTaskId] });
    }
  });
}

// ============ TASK SHARING ============

export function useSharedTask(token: string) {
  return useQuery({
    queryKey: ['shared-task', token],
    queryFn: () => apiClient.getSharedTask(token),
    enabled: !!token,
    retry: false,
  });
}

export function useGenerateShareToken() {
  return useMutation({
    mutationFn: (taskId: string) => apiClient.generateShareToken(taskId),
  });
}

export function useShareUrl() {
  return useMutation({
    mutationFn: (taskId: string) => apiClient.getShareUrl(taskId),
  });
}
