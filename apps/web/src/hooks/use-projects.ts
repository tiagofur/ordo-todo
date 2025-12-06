import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateProjectDto, UpdateProjectDto } from '@ordo-todo/api-client';
import { toast } from 'sonner';

export const useProjects = (workspaceId?: string) => {
    const queryClient = useQueryClient();

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects', workspaceId],
        queryFn: () => workspaceId ? apiClient.getProjects(workspaceId) : Promise.resolve([]),
        enabled: !!workspaceId,
    });

    const createProject = useMutation({
        mutationFn: (data: CreateProjectDto) => apiClient.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
            toast.success('Project created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create project');
            console.error(error);
        },
    });

    const updateProject = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
            apiClient.updateProject(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
            toast.success('Project updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update project');
            console.error(error);
        },
    });

    const deleteProject = useMutation({
        mutationFn: (id: string) => apiClient.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
            toast.success('Project deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete project');
            console.error(error);
        },
    });

    return {
        projects,
        isLoading,
        error,
        createProject,
        updateProject,
        deleteProject,
    };
};

export const useProject = (id: string) => {
    const { data: project, isLoading, error } = useQuery({
        queryKey: ['project', id],
        queryFn: () => apiClient.getProject(id),
        enabled: !!id,
    });

    return {
        project,
        isLoading,
        error,
    };
};

export const useProjectBySlug = (workspaceSlug: string, projectSlug: string) => {
    const { data: project, isLoading, error } = useQuery({
        queryKey: ['project', workspaceSlug, projectSlug],
        queryFn: () => apiClient.getProjectBySlug(workspaceSlug, projectSlug),
        enabled: !!workspaceSlug && !!projectSlug,
    });

    return {
        project,
        isLoading,
        error,
    };
};
