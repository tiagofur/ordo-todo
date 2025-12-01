import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Analytics Hooks
 */

export function useDailyMetrics(userId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'daily-metrics', { userId, startDate, endDate }],
    queryFn: () => apiClient.getDailyMetrics(userId, startDate, endDate),
  });
}

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
