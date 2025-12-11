import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateWorkflowDto, UpdateWorkflowDto } from '@ordo-todo/api-client';

/**
 * Hook to get workflows for a workspace
 */
export function useWorkflows(workspaceId: string) {
  return useQuery({
    queryKey: ['workflows', { workspaceId }],
    queryFn: () => apiClient.getWorkflows(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to create a new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowDto) => apiClient.createWorkflow(data),
    onSuccess: (newWorkflow) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      console.log('[useCreateWorkflow] Workflow created:', newWorkflow.id);
    },
    onError: (error: any) => {
      console.error('[useCreateWorkflow] Failed to create workflow:', error.message);
    },
  });
}

/**
 * Hook to update a workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowDto }) =>
      apiClient.updateWorkflow(id, data),
    onSuccess: (updatedWorkflow) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      console.log('[useUpdateWorkflow] Workflow updated:', updatedWorkflow.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateWorkflow] Failed to update workflow:', error.message);
    },
  });
}

/**
 * Hook to delete a workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) => apiClient.deleteWorkflow(workflowId),
    onSuccess: (_, workflowId) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      console.log('[useDeleteWorkflow] Workflow deleted:', workflowId);
    },
    onError: (error: any) => {
      console.error('[useDeleteWorkflow] Failed to delete workflow:', error.message);
    },
  });
}
