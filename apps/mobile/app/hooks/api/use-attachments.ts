import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateAttachmentDto } from '@ordo-todo/api-client';

/**
 * Hook to get attachments for a task
 */
export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ['attachments', { taskId }],
    queryFn: () => apiClient.getTaskAttachments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to get attachments for a project
 */
export function useProjectAttachments(projectId: string) {
  return useQuery({
    queryKey: ['attachments', 'project', { projectId }],
    queryFn: () => apiClient.getProjectAttachments(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to create an attachment
 */
export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttachmentDto) => apiClient.createAttachment(data),
    onSuccess: (newAttachment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
      console.log('[useCreateAttachment] Attachment created:', newAttachment.id);
    },
    onError: (error: any) => {
      console.error('[useCreateAttachment] Failed to create attachment:', error.message);
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
      console.log('[useDeleteAttachment] Attachment deleted:', attachmentId);
    },
    onError: (error: any) => {
      console.error('[useDeleteAttachment] Failed to delete attachment:', error.message);
    },
  });
}
