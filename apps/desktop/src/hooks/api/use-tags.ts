import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateTagDto, UpdateTagDto } from '@ordo-todo/api-client';

/**
 * Tag Management Hooks
 */

export function useTags(workspaceId?: string) {
  return useQuery({
    queryKey: ['tags', { workspaceId }],
    queryFn: () => apiClient.getTags(workspaceId),
  });
}

export function useTag(tagId: string) {
  return useQuery({
    queryKey: ['tags', tagId],
    queryFn: () => apiClient.getTagById(tagId),
    enabled: !!tagId,
  });
}

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
      apiClient.updateTag(tagId, data),
    onSuccess: (_, variables) => {
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
