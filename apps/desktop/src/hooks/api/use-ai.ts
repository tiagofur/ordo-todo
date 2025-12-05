import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * AI & Reports Hooks
 */

export function useGenerateWeeklyReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (weekStart?: string) => apiClient.generateWeeklyReport(weekStart),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

export function useReports(params?: { scope?: string; limit?: number; offset?: number }) {
    return useQuery({
        queryKey: ['reports', params],
        queryFn: () => apiClient.getReports(params),
    });
}

export function useReport(reportId: string) {
    return useQuery({
        queryKey: ['reports', reportId],
        queryFn: () => apiClient.getReport(reportId),
        enabled: !!reportId,
    });
}

export function useDeleteReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reportId: string) => apiClient.deleteReport(reportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

export function useAIProfile() {
    return useQuery({
        queryKey: ['ai', 'profile'],
        queryFn: () => apiClient.getAIProfile(),
    });
}

export function useOptimalSchedule(params?: { topN?: number }) {
    return useQuery({
        queryKey: ['ai', 'optimal-schedule', params],
        queryFn: () => apiClient.getOptimalSchedule(params?.topN),
    });
}

export function usePredictTaskDuration(params?: { title?: string; description?: string; category?: string; priority?: string }) {
    return useQuery({
        queryKey: ['ai', 'predict-duration', params],
        queryFn: () => apiClient.predictTaskDuration(params as any),
        enabled: !!params?.title,
    });
}
