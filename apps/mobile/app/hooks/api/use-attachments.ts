import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

/**
 * Hook to get attachments for a task
 */
export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ['attachments', { taskId }],
    queryFn: () => apiClient.getAttachments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to get a single attachment by ID
 */
export function useAttachment(attachmentId: string) {
  return useQuery({
    queryKey: ['attachments', attachmentId],
    queryFn: () => apiClient.getAttachment(attachmentId),
    enabled: !!attachmentId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to upload an attachment
 * Note: In React Native, you'll need to use FormData and handle file picking separately
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      apiClient.uploadAttachment(taskId, file),
    onSuccess: (newAttachment) => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
      console.log('[useUploadAttachment] Attachment uploaded:', newAttachment.id);
    },
    onError: (error: any) => {
      console.error('[useUploadAttachment] Failed to upload attachment:', error.message);
    },
  });
}

/**
 * Hook to delete an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => apiClient.deleteAttachment(attachmentId),
    onSuccess: (_, attachmentId) => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
      queryClient.removeQueries({ queryKey: ['attachments', attachmentId] });
      console.log('[useDeleteAttachment] Attachment deleted:', attachmentId);
    },
    onError: (error: any) => {
      console.error('[useDeleteAttachment] Failed to delete attachment:', error.message);
    },
  });
}
