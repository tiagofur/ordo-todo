import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { StartTimerDto, StopTimerDto } from '@ordo-todo/api-client';

/**
 * Timer and Time Tracking Hooks
 */

/**
 * Server Timer Hooks (useTimers)
 * 
 * These hooks interact with the backend API to persist timer sessions (TimeSession).
 * Use these for starting/stopping sessions on the server, fetching history, and stats.
 * They work in tandem with the local `useTimer` hook which manages the tick-by-tick UI.
 */
export function useTimeSessions(taskId?: string) {
  return useQuery({
    queryKey: ['time-sessions', { taskId }],
    queryFn: () => taskId ? apiClient.getTaskTimeSessions(taskId) : Promise.resolve([] as any),
  });
}

/*
export function useTimeSession(sessionId: string) {
  return useQuery({
    queryKey: ['time-sessions', sessionId],
    queryFn: () => apiClient.getTimeSessionById(sessionId),
    enabled: !!sessionId,
  });
}
*/

export function useActiveTimeSession() {
  return useQuery({
    queryKey: ['time-sessions', 'active'],
    queryFn: () => apiClient.getActiveTimer(),
    refetchInterval: 5000, // Poll every 5 seconds for active session
  });
}

export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartTimerDto) => apiClient.startTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StopTimerDto) => apiClient.stopTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function usePauseTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.pauseTimer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function useResumeTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { pauseStartedAt: Date }) => apiClient.resumeTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

/*
export function useDeleteTimeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteTimeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}
*/
