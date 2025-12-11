import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateTagDto, UpdateTagDto } from '@ordo-todo/api-client';

/**
 * Hook to get all tags for a workspace
 */
export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: ['tags', { workspaceId }],
    queryFn: () => apiClient.getTags(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get tags for a task
 */
export function useTaskTags(taskId: string) {
  return useQuery({
    queryKey: ['tags', 'task', { taskId }],
    queryFn: () => apiClient.getTaskTags(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => apiClient.createTag(data),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      console.log('[useCreateTag] Tag created:', newTag.id);
    },
    onError: (error: any) => {
      console.error('[useCreateTag] Failed to create tag:', error.message);
    },
  });
}

/**
 * Hook to update a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) =>
      apiClient.updateTag(id, data),
    onSuccess: (updatedTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      console.log('[useUpdateTag] Tag updated:', updatedTag.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateTag] Failed to update tag:', error.message);
    },
  });
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => apiClient.deleteTag(tagId),
    onSuccess: (_, tagId) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      console.log('[useDeleteTag] Tag deleted:', tagId);
    },
    onError: (error: any) => {
      console.error('[useDeleteTag] Failed to delete tag:', error.message);
    },
  });
}
