/**
 * Unit Tests for Workspace API Client Methods
 *
 * These tests verify the workspace-related API methods in the OrdoApiClient.
 * Tests mock axios responses and verify correct endpoint URLs and payload handling.
 *
 * Test Categories:
 * 1. Workspace CRUD operations (create, read, update, delete)
 * 2. Member management (add, remove, list)
 * 3. Invitation management (invite, list, accept)
 * 4. Settings management (get, update)
 * 5. Audit logs (fetch)
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type {
  Workspace,
  WorkspaceWithMembers,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceSettings,
  WorkspaceAuditLog,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  InviteMemberDto,
  AcceptInvitationDto,
  UpdateWorkspaceSettingsDto,
} from '@ordo-todo/api-client';

// Mock axios before importing the client
const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
const mockAxiosPut = vi.fn();
const mockAxiosPatch = vi.fn();
const mockAxiosDelete = vi.fn();
const mockAxiosCreate = vi.fn();

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: mockAxiosCreate,
    },
  };
});

// Set up the mock implementation
mockAxiosCreate.mockReturnValue({
  get: mockAxiosGet,
  post: mockAxiosPost,
  put: mockAxiosPut,
  patch: mockAxiosPatch,
  delete: mockAxiosDelete,
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
});

// Import client after setting up mocks
import { OrdoApiClient } from '@ordo-todo/api-client';

describe('OrdoApiClient - Workspace Methods', () => {
  let client: OrdoApiClient;

  beforeEach(() => {
    // Clear all mocks before each test
    mockAxiosGet.mockReset();
    mockAxiosPost.mockReset();
    mockAxiosPut.mockReset();
    mockAxiosPatch.mockReset();
    mockAxiosDelete.mockReset();

    client = new OrdoApiClient({
      baseURL: 'http://localhost:3001/api/v1',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockWorkspace: Workspace = {
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
  };

  const mockWorkspaceWithMembers: WorkspaceWithMembers = {
    ...mockWorkspace,
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
  };

  // ============ WORKSPACE CRUD OPERATIONS ============

  describe('createWorkspace', () => {
    it('should create a new workspace', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'A brand new workspace',
        type: 'PERSONAL',
        color: '#06b6d4',
      };

      mockAxiosPost.mockResolvedValue({
        data: mockWorkspace,
      });

      const result = await client.createWorkspace(createDto);

      expect(mockAxiosPost).toHaveBeenCalledWith('/workspaces', createDto);
      expect(result).toEqual(mockWorkspace);
    });

    it('should create workspace with minimal data', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Minimal Workspace',
        slug: 'minimal-workspace',
        type: 'WORK',
      };

      mockAxiosPost.mockResolvedValue({
        data: mockWorkspace,
      });

      await client.createWorkspace(createDto);

      expect(mockAxiosPost).toHaveBeenCalledWith('/workspaces', createDto);
    });

    it('should handle API errors on create', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'New Workspace',
        slug: 'new-workspace',
        type: 'PERSONAL',
      };

      mockAxiosPost.mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid workspace data' } },
      });

      await expect(client.createWorkspace(createDto)).rejects.toThrow();
    });
  });

  describe('getWorkspaces', () => {
    it('should fetch all workspaces for current user', async () => {
      const mockWorkspaces: Workspace[] = [
        mockWorkspace,
        {
          ...mockWorkspace,
          id: 'workspace-456',
          name: 'Another Workspace',
          slug: 'another-workspace',
        },
      ];

      mockAxiosGet.mockResolvedValue({
        data: mockWorkspaces,
      });

      const result = await client.getWorkspaces();

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces');
      expect(result).toEqual(mockWorkspaces);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no workspaces exist', async () => {
      mockAxiosGet.mockResolvedValue({
        data: [],
      });

      const result = await client.getWorkspaces();

      expect(result).toEqual([]);
    });

    it('should handle API errors on fetch', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Network error'));

      await expect(client.getWorkspaces()).rejects.toThrow('Network error');
    });
  });

  describe('getWorkspace', () => {
    it('should fetch a specific workspace by ID', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockWorkspaceWithMembers,
      });

      const result = await client.getWorkspace('workspace-123');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123');
      expect(result).toEqual(mockWorkspaceWithMembers);
    });

    it('should include members in workspace response', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockWorkspaceWithMembers,
      });

      const result = await client.getWorkspace('workspace-123');

      expect(result.members).toBeDefined();
      expect(result.members).toHaveLength(1);
      expect(result.members[0].role).toBe('OWNER');
    });

    it('should handle 404 errors for non-existent workspace', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 404, data: { message: 'Workspace not found' } },
      });

      await expect(client.getWorkspace('non-existent')).rejects.toThrow();
    });
  });

  describe('getWorkspaceBySlug', () => {
    it('should fetch a workspace by username and slug', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockWorkspaceWithMembers,
      });

      const result = await client.getWorkspaceBySlug('johndoe', 'my-workspace');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/johndoe/my-workspace');
      expect(result).toEqual(mockWorkspaceWithMembers);
    });

    it('should encode special characters in username and slug', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockWorkspaceWithMembers,
      });

      await client.getWorkspaceBySlug('john.doe', 'my-work-space');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/john.doe/my-work-space');
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace name and description', async () => {
      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Workspace',
        description: 'Updated description',
      };

      const updatedWorkspace = { ...mockWorkspace, ...updateDto };
      mockAxiosPut.mockResolvedValue({
        data: updatedWorkspace,
      });

      const result = await client.updateWorkspace('workspace-123', updateDto);

      expect(mockAxiosPut).toHaveBeenCalledWith(
        '/workspaces/workspace-123',
        updateDto
      );
      expect(result.name).toBe('Updated Workspace');
    });

    it('should update workspace color', async () => {
      const updateDto: UpdateWorkspaceDto = {
        color: '#ff0000',
      };

      mockAxiosPut.mockResolvedValue({
        data: { ...mockWorkspace, color: '#ff0000' },
      });

      const result = await client.updateWorkspace('workspace-123', updateDto);

      expect(result.color).toBe('#ff0000');
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateWorkspaceDto = {
        description: 'New description only',
      };

      mockAxiosPut.mockResolvedValue({
        data: mockWorkspace,
      });

      await client.updateWorkspace('workspace-123', updateDto);

      expect(mockAxiosPut).toHaveBeenCalledWith(
        '/workspaces/workspace-123',
        updateDto
      );
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete a workspace', async () => {
      mockAxiosDelete.mockResolvedValue({});

      await client.deleteWorkspace('workspace-123');

      expect(mockAxiosDelete).toHaveBeenCalledWith('/workspaces/workspace-123');
    });

    it('should handle deletion errors', async () => {
      mockAxiosDelete.mockRejectedValue({
        response: { status: 403, data: { message: 'Not authorized to delete' } },
      });

      await expect(client.deleteWorkspace('workspace-123')).rejects.toThrow();
    });
  });

  // ============ MEMBER MANAGEMENT ============

  describe('addWorkspaceMember', () => {
    it('should add a member to workspace', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'user-456',
        role: 'MEMBER',
      };

      mockAxiosPost.mockResolvedValue({
        data: { success: true },
      });

      const result = await client.addWorkspaceMember('workspace-123', addMemberDto);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/workspaces/workspace-123/members',
        addMemberDto
      );
      expect(result.success).toBe(true);
    });

    it('should add admin member', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'admin-user',
        role: 'ADMIN',
      };

      mockAxiosPost.mockResolvedValue({
        data: { success: true },
      });

      await client.addWorkspaceMember('workspace-123', addMemberDto);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/workspaces/workspace-123/members',
        { userId: 'admin-user', role: 'ADMIN' }
      );
    });

    it('should handle errors when adding member', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'non-existent-user',
        role: 'MEMBER',
      };

      mockAxiosPost.mockRejectedValue({
        response: { status: 404, data: { message: 'User not found' } },
      });

      await expect(
        client.addWorkspaceMember('workspace-123', addMemberDto)
      ).rejects.toThrow();
    });
  });

  describe('removeWorkspaceMember', () => {
    it('should remove a member from workspace', async () => {
      mockAxiosDelete.mockResolvedValue({});

      await client.removeWorkspaceMember('workspace-123', 'user-456');

      expect(mockAxiosDelete).toHaveBeenCalledWith(
        '/workspaces/workspace-123/members/user-456'
      );
    });

    it('should handle errors when removing non-existent member', async () => {
      mockAxiosDelete.mockRejectedValue({
        response: { status: 404, data: { message: 'Member not found' } },
      });

      await expect(
        client.removeWorkspaceMember('workspace-123', 'non-existent-user')
      ).rejects.toThrow();
    });

    it('should prevent removing workspace owner', async () => {
      mockAxiosDelete.mockRejectedValue({
        response: { status: 403, data: { message: 'Cannot remove workspace owner' } },
      });

      await expect(
        client.removeWorkspaceMember('workspace-123', 'owner-user-id')
      ).rejects.toThrow();
    });
  });

  describe('getWorkspaceMembers', () => {
    it('should fetch all members of a workspace', async () => {
      const mockMembers: WorkspaceMember[] = [
        {
          id: 'member-1',
          workspaceId: 'workspace-123',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: new Date('2024-01-01'),
          user: {
            id: 'user-1',
            name: 'Owner User',
            email: 'owner@example.com',
            image: null,
          },
        },
        {
          id: 'member-2',
          workspaceId: 'workspace-123',
          userId: 'user-2',
          role: 'MEMBER',
          joinedAt: new Date('2024-01-02'),
          user: {
            id: 'user-2',
            name: 'Member User',
            email: 'member@example.com',
            image: null,
          },
        },
      ];

      mockAxiosGet.mockResolvedValue({
        data: mockMembers,
      });

      const result = await client.getWorkspaceMembers('workspace-123');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123/members');
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for workspace with no members', async () => {
      mockAxiosGet.mockResolvedValue({
        data: [],
      });

      const result = await client.getWorkspaceMembers('workspace-123');

      expect(result).toEqual([]);
    });
  });

  // ============ INVITATION MANAGEMENT ============

  describe('inviteWorkspaceMember', () => {
    it('should invite a new member by email', async () => {
      const inviteDto: InviteMemberDto = {
        email: 'newmember@example.com',
        role: 'MEMBER',
      };

      const mockInvitation: WorkspaceInvitation = {
        id: 'invite-123',
        workspaceId: 'workspace-123',
        email: 'newmember@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        expiresAt: new Date('2024-02-01'),
        createdAt: new Date('2024-01-01'),
      };

      mockAxiosPost.mockResolvedValue({
        data: mockInvitation,
      });

      const result = await client.inviteWorkspaceMember('workspace-123', inviteDto);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/workspaces/workspace-123/invite',
        inviteDto
      );
      expect(result.email).toBe('newmember@example.com');
    });

    it('should include devToken in dev mode', async () => {
      const inviteDto: InviteMemberDto = {
        email: 'dev@test.com',
        role: 'ADMIN',
      };

      const mockInvitation: WorkspaceInvitation = {
        id: 'invite-dev',
        workspaceId: 'workspace-123',
        email: 'dev@test.com',
        role: 'ADMIN',
        status: 'PENDING',
        expiresAt: new Date('2024-02-01'),
        createdAt: new Date('2024-01-01'),
        devToken: 'dev-token-abc123',
      };

      mockAxiosPost.mockResolvedValue({
        data: mockInvitation,
      });

      const result = await client.inviteWorkspaceMember('workspace-123', inviteDto);

      expect(result.devToken).toBe('dev-token-abc123');
    });
  });

  describe('getWorkspaceInvitations', () => {
    it('should fetch all invitations for a workspace', async () => {
      const mockInvitations: WorkspaceInvitation[] = [
        {
          id: 'invite-1',
          workspaceId: 'workspace-123',
          email: 'pending@example.com',
          role: 'MEMBER',
          status: 'PENDING',
          expiresAt: new Date('2024-02-01'),
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'invite-2',
          workspaceId: 'workspace-123',
          email: 'expired@example.com',
          role: 'VIEWER',
          status: 'EXPIRED',
          expiresAt: new Date('2024-01-01'),
          createdAt: new Date('2023-12-01'),
        },
      ];

      mockAxiosGet.mockResolvedValue({
        data: mockInvitations,
      });

      const result = await client.getWorkspaceInvitations('workspace-123');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123/invitations');
      expect(result).toEqual(mockInvitations);
    });

    it('should return empty array when no invitations exist', async () => {
      mockAxiosGet.mockResolvedValue({
        data: [],
      });

      const result = await client.getWorkspaceInvitations('workspace-123');

      expect(result).toEqual([]);
    });
  });

  describe('acceptWorkspaceInvitation', () => {
    it('should accept a workspace invitation', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'invite-token-abc123',
      };

      mockAxiosPost.mockResolvedValue({
        data: { success: true },
      });

      const result = await client.acceptWorkspaceInvitation(acceptDto);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/workspaces/invitations/accept',
        acceptDto
      );
      expect(result.success).toBe(true);
    });

    it('should handle invalid invitation tokens', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'invalid-token',
      };

      mockAxiosPost.mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid or expired invitation' } },
      });

      await expect(
        client.acceptWorkspaceInvitation(acceptDto)
      ).rejects.toThrow();
    });
  });

  // ============ SETTINGS MANAGEMENT ============

  describe('getWorkspaceSettings', () => {
    it('should fetch workspace settings', async () => {
      const mockSettings: WorkspaceSettings = {
        id: 'settings-123',
        workspaceId: 'workspace-123',
        defaultView: 'LIST',
        defaultDueTime: 9,
        timezone: 'America/New_York',
        locale: 'en-US',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockAxiosGet.mockResolvedValue({
        data: mockSettings,
      });

      const result = await client.getWorkspaceSettings('workspace-123');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123/settings');
      expect(result.defaultView).toBe('LIST');
      expect(result.timezone).toBe('America/New_York');
    });

    it('should handle missing settings', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 404, data: { message: 'Settings not found' } },
      });

      await expect(
        client.getWorkspaceSettings('workspace-123')
      ).rejects.toThrow();
    });
  });

  describe('updateWorkspaceSettings', () => {
    it('should update workspace settings', async () => {
      const updateDto: UpdateWorkspaceSettingsDto = {
        defaultView: 'KANBAN',
        timezone: 'UTC',
      };

      const updatedSettings: WorkspaceSettings = {
        id: 'settings-123',
        workspaceId: 'workspace-123',
        defaultView: 'KANBAN',
        defaultDueTime: 9,
        timezone: 'UTC',
        locale: 'en-US',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockAxiosPut.mockResolvedValue({
        data: updatedSettings,
      });

      const result = await client.updateWorkspaceSettings('workspace-123', updateDto);

      expect(mockAxiosPut).toHaveBeenCalledWith(
        '/workspaces/workspace-123/settings',
        updateDto
      );
      expect(result.defaultView).toBe('KANBAN');
      expect(result.timezone).toBe('UTC');
    });

    it('should update all settings fields', async () => {
      const updateDto: UpdateWorkspaceSettingsDto = {
        defaultView: 'CALENDAR',
        defaultDueTime: 14,
        timezone: 'Europe/London',
        locale: 'en-GB',
      };

      mockAxiosPut.mockResolvedValue({
        data: {
          id: 'settings-123',
          workspaceId: 'workspace-123',
          ...updateDto,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      });

      const result = await client.updateWorkspaceSettings('workspace-123', updateDto);

      expect(result.defaultView).toBe('CALENDAR');
      expect(result.defaultDueTime).toBe(14);
      expect(result.locale).toBe('en-GB');
    });
  });

  // ============ AUDIT LOGS ============

  describe('getWorkspaceAuditLogs', () => {
    it('should fetch audit logs for a workspace', async () => {
      const mockLogs: WorkspaceAuditLog[] = [
        {
          id: 'log-1',
          workspaceId: 'workspace-123',
          actorId: 'user-1',
          action: 'workspace.created',
          payload: { name: 'Test Workspace' },
          createdAt: new Date('2024-01-01'),
          actor: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        {
          id: 'log-2',
          workspaceId: 'workspace-123',
          actorId: 'user-1',
          action: 'member.added',
          payload: { role: 'MEMBER' },
          createdAt: new Date('2024-01-02'),
          actor: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockAxiosGet.mockResolvedValue({
        data: mockLogs,
      });

      const result = await client.getWorkspaceAuditLogs('workspace-123');

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123/audit-logs', {
        params: undefined,
      });
      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(2);
    });

    it('should fetch audit logs with pagination params', async () => {
      const mockLogs: WorkspaceAuditLog[] = [
        {
          id: 'log-1',
          workspaceId: 'workspace-123',
          action: 'workspace.updated',
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockAxiosGet.mockResolvedValue({
        data: mockLogs,
      });

      const result = await client.getWorkspaceAuditLogs('workspace-123', {
        limit: 10,
        offset: 20,
      });

      expect(mockAxiosGet).toHaveBeenCalledWith('/workspaces/workspace-123/audit-logs', {
        params: { limit: 10, offset: 20 },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no logs exist', async () => {
      mockAxiosGet.mockResolvedValue({
        data: [],
      });

      const result = await client.getWorkspaceAuditLogs('workspace-123');

      expect(result).toEqual([]);
    });
  });

  // ============ EDGE CASES AND ERROR HANDLING ============

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        timeout: 100,
      });

      mockAxiosGet.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout of 100ms exceeded')), 150)
        )
      );

      await expect(client.getWorkspaces()).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      mockAxiosGet.mockResolvedValue({
        data: null, // Malformed response
      });

      const result = await client.getWorkspaces();
      expect(result).toBeNull();
    });

    it('should handle 500 server errors', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 500, data: { message: 'Internal server error' } },
      });

      await expect(client.getWorkspaces()).rejects.toThrow();
    });

    it('should handle 401 unauthorized errors', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      await expect(client.getWorkspace('workspace-123')).rejects.toThrow();
    });
  });
});
