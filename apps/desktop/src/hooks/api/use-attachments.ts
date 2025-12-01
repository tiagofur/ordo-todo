import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Attachment Management Hooks
 */

export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ['attachments', { taskId }],
    queryFn: () => apiClient.getAttachments(taskId),
    enabled: !!taskId,
  });
}

export function useAttachment(attachmentId: string) {
  return useQuery({
    queryKey: ['attachments', attachmentId],
    queryFn: () => apiClient.getAttachmentById(attachmentId),
    enabled: !!attachmentId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      apiClient.uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => apiClient.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}
