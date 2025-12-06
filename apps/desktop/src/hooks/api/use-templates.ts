import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface TaskTemplate {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    titlePattern?: string;
    defaultPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    defaultEstimatedMinutes?: number;
    defaultDescription?: string;
    defaultTags?: string[];
    workspaceId: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplateDto {
    name: string;
    description?: string;
    icon?: string;
    titlePattern?: string;
    defaultPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    defaultEstimatedMinutes?: number;
    defaultDescription?: string;
    defaultTags?: string[];
    workspaceId: string;
    isPublic?: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> { }

export function useTemplates(workspaceId?: string) {
    return useQuery({
        queryKey: ['templates', { workspaceId }],
        queryFn: async () => {
            // Placeholder: Backend API not implemented
            return [] as TaskTemplate[];
        },
        enabled: !!workspaceId,
    });
}

export function useTemplate(id: string) {
    return useQuery({
        queryKey: ['templates', id],
        queryFn: async () => {
            // Placeholder
            return null as TaskTemplate | null;
        },
        enabled: !!id,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTemplateDto) => {
            // Placeholder
            console.warn('createTemplate not implemented');
            return {} as TaskTemplate;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['templates', { workspaceId: variables.workspaceId }] });
        },
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateDto }) => {
            // Placeholder
            console.warn('updateTemplate not implemented');
            return {} as TaskTemplate;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // Placeholder
            console.warn('deleteTemplate not implemented');
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
}
