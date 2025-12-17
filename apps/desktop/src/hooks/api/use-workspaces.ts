import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  InviteMemberDto,
  AcceptInvitationDto
} from '@ordo-todo/api-client';

/**
 * Workspace Management Hooks
 * 
 * Re-exports shared hooks and implements desktop-specific ones.
 */

// Re-export standard hooks
export {
  useWorkspaces,
  // useWorkspace, // Comentado por ahora si no estamos seguros de que existe en shared
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useInviteMember,
} from '@/lib/shared-hooks';

// ============ DESKTOP SPECIFIC / NOT YET SHARED HOOKS ============

// Verificar si useWorkspace existe en shared antes de habilitarlo
export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () => apiClient.getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

// Added useWorkspaceBySlug
export function useWorkspaceBySlug(slug: string) {
  return useQuery({
    queryKey: ['workspaces', 'slug', slug],
    queryFn: () => apiClient.getWorkspaceBySlug(slug),
    enabled: !!slug,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInvitationDto) => apiClient.acceptWorkspaceInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}


// ============ WORKSPACE SETTINGS HOOKS ============

export function useWorkspaceSettings(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'settings'],
    queryFn: () => apiClient.getWorkspaceSettings(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: {
      workspaceId: string;
      data: {
        defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
        defaultDueTime?: number;
        timezone?: string;
        locale?: string;
      }
    }) => apiClient.updateWorkspaceSettings(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'audit-logs'] });
    },
  });
}

// ============ WORKSPACE AUDIT LOGS HOOKS ============

export function useWorkspaceAuditLogs(workspaceId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'audit-logs', params],
    queryFn: () => apiClient.getWorkspaceAuditLogs(workspaceId, params),
    enabled: !!workspaceId,
  });
}
