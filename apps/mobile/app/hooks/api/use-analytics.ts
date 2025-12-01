import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

/**
 * Hook to get daily metrics for a user
 */
export function useDailyMetrics(userId: string, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['analytics', 'daily-metrics', { userId, startDate, endDate }],
    queryFn: () => apiClient.getDailyMetrics(userId, startDate, endDate),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get productivity summary for a user
 */
export function useProductivitySummary(userId: string, period: 'week' | 'month' | 'year' = 'week') {
  return useQuery({
    queryKey: ['analytics', 'productivity-summary', { userId, period }],
    queryFn: () => apiClient.getProductivitySummary(userId, period),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get task completion stats
 */
export function useTaskCompletionStats(userId: string, workspaceId?: string) {
  return useQuery({
    queryKey: ['analytics', 'task-completion', { userId, workspaceId }],
    queryFn: () => apiClient.getTaskCompletionStats(userId, workspaceId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get time tracking summary
 */
export function useTimeTrackingSummary(userId: string, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['analytics', 'time-tracking', { userId, startDate, endDate }],
    queryFn: () => apiClient.getTimeTrackingSummary(userId, startDate, endDate),
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
