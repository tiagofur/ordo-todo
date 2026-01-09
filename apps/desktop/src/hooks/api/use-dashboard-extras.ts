import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Get AI-powered insights
 * (Ported from Web)
 */
export function useAIInsights(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["ai", "insights"],
        queryFn: () => apiClient.getAIInsights(),
        enabled: options?.enabled ?? true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Get productivity streak data
 * (Ported from Web)
 */
export function useProductivityStreak() {
    return useQuery({
        queryKey: ["analytics", "streak"],
        queryFn: () => apiClient.getProductivityStreak(),
        // Enabled check handled by caller usually, or we can add isAuthenticated like web
    });
}

/**
 * Get available tasks (not completed, available for assignment)
 * (Ported from Web)
 */
export function useAvailableTasks(projectId?: string) {
    return useQuery({
        queryKey: ["tasks", "available", projectId],
        queryFn: () => apiClient.getAvailableTasks(projectId),
    });
}
