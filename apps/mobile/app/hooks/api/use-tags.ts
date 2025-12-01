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
 * Hook to get a single tag by ID
 */
export function useTag(tagId: string) {
  return useQuery({
    queryKey: ['tags', tagId],
    queryFn: () => apiClient.getTag(tagId),
    enabled: !!tagId,
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
      queryClient.setQueryData(['tags', updatedTag.id], updatedTag);
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
      queryClient.removeQueries({ queryKey: ['tags', tagId] });
      console.log('[useDeleteTag] Tag deleted:', tagId);
    },
    onError: (error: any) => {
      console.error('[useDeleteTag] Failed to delete tag:', error.message);
    },
  });
}

/**
 * Hook to add a tag to a task
 */
export function useAddTaskTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      apiClient.addTaskTag(taskId, tagId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      console.log('[useAddTaskTag] Tag added to task:', taskId);
    },
    onError: (error: any) => {
      console.error('[useAddTaskTag] Failed to add tag to task:', error.message);
    },
  });
}

/**
 * Hook to remove a tag from a task
 */
export function useRemoveTaskTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      apiClient.removeTaskTag(taskId, tagId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      console.log('[useRemoveTaskTag] Tag removed from task:', taskId);
    },
    onError: (error: any) => {
      console.error('[useRemoveTaskTag] Failed to remove tag from task:', error.message);
    },
  });
}
