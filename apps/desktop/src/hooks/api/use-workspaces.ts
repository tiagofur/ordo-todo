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
 */

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
  });
}

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

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceDto }) =>
      apiClient.updateWorkspace(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', variables.workspaceId] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => apiClient.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

// ============ MEMBER HOOKS ============

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddMemberDto }) =>
      apiClient.addWorkspaceMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      apiClient.removeWorkspaceMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => apiClient.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'invitations'],
    queryFn: () => apiClient.getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: InviteMemberDto }) =>
      apiClient.inviteWorkspaceMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'invitations'] });
    },
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
