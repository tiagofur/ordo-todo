import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { StartTimerDto } from '@ordo-todo/api-client';

/**
 * Timer and Time Tracking Hooks
 */

export function useTimeSessions(taskId?: string) {
  return useQuery({
    queryKey: ['time-sessions', { taskId }],
    queryFn: () => apiClient.getTimeSessions(taskId),
  });
}

export function useTimeSession(sessionId: string) {
  return useQuery({
    queryKey: ['time-sessions', sessionId],
    queryFn: () => apiClient.getTimeSessionById(sessionId),
    enabled: !!sessionId,
  });
}

export function useActiveTimeSession() {
  return useQuery({
    queryKey: ['time-sessions', 'active'],
    queryFn: () => apiClient.getActiveTimeSession(),
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
    mutationFn: (sessionId: string) => apiClient.stopTimer(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function usePauseTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.pauseTimer(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function useResumeTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.resumeTimer(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}

export function useDeleteTimeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteTimeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sessions'] });
    },
  });
}
