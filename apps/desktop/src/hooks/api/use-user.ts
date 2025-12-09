import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateProfileDto, UpdatePreferencesDto } from '@ordo-todo/api-client';

/**
 * User & Profile Hooks
 */

export function useFullProfile() {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: () => apiClient.getFullProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileDto) => apiClient.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['auth', 'current-user'] });
        },
    });
}

export function useUpdatePreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdatePreferencesDto) => apiClient.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
    });
}

export function useExportData() {
    return useMutation({
        mutationFn: () => apiClient.exportData(),
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient.deleteAccount(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
}
