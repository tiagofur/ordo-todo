import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateCommentDto, UpdateCommentDto } from '@ordo-todo/api-client';

/**
 * Comment Management Hooks
 */

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', { taskId }],
    queryFn: () => apiClient.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useComment(commentId: string) {
  return useQuery({
    queryKey: ['comments', commentId],
    queryFn: () => apiClient.getCommentById(commentId),
    enabled: !!commentId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDto) => apiClient.createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentDto }) =>
      apiClient.updateComment(commentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.commentId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
