import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateTimerSessionDto, UpdateTimerSessionDto } from '@ordo-todo/api-client';

/**
 * Hook to get timer sessions for a task
 */
export function useTimerSessions(taskId: string) {
  return useQuery({
    queryKey: ['timers', { taskId }],
    queryFn: () => apiClient.getTimerSessions(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30, // 30 seconds - more frequent updates for timers
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
 * Hook to create a new timer session
 */
export function useCreateTimerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimerSessionDto) => apiClient.createTimerSession(data),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      console.log('[useCreateTimerSession] Timer session created:', newSession.id);
    },
    onError: (error: any) => {
      console.error('[useCreateTimerSession] Failed to create timer session:', error.message);
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
      queryClient.setQueryData(['timers', updatedSession.id], updatedSession);
      console.log('[useUpdateTimerSession] Timer session updated:', updatedSession.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateTimerSession] Failed to update timer session:', error.message);
    },
  });
}

/**
 * Hook to start a timer session
 */
export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.startTimer(sessionId),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      queryClient.setQueryData(['timers', session.id], session);
      console.log('[useStartTimer] Timer started:', session.id);
    },
    onError: (error: any) => {
      console.error('[useStartTimer] Failed to start timer:', error.message);
    },
  });
}

/**
 * Hook to pause a timer session
 */
export function usePauseTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.pauseTimer(sessionId),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      queryClient.setQueryData(['timers', session.id], session);
      console.log('[usePauseTimer] Timer paused:', session.id);
    },
    onError: (error: any) => {
      console.error('[usePauseTimer] Failed to pause timer:', error.message);
    },
  });
}

/**
 * Hook to stop a timer session
 */
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiClient.stopTimer(sessionId),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      queryClient.setQueryData(['timers', session.id], session);
      console.log('[useStopTimer] Timer stopped:', session.id);
    },
    onError: (error: any) => {
      console.error('[useStopTimer] Failed to stop timer:', error.message);
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
      queryClient.removeQueries({ queryKey: ['timers', sessionId] });
      console.log('[useDeleteTimerSession] Timer session deleted:', sessionId);
    },
    onError: (error: any) => {
      console.error('[useDeleteTimerSession] Failed to delete timer session:', error.message);
    },
  });
}
