import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateProjectDto, UpdateProjectDto } from '@ordo-todo/api-client';

/**
 * Hook to get projects for a workflow
 */
export function useProjects(workflowId?: string) {
  return useQuery({
    queryKey: ['projects', { workflowId }],
    queryFn: () => apiClient.getProjects(workflowId),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to get a single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => apiClient.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      console.log('[useCreateProject] Project created:', newProject.id);
    },
    onError: (error: any) => {
      console.error('[useCreateProject] Failed to create project:', error.message);
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      apiClient.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject);
      console.log('[useUpdateProject] Project updated:', updatedProject.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateProject] Failed to update project:', error.message);
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['projects', projectId] });
      console.log('[useDeleteProject] Project deleted:', projectId);
    },
    onError: (error: any) => {
      console.error('[useDeleteProject] Failed to delete project:', error.message);
    },
  });
}
