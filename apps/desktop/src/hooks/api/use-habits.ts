import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    CreateHabitDto,
    UpdateHabitDto,
    CompleteHabitDto
} from '@ordo-todo/api-client';

/**
 * Habit Management Hooks for Desktop
 */

// Query keys for habits
export const habitQueryKeys = {
    all: ['habits'] as const,
    today: ['habits', 'today'] as const,
    habit: (id: string) => ['habits', id] as const,
    stats: (id: string) => ['habits', id, 'stats'] as const,
};

export function useHabits() {
    return useQuery({
        queryKey: habitQueryKeys.all,
        queryFn: () => apiClient.getHabits(),
    });
}

export function useTodayHabits() {
    return useQuery({
        queryKey: habitQueryKeys.today,
        queryFn: () => apiClient.getTodayHabits(),
    });
}

export function useHabit(habitId: string) {
    return useQuery({
        queryKey: habitQueryKeys.habit(habitId),
        queryFn: () => apiClient.getHabit(habitId),
        enabled: !!habitId,
    });
}

export function useHabitStats(habitId: string) {
    return useQuery({
        queryKey: habitQueryKeys.stats(habitId),
        queryFn: () => apiClient.getHabitStats(habitId),
        enabled: !!habitId,
    });
}

export function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHabitDto) => apiClient.createHabit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
        },
    });
}

export function useUpdateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ habitId, data }: { habitId: string; data: UpdateHabitDto }) =>
            apiClient.updateHabit(habitId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.habit(variables.habitId) });
        },
    });
}

export function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (habitId: string) => apiClient.deleteHabit(habitId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
        },
    });
}

export function useCompleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ habitId, data }: { habitId: string; data?: CompleteHabitDto }) =>
            apiClient.completeHabit(habitId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
        },
    });
}

export function useUncompleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (habitId: string) => apiClient.uncompleteHabit(habitId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
        },
    });
}

export function usePauseHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (habitId: string) => apiClient.pauseHabit(habitId),
        onSuccess: (_, habitId) => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.habit(habitId) });
        },
    });
}

export function useResumeHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (habitId: string) => apiClient.resumeHabit(habitId),
        onSuccess: (_, habitId) => {
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.today });
            queryClient.invalidateQueries({ queryKey: habitQueryKeys.habit(habitId) });
        },
    });
}
