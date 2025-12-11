import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { StartTimerDto, UpdateTimerSessionDto, StopTimerDto } from '@ordo-todo/api-client';

/**
 * Hook to get active timer session
 */
export function useActiveTimer() {
  return useQuery({
    queryKey: ['timers', 'active'],
    queryFn: () => apiClient.getActiveTimer(),
    staleTime: 1000 * 30, // 30 seconds - more frequent updates for timers
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

/**
 * Hook to get timer sessions for a task
 */
export function useTimerSessions(taskId: string) {
  return useQuery({
    queryKey: ['timers', { taskId }],
    queryFn: () => apiClient.getTimerSessions(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get a single timer session by ID
 */
export function useTimerSession(sessionId: string) {
  return useQuery({
    queryKey: ['timers', sessionId],
    queryFn: () => apiClient.getTimerSession(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get timer stats
 */
export function useTimerStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['timers', 'stats', params],
    queryFn: () => apiClient.getTimerStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get session history
 */
export function useSessionHistory(params?: { page?: number; limit?: number; taskId?: string }) {
  return useQuery({
    queryKey: ['timers', 'history', params],
    queryFn: () => apiClient.getSessionHistory(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get task time sessions
 */
export function useTaskTimeSessions(taskId: string) {
  return useQuery({
    queryKey: ['timers', 'task-time', taskId],
    queryFn: () => apiClient.getTaskTimeSessions(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to start a timer
 */
export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartTimerDto) => apiClient.startTimer(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useStartTimer] Timer started:', session.id);
    },
    onError: (error: any) => {
      console.error('[useStartTimer] Failed to start timer:', error.message);
    },
  });
}

/**
 * Hook to pause the active timer
 */
export function usePauseTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { pauseStartedAt?: Date }) => apiClient.pauseTimer(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[usePauseTimer] Timer paused:', session.id);
    },
    onError: (error: any) => {
      console.error('[usePauseTimer] Failed to pause timer:', error.message);
    },
  });
}

/**
 * Hook to resume the active timer
 */
export function useResumeTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { pauseStartedAt: Date }) => apiClient.resumeTimer(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useResumeTimer] Timer resumed:', session.id);
    },
    onError: (error: any) => {
      console.error('[useResumeTimer] Failed to resume timer:', error.message);
    },
  });
}

/**
 * Hook to stop the active timer
 */
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StopTimerDto) => apiClient.stopTimer(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useStopTimer] Timer stopped:', session.id);
    },
    onError: (error: any) => {
      console.error('[useStopTimer] Failed to stop timer:', error.message);
    },
  });
}

/**
 * Hook to update a timer session
 */
export function useUpdateTimerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimerSessionDto }) =>
      apiClient.updateTimerSession(id, data),
    onSuccess: (updatedSession) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useUpdateTimerSession] Timer session updated:', updatedSession.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateTimerSession] Failed to update timer session:', error.message);
    },
  });
}

/**
 * Hook to delete a timer session
 */
export function useDeleteTimerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteTimerSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useDeleteTimerSession] Timer session deleted:', sessionId);
    },
    onError: (error: any) => {
      console.error('[useDeleteTimerSession] Failed to delete timer session:', error.message);
    },
  });
}
