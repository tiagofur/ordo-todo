import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateTagDto, UpdateTagDto } from '@ordo-todo/api-client';

/**
 * Tag Management Hooks
 */

export function useTags(workspaceId?: string) {
  return useQuery({
    queryKey: ['tags', { workspaceId }],
    queryFn: () => workspaceId ? apiClient.getTags(workspaceId) : Promise.resolve([]),
    enabled: !!workspaceId,
  });
}

/*
export function useTag(tagId: string) {
  return useQuery({
    queryKey: ['tags', tagId],
    queryFn: () => apiClient.getTagById(tagId),
    enabled: !!tagId,
  });
}
*/

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => apiClient.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) =>
      // apiClient.updateTag(tagId, data),
      Promise.resolve({} as any),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags', variables.tagId] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => apiClient.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useAssignTagToTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
      // apiClient.assignTagToTask(tagId, taskId),
      Promise.resolve({} as any),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
}

export function useRemoveTagFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
      // apiClient.removeTagFromTask(tagId, taskId),
      Promise.resolve({} as any),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
}
