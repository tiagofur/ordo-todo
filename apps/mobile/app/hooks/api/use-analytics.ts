import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

/**
 * Hook to get daily metrics
 * Uses the shared API client with proper GetDailyMetricsParams
 */
export function useDailyMetrics(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['analytics', 'daily-metrics', { startDate, endDate }],
    queryFn: () => apiClient.getDailyMetrics({
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get weekly metrics
 */
export function useWeeklyMetrics() {
  return useQuery({
    queryKey: ['analytics', 'weekly-metrics'],
    queryFn: () => apiClient.getWeeklyMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get heatmap data
 */
export function useHeatmapData() {
  return useQuery({
    queryKey: ['analytics', 'heatmap-data'],
    queryFn: () => apiClient.getHeatmapData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
