import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type {
    CreateObjectiveDto,
    LinkTaskDto,
    CreateKeyResultDto,
    UpdateKeyResultDto,
    UpdateObjectiveDto
} from '@ordo-todo/api-client';

export function useObjectives() {
    return useQuery({
        queryKey: ['objectives'],
        queryFn: () => apiClient.getObjectives()
    });
}

export function useCurrentPeriodObjectives() {
    return useQuery({
        queryKey: ['objectives', 'current'],
        queryFn: () => apiClient.getCurrentPeriodObjectives()
    });
}

export function useObjectivesDashboardSummary() {
    return useQuery({
        queryKey: ['objectives', 'dashboard'],
        queryFn: () => apiClient.getObjectivesDashboardSummary()
    });
}

export function useObjective(id: string) {
    return useQuery({
        queryKey: ['objectives', id],
        queryFn: () => apiClient.getObjective(id),
        enabled: !!id
    });
}

export function useCreateObjective() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateObjectiveDto) => apiClient.createObjective(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
        }
    });
}

export function useUpdateObjective() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateObjectiveDto }) => apiClient.updateObjective(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            queryClient.invalidateQueries({ queryKey: ['objectives', id] });
        }
    });
}

export function useDeleteObjective() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.deleteObjective(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
        }
    });
}

export function useAddKeyResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, data }: { objectiveId: string; data: CreateKeyResultDto }) =>
            apiClient.addKeyResult(objectiveId, data),
        onSuccess: (_, { objectiveId }) => {
            queryClient.invalidateQueries({ queryKey: ['objectives', objectiveId] });
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
        }
    });
}

export function useUpdateKeyResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, keyResultId, data }: { objectiveId: string; keyResultId: string; data: UpdateKeyResultDto }) =>
            apiClient.updateKeyResult(keyResultId, data),
        onSuccess: (_, { objectiveId }) => {
            queryClient.invalidateQueries({ queryKey: ['objectives', objectiveId] });
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
        }
    });
}

export function useDeleteKeyResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) =>
            apiClient.deleteKeyResult(keyResultId),
        onSuccess: (_, { objectiveId }) => {
            queryClient.invalidateQueries({ queryKey: ['objectives', objectiveId] });
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
        }
    });
}

export function useLinkTaskToKeyResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ keyResultId, data }: { keyResultId: string; data: LinkTaskDto }) =>
            apiClient.linkTaskToKeyResult(keyResultId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
}

export function useUnlinkTaskFromKeyResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ keyResultId, taskId }: { keyResultId: string; taskId: string }) =>
            apiClient.unlinkTaskFromKeyResult(keyResultId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
}
