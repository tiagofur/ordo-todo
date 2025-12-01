import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateCommentDto, UpdateCommentDto } from '@ordo-todo/api-client';

/**
 * Hook to get comments for a task
 */
export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', { taskId }],
    queryFn: () => apiClient.getComments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to get a single comment by ID
 */
export function useComment(commentId: string) {
  return useQuery({
    queryKey: ['comments', commentId],
    queryFn: () => apiClient.getComment(commentId),
    enabled: !!commentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDto) => apiClient.createComment(data),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      console.log('[useCreateComment] Comment created:', newComment.id);
    },
    onError: (error: any) => {
      console.error('[useCreateComment] Failed to create comment:', error.message);
    },
  });
}

/**
 * Hook to update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDto }) =>
      apiClient.updateComment(id, data),
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.setQueryData(['comments', updatedComment.id], updatedComment);
      console.log('[useUpdateComment] Comment updated:', updatedComment.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateComment] Failed to update comment:', error.message);
    },
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.removeQueries({ queryKey: ['comments', commentId] });
      console.log('[useDeleteComment] Comment deleted:', commentId);
    },
    onError: (error: any) => {
      console.error('[useDeleteComment] Failed to delete comment:', error.message);
    },
  });
}
