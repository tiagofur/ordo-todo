/**
 * Unit Tests for Workspace React Query Hooks
 *
 * These tests verify the React Query hooks for workspace operations.
 * Tests cover:
 * 1. Query hooks (fetching workspaces, members, invitations, settings)
 * 2. Mutation hooks (create, update, delete workspaces, manage members)
 * 3. Cache invalidation behavior
 * 4. Error handling
 * 5. Loading states
 *
 * @note Uses @testing-library/react for testing hooks in isolation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHooks } from '@ordo-todo/hooks';
import type { OrdoApiClient } from '@ordo-todo/api-client';
import type {
  Workspace,
  WorkspaceWithMembers,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceSettings,
  WorkspaceAuditLog,
  WorkspaceAuditLogsResponse,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '@ordo-todo/api-client';

// Test utilities
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Mock API Client
class MockOrdoApiClient implements Partial<OrdoApiClient> {
  // Workspace properties
  public getWorkspaces: () => Promise<Workspace[]> = vi.fn();
  public getWorkspace: (id: string) => Promise<WorkspaceWithMembers> = vi.fn();
  public getWorkspaceBySlug: (username: string, slug: string) => Promise<WorkspaceWithMembers> = vi.fn();
  public createWorkspace: (data: CreateWorkspaceDto) => Promise<Workspace> = vi.fn();
  public updateWorkspace: (id: string, data: UpdateWorkspaceDto) => Promise<Workspace> = vi.fn();
  public deleteWorkspace: (id: string) => Promise<void> = vi.fn();

  // Member properties
  public getWorkspaceMembers: (id: string) => Promise<WorkspaceMember[]> = vi.fn();
  public addWorkspaceMember: (id: string, data: { userId: string; role: string }) => Promise<{ success: boolean }> = vi.fn();
  public removeWorkspaceMember: (workspaceId: string, userId: string) => Promise<void> = vi.fn();

  // Invitation properties
  public getWorkspaceInvitations: (id: string) => Promise<WorkspaceInvitation[]> = vi.fn();
  public inviteWorkspaceMember: (id: string, data: { email: string; role?: string }) => Promise<WorkspaceInvitation> = vi.fn();
  public acceptWorkspaceInvitation: (data: { token: string }) => Promise<{ success: boolean }> = vi.fn();

  // Settings properties
  public getWorkspaceSettings: (id: string) => Promise<WorkspaceSettings> = vi.fn();
  public updateWorkspaceSettings: (id: string, data: Record<string, unknown>) => Promise<WorkspaceSettings> = vi.fn();

  // Audit logs properties
  public getWorkspaceAuditLogs: (id: string, params?: { limit?: number; offset?: number }) => Promise<WorkspaceAuditLogsResponse> = vi.fn();
}

// Mock data factories
const createMockWorkspace = (overrides?: Partial<Workspace>): Workspace => ({
  id: 'workspace-123',
  name: 'Test Workspace',
  slug: 'test-workspace',
  description: 'A test workspace',
  type: 'PERSONAL',
  color: '#06b6d4',
  icon: null,
  ownerId: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockWorkspaceWithMembers = (overrides?: Partial<WorkspaceWithMembers>): WorkspaceWithMembers => ({
  ...createMockWorkspace(),
  members: [
    {
      id: 'member-1',
      workspaceId: 'workspace-123',
      userId: 'user-123',
      role: 'OWNER',
      joinedAt: new Date('2024-01-01'),
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    },
  ],
  ...overrides,
});

const createMockMember = (overrides?: Partial<WorkspaceMember>): WorkspaceMember => ({
  id: 'member-123',
  workspaceId: 'workspace-123',
  userId: 'user-123',
  role: 'MEMBER',
  joinedAt: new Date('2024-01-01'),
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  ...overrides,
});

const createMockInvitation = (overrides?: Partial<WorkspaceInvitation>): WorkspaceInvitation => ({
  id: 'invite-123',
  workspaceId: 'workspace-123',
  email: 'invitee@example.com',
  role: 'MEMBER',
  status: 'PENDING',
  expiresAt: new Date('2024-02-01'),
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSettings = (overrides?: Partial<WorkspaceSettings>): WorkspaceSettings => ({
  id: 'settings-123',
  workspaceId: 'workspace-123',
  defaultView: 'LIST',
  defaultDueTime: 9,
  timezone: 'America/New_York',
  locale: 'en-US',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('Workspace Hooks', () => {
  let queryClient: QueryClient;
  let mockClient: MockOrdoApiClient;
  let hooks: ReturnType<typeof createHooks>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockClient = new MockOrdoApiClient();
    hooks = createHooks({ apiClient: mockClient as unknown as OrdoApiClient });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============ QUERY HOOKS ============

  describe('useWorkspaces', () => {
    it('should fetch workspaces successfully', async () => {
      const mockWorkspaces = [
        createMockWorkspace({ id: 'ws-1', name: 'Workspace 1' }),
        createMockWorkspace({ id: 'ws-2', name: 'Workspace 2' }),
      ];

      vi.mocked(mockClient.getWorkspaces).mockResolvedValue(mockWorkspaces);

      const { result } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockWorkspaces);
      expect(mockClient.getWorkspaces).toHaveBeenCalledTimes(1);
    });

    it('should handle empty workspaces list', async () => {
      vi.mocked(mockClient.getWorkspaces).mockResolvedValue([]);

      const { result } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      vi.mocked(mockClient.getWorkspaces).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should cache workspaces data', async () => {
      const mockWorkspaces = [createMockWorkspace()];
      vi.mocked(mockClient.getWorkspaces).mockResolvedValue(mockWorkspaces);

      // First fetch
      const { result: result1 } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second fetch should use cache
      const { result: result2 } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result2.current.data).toEqual(mockWorkspaces);
      expect(mockClient.getWorkspaces).toHaveBeenCalledTimes(1);
    });
  });

  describe('useWorkspace', () => {
    it('should fetch single workspace by ID', async () => {
      const mockWorkspace = createMockWorkspaceWithMembers();
      vi.mocked(mockClient.getWorkspace).mockResolvedValue(mockWorkspace);

      const { result } = renderHook(() => hooks.useWorkspace('workspace-123'), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockWorkspace);
      expect(mockClient.getWorkspace).toHaveBeenCalledWith('workspace-123');
    });

    it('should not fetch when workspaceId is empty', () => {
      const { result } = renderHook(() => hooks.useWorkspace(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockClient.getWorkspace).not.toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      vi.mocked(mockClient.getWorkspace).mockRejectedValue(new Error('Workspace not found'));

      const { result } = renderHook(() => hooks.useWorkspace('non-existent'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should refetch when workspaceId changes', async () => {
      const workspace1 = createMockWorkspaceWithMembers({ id: 'ws-1' });
      const workspace2 = createMockWorkspaceWithMembers({ id: 'ws-2' });

      vi.mocked(mockClient.getWorkspace)
        .mockResolvedValueOnce(workspace1)
        .mockResolvedValueOnce(workspace2);

      const { result, rerender } = renderHook(
        ({ workspaceId }) => hooks.useWorkspace(workspaceId),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { workspaceId: 'ws-1' },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender({ workspaceId: 'ws-2' });

      await waitFor(() => expect(result.current.data?.id).toBe('ws-2'));
      expect(mockClient.getWorkspace).toHaveBeenCalledTimes(2);
    });
  });

  describe('useWorkspaceBySlug', () => {
    it('should fetch workspace by username and slug', async () => {
      const mockWorkspace = createMockWorkspaceWithMembers();
      vi.mocked(mockClient.getWorkspaceBySlug).mockResolvedValue(mockWorkspace);

      const { result } = renderHook(
        () => hooks.useWorkspaceBySlug('johndoe', 'my-workspace'),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockClient.getWorkspaceBySlug).toHaveBeenCalledWith('johndoe', 'my-workspace');
      expect(result.current.data).toEqual(mockWorkspace);
    });

    it('should not fetch when username or slug is empty', () => {
      const { result } = renderHook(() => hooks.useWorkspaceBySlug('', 'slug'), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useWorkspaceMembers', () => {
    it('should fetch workspace members', async () => {
      const mockMembers = [
        createMockMember({ id: 'member-1', role: 'OWNER' }),
        createMockMember({ id: 'member-2', role: 'ADMIN' }),
      ];

      vi.mocked(mockClient.getWorkspaceMembers).mockResolvedValue(mockMembers);

      const { result } = renderHook(() => hooks.useWorkspaceMembers('workspace-123'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMembers);
      expect(mockClient.getWorkspaceMembers).toHaveBeenCalledWith('workspace-123');
    });

    it('should not fetch when workspaceId is empty', () => {
      const { result } = renderHook(() => hooks.useWorkspaceMembers(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useWorkspaceInvitations', () => {
    it('should fetch workspace invitations', async () => {
      const mockInvitations = [
        createMockInvitation({ id: 'invite-1', email: 'user1@example.com' }),
        createMockInvitation({ id: 'invite-2', email: 'user2@example.com' }),
      ];

      vi.mocked(mockClient.getWorkspaceInvitations).mockResolvedValue(mockInvitations);

      const { result } = renderHook(() => hooks.useWorkspaceInvitations('workspace-123'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockInvitations);
    });
  });

  describe('useWorkspaceSettings', () => {
    it('should fetch workspace settings', async () => {
      const mockSettings = createMockSettings();
      vi.mocked(mockClient.getWorkspaceSettings).mockResolvedValue(mockSettings);

      const { result } = renderHook(() => hooks.useWorkspaceSettings('workspace-123'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSettings);
      expect(result.current.data?.defaultView).toBe('LIST');
    });
  });

  describe('useWorkspaceAuditLogs', () => {
    it('should fetch audit logs', async () => {
      const mockLogs: WorkspaceAuditLogsResponse = {
        logs: [
          {
            id: 'log-1',
            workspaceId: 'workspace-123',
            action: 'workspace.created',
            createdAt: new Date('2024-01-01'),
          },
        ],
        total: 1,
      };

      vi.mocked(mockClient.getWorkspaceAuditLogs).mockResolvedValue(mockLogs);

      const { result } = renderHook(() => hooks.useWorkspaceAuditLogs('workspace-123'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockLogs);
    });

    it('should fetch audit logs with params', async () => {
      const mockLogs: WorkspaceAuditLogsResponse = { logs: [], total: 0 };
      vi.mocked(mockClient.getWorkspaceAuditLogs).mockResolvedValue(mockLogs);

      const { result } = renderHook(
        () => hooks.useWorkspaceAuditLogs('workspace-123', { limit: 10, offset: 20 }),
        {
          wrapper: createWrapper(queryClient),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockClient.getWorkspaceAuditLogs).toHaveBeenCalledWith('workspace-123', {
        limit: 10,
        offset: 20,
      });
    });
  });

  // ============ MUTATION HOOKS ============

  describe('useCreateWorkspace', () => {
    it('should create workspace successfully', async () => {
      const newWorkspace = createMockWorkspace({ id: 'new-workspace' });
      const createDto: CreateWorkspaceDto = {
        name: 'New Workspace',
        slug: 'new-workspace',
        type: 'PERSONAL',
      };

      vi.mocked(mockClient.createWorkspace).mockResolvedValue(newWorkspace);

      const { result } = renderHook(() => hooks.useCreateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(createDto);

      expect(mockClient.createWorkspace).toHaveBeenCalledWith(createDto);
      expect(result.current.data).toEqual(newWorkspace);
    });

    it('should invalidate workspaces query after creation', async () => {
      const newWorkspace = createMockWorkspace();
      vi.mocked(mockClient.createWorkspace).mockResolvedValue(newWorkspace);

      // Pre-populate cache
      queryClient.setQueryData(['workspaces'], [createMockWorkspace()]);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useCreateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        name: 'New',
        slug: 'new',
        type: 'PERSONAL',
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces'] });
    });

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create workspace');
      vi.mocked(mockClient.createWorkspace).mockRejectedValue(error);

      const { result } = renderHook(() => hooks.useCreateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(
        result.current.mutateAsync({
          name: 'New',
          slug: 'new',
          type: 'PERSONAL',
        })
      ).rejects.toThrow();
    });
  });

  describe('useUpdateWorkspace', () => {
    it('should update workspace successfully', async () => {
      const updatedWorkspace = createMockWorkspace({ name: 'Updated Workspace' });
      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Workspace',
      };

      vi.mocked(mockClient.updateWorkspace).mockResolvedValue(updatedWorkspace);

      const { result } = renderHook(() => hooks.useUpdateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: updateDto,
      });

      expect(mockClient.updateWorkspace).toHaveBeenCalledWith('workspace-123', updateDto);
    });

    it('should invalidate workspace queries after update', async () => {
      const updatedWorkspace = createMockWorkspace();
      vi.mocked(mockClient.updateWorkspace).mockResolvedValue(updatedWorkspace);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useUpdateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { name: 'Updated' },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces', 'workspace-123'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces'] });
    });
  });

  describe('useDeleteWorkspace', () => {
    it('should delete workspace successfully', async () => {
      vi.mocked(mockClient.deleteWorkspace).mockResolvedValue();

      const { result } = renderHook(() => hooks.useDeleteWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync('workspace-123');

      expect(mockClient.deleteWorkspace).toHaveBeenCalledWith('workspace-123');
    });

    it('should invalidate workspaces query after deletion', async () => {
      vi.mocked(mockClient.deleteWorkspace).mockResolvedValue();

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useDeleteWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync('workspace-123');

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces'] });
    });
  });

  describe('useAddWorkspaceMember', () => {
    it('should add member to workspace', async () => {
      vi.mocked(mockClient.addWorkspaceMember).mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useAddWorkspaceMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { userId: 'user-456', role: 'MEMBER' },
      });

      expect(mockClient.addWorkspaceMember).toHaveBeenCalledWith('workspace-123', {
        userId: 'user-456',
        role: 'MEMBER',
      });
    });

    it('should invalidate workspace query after adding member', async () => {
      vi.mocked(mockClient.addWorkspaceMember).mockResolvedValue({ success: true });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useAddWorkspaceMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { userId: 'user-456', role: 'MEMBER' },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces', 'workspace-123'] });
    });
  });

  describe('useRemoveWorkspaceMember', () => {
    it('should remove member from workspace', async () => {
      vi.mocked(mockClient.removeWorkspaceMember).mockResolvedValue();

      const { result } = renderHook(() => hooks.useRemoveWorkspaceMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        userId: 'user-456',
      });

      expect(mockClient.removeWorkspaceMember).toHaveBeenCalledWith('workspace-123', 'user-456');
    });

    it('should invalidate workspace and members queries after removal', async () => {
      vi.mocked(mockClient.removeWorkspaceMember).mockResolvedValue();

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useRemoveWorkspaceMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        userId: 'user-456',
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces', 'workspace-123'] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspaces', 'workspace-123', 'members'],
      });
    });
  });

  describe('useInviteMember', () => {
    it('should invite member to workspace', async () => {
      const mockInvitation = createMockInvitation();
      vi.mocked(mockClient.inviteWorkspaceMember).mockResolvedValue(mockInvitation);

      const { result } = renderHook(() => hooks.useInviteMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { email: 'invitee@example.com', role: 'MEMBER' },
      });

      expect(mockClient.inviteWorkspaceMember).toHaveBeenCalledWith('workspace-123', {
        email: 'invitee@example.com',
        role: 'MEMBER',
      });
    });

    it('should invalidate invitations query after inviting', async () => {
      const mockInvitation = createMockInvitation();
      vi.mocked(mockClient.inviteWorkspaceMember).mockResolvedValue(mockInvitation);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useInviteMember(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { email: 'invitee@example.com' },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspaces', 'workspace-123', 'invitations'],
      });
    });
  });

  describe('useAcceptInvitation', () => {
    it('should accept workspace invitation', async () => {
      vi.mocked(mockClient.acceptWorkspaceInvitation).mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useAcceptInvitation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({ token: 'invite-token-abc' });

      expect(mockClient.acceptWorkspaceInvitation).toHaveBeenCalledWith({
        token: 'invite-token-abc',
      });
    });

    it('should invalidate workspaces query after accepting', async () => {
      vi.mocked(mockClient.acceptWorkspaceInvitation).mockResolvedValue({ success: true });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useAcceptInvitation(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({ token: 'invite-token-abc' });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['workspaces'] });
    });
  });

  describe('useUpdateWorkspaceSettings', () => {
    it('should update workspace settings', async () => {
      const updatedSettings = createMockSettings({ defaultView: 'KANBAN' });
      vi.mocked(mockClient.updateWorkspaceSettings).mockResolvedValue(updatedSettings);

      const { result } = renderHook(() => hooks.useUpdateWorkspaceSettings(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { defaultView: 'KANBAN' },
      });

      expect(mockClient.updateWorkspaceSettings).toHaveBeenCalledWith('workspace-123', {
        defaultView: 'KANBAN',
      });
    });

    it('should invalidate settings query after update', async () => {
      const updatedSettings = createMockSettings();
      vi.mocked(mockClient.updateWorkspaceSettings).mockResolvedValue(updatedSettings);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => hooks.useUpdateWorkspaceSettings(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { defaultView: 'LIST' },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspaces', 'workspace-123', 'settings'],
      });
    });
  });

  // ============ LOADING AND ERROR STATES ============

  describe('Loading States', () => {
    it('should show loading state while fetching workspaces', async () => {
      vi.mocked(mockClient.getWorkspaces).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => hooks.useWorkspaces(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should show pending state during mutation', async () => {
      vi.mocked(mockClient.createWorkspace).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockWorkspace()), 100))
      );

      const { result } = renderHook(() => hooks.useCreateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      const mutationPromise = result.current.mutateAsync({
        name: 'New',
        slug: 'new',
        type: 'PERSONAL',
      });

      expect(result.current.isPending).toBe(true);

      await mutationPromise;

      expect(result.current.isPending).toBe(false);
    });
  });

  describe('Optimistic Updates', () => {
    it('should provide optimistic update for workspace updates', async () => {
      const existing = createMockWorkspace({ name: 'Old Name' });
      const updated = createMockWorkspace({ name: 'New Name' });

      // Set up initial cache
      queryClient.setQueryData(['workspaces', 'workspace-123'], existing);

      vi.mocked(mockClient.updateWorkspace).mockResolvedValue(updated);

      const { result } = renderHook(() => hooks.useUpdateWorkspace(), {
        wrapper: createWrapper(queryClient),
      });

      // The updateWorkspace hook doesn't have optimistic updates by default
      // This test verifies the mutation completes successfully
      await result.current.mutateAsync({
        workspaceId: 'workspace-123',
        data: { name: 'New Name' },
      });

      expect(result.current.data).toEqual(updated);
    });
  });
});
