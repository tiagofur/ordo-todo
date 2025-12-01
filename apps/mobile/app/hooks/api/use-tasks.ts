import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateTaskDto, UpdateTaskDto } from '@ordo-todo/api-client';

/**
 * Hook to get all tasks, optionally filtered by project
 */
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => apiClient.getTasks(projectId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get a single task by ID
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => apiClient.getTask(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
    onSuccess: (newTask) => {
      // Invalidate tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('[useCreateTask] Task created:', newTask.id);
    },
    onError: (error: any) => {
      console.error('[useCreateTask] Failed to create task:', error.message);
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      apiClient.updateTask(id, data),
    onSuccess: (updatedTask) => {
      // Invalidate tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Update the specific task in cache
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      console.log('[useUpdateTask] Task updated:', updatedTask.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateTask] Failed to update task:', error.message);
    },
  });
}

/**
 * Hook to complete a task
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.completeTask(taskId),
    onSuccess: (completedTask) => {
      // Invalidate tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Update the specific task in cache
      queryClient.setQueryData(['tasks', completedTask.id], completedTask);
      console.log('[useCompleteTask] Task completed:', completedTask.id);
    },
    onError: (error: any) => {
      console.error('[useCompleteTask] Failed to complete task:', error.message);
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Invalidate tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Remove the specific task from cache
      queryClient.removeQueries({ queryKey: ['tasks', taskId] });
      console.log('[useDeleteTask] Task deleted:', taskId);
    },
    onError: (error: any) => {
      console.error('[useDeleteTask] Failed to delete task:', error.message);
    },
  });
}

/**
 * Hook to assign a task to a user
 */
export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      apiClient.assignTask(taskId, userId),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      console.log('[useAssignTask] Task assigned:', updatedTask.id);
    },
    onError: (error: any) => {
      console.error('[useAssignTask] Failed to assign task:', error.message);
    },
  });
}

/**
 * Hook to unassign a task from a user
 */
export function useUnassignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      apiClient.unassignTask(taskId, userId),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      console.log('[useUnassignTask] Task unassigned:', updatedTask.id);
    },
    onError: (error: any) => {
      console.error('[useUnassignTask] Failed to unassign task:', error.message);
    },
  });
}
