import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto } from '@ordo-todo/api-client';

/**
 * Hook to get all workspaces
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single workspace by ID
 */
export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () => apiClient.getWorkspace(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a workspace by slug and username
 */
export function useWorkspaceBySlug(username: string, slug: string) {
  return useQuery({
    queryKey: ['workspaces', 'by-slug', username, slug],
    queryFn: () => apiClient.getWorkspaceBySlug(username, slug),
    enabled: !!username && !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => apiClient.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      console.log('[useCreateWorkspace] Workspace created:', newWorkspace.id);
    },
    onError: (error: any) => {
      console.error('[useCreateWorkspace] Failed to create workspace:', error.message);
    },
  });
}

/**
 * Hook to update a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceDto }) =>
      apiClient.updateWorkspace(id, data),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      console.log('[useUpdateWorkspace] Workspace updated:', updatedWorkspace.id);
    },
    onError: (error: any) => {
      console.error('[useUpdateWorkspace] Failed to update workspace:', error.message);
    },
  });
}

/**
 * Hook to delete a workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => apiClient.deleteWorkspace(workspaceId),
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      console.log('[useDeleteWorkspace] Workspace deleted:', workspaceId);
    },
    onError: (error: any) => {
      console.error('[useDeleteWorkspace] Failed to delete workspace:', error.message);
    },
  });
}

/**
 * Hook to get workspace members
 */
export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => apiClient.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to add a member to a workspace
 */
export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddMemberDto }) =>
      apiClient.addWorkspaceMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      console.log('[useAddWorkspaceMember] Member added to workspace:', workspaceId);
    },
    onError: (error: any) => {
      console.error('[useAddWorkspaceMember] Failed to add member:', error.message);
    },
  });
}

/**
 * Hook to remove a member from a workspace
 */
export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      apiClient.removeWorkspaceMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'members'] });
      console.log('[useRemoveWorkspaceMember] Member removed from workspace:', workspaceId);
    },
    onError: (error: any) => {
      console.error('[useRemoveWorkspaceMember] Failed to remove member:', error.message);
    },
  });
}
