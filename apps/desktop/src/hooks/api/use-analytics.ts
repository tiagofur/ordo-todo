import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Analytics Hooks
 */

export function useDailyMetrics(params?: { userId?: string, startDate?: string, endDate?: string }) {
  return useQuery({
    queryKey: ['analytics', 'daily-metrics', params],
    // @ts-ignore - The client expects GetDailyMetricsParams but we are passing matching object
    queryFn: () => apiClient.getDailyMetrics(params),
  });
}

export function useWeeklyMetrics(params?: { weekStart?: string }) {
  return useQuery({
    queryKey: ['analytics', 'weekly', params],
    queryFn: () => apiClient.getWeeklyMetrics(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: () => apiClient.getHeatmapData(),
  });
}

export function useProjectDistribution() {
  return useQuery({
    queryKey: ['analytics', 'project-distribution'],
    queryFn: () => apiClient.getProjectDistribution(),
  });
}

export function useTaskStatusDistribution() {
  return useQuery({
    queryKey: ['analytics', 'task-status-distribution'],
    queryFn: () => apiClient.getTaskStatusDistribution(),
  });
}

// Placeholder hooks commented out until backend implementation
/*
export function useProductivityReport(userId?: string, period?: string) {
  return useQuery({
    queryKey: ['analytics', 'productivity-report', { userId, period }],
    queryFn: () => apiClient.getProductivityReport(userId, period),
  });
}

export function useWorkspaceAnalytics(workspaceId: string) {
  return useQuery({
    queryKey: ['analytics', 'workspace', workspaceId],
    queryFn: () => apiClient.getWorkspaceAnalytics(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: ['analytics', 'project', projectId],
    queryFn: () => apiClient.getProjectAnalytics(projectId),
    enabled: !!projectId,
  });
}
*/
