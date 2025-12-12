import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateTaskDto, UpdateTaskDto } from '@ordo-todo/api-client';

/**
 * Task Management Hooks
 */

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => apiClient.getTasks(projectId),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => apiClient.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useTaskDetails(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'details'],
    queryFn: () => apiClient.getTaskDetails(taskId),
    enabled: !!taskId,
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

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      apiClient.updateTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] });
    },
  });
}

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

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
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

/* 
export function useReactivateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.reactivateTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useSubtasks(parentTaskId: string) {
  return useQuery({
    queryKey: ['tasks', parentTaskId, 'subtasks'],
    queryFn: () => apiClient.getSubtasks(parentTaskId),
    enabled: !!parentTaskId,
  });
}

*/
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
