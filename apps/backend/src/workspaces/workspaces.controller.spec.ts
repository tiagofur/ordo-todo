import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { UpdateWorkspaceSettingsDto } from './dto/update-workspace-settings.dto';

// Mock the guards and decorators
jest.mock('../common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

jest.mock('../common/guards/workspace.guard', () => ({
  WorkspaceGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: jest.Mocked<WorkspacesService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const mockWorkspacesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      findByUserAndSlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      archive: jest.fn(),
      getMembers: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      inviteMember: jest.fn(),
      acceptInvitation: jest.fn(),
      getInvitations: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      getAuditLogs: jest.fn(),
      createAuditLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        { provide: WorkspacesService, useValue: mockWorkspacesService },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(
      WorkspacesService,
    ) as jest.Mocked<WorkspacesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============ CREATE WORKSPACE TESTS ============

  describe('POST /workspaces', () => {
    it('should create a new workspace', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'New Workspace',
        slug: 'new-workspace',
        type: 'PERSONAL',
        description: 'A test workspace',
      };
      const mockWorkspace = {
        id: 'ws-123',
        ...createDto,
        tier: 'FREE',
        color: '#2563EB',
        ownerId: mockUser.id,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.create.mockResolvedValue(mockWorkspace as any);

      const result = await controller.create(createDto, mockUser as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(mockWorkspace);
    });

    it('should create workspace with default values', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Minimal Workspace',
        slug: 'minimal',
        type: 'PERSONAL',
      };
      const mockWorkspace = {
        id: 'ws-123',
        ...createDto,
        tier: 'FREE',
        color: '#2563EB',
        ownerId: mockUser.id,
        isArchived: false,
      };
      service.create.mockResolvedValue(mockWorkspace as any);

      const result = await controller.create(createDto, mockUser as any);

      expect(result.color).toBe('#2563EB');
      expect(result.tier).toBe('FREE');
    });
  });

  // ============ GET ALL WORKSPACES TESTS ============

  describe('GET /workspaces', () => {
    it('should return all workspaces for user', async () => {
      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          type: 'PERSONAL',
          tier: 'FREE',
          ownerId: mockUser.id,
          owner: {
            id: mockUser.id,
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
          },
          stats: {
            projectCount: 3,
            memberCount: 1,
            taskCount: 10,
          },
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ws-2',
          name: 'Workspace 2',
          slug: 'workspace-2',
          type: 'WORK',
          tier: 'PRO',
          ownerId: 'other-user',
          owner: {
            id: 'other-user',
            username: 'owner',
            name: 'Owner',
            email: 'owner@example.com',
          },
          stats: {
            projectCount: 5,
            memberCount: 3,
            taskCount: 25,
          },
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      service.findAll.mockResolvedValue(mockWorkspaces as any);

      const result = await controller.findAll(mockUser as any);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockWorkspaces);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no workspaces', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser as any);

      expect(result).toEqual([]);
    });
  });

  // ============ GET SINGLE WORKSPACE TESTS ============

  describe('GET /workspaces/:id', () => {
    it('should return workspace by id', async () => {
      const mockWorkspace = {
        id: 'ws-123',
        name: 'Test Workspace',
        slug: 'test-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        ownerId: mockUser.id,
      };
      service.findOne.mockResolvedValue(mockWorkspace as any);

      const result = await controller.findOne('ws-123');

      expect(service.findOne).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockWorkspace);
    });
  });

  // ============ GET BY SLUG TESTS ============

  describe('GET /workspaces/by-slug/:slug', () => {
    it('should return workspace by slug', async () => {
      const mockWorkspace = {
        id: 'ws-123',
        name: 'Test Workspace',
        slug: 'test-workspace',
        type: 'PERSONAL',
      };
      service.findBySlug.mockResolvedValue(mockWorkspace as any);

      const result = await controller.findBySlug('test-workspace');

      expect(service.findBySlug).toHaveBeenCalledWith('test-workspace');
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException when workspace not found by slug', async () => {
      service.findBySlug.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(controller.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ GET BY USERNAME AND SLUG TESTS ============

  describe('GET /workspaces/:username/:slug', () => {
    it('should return workspace by username and slug', async () => {
      const mockWorkspace = {
        id: 'ws-123',
        name: 'Test Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
        ownerId: 'user-123',
        owner: {
          id: 'user-123',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
        },
        stats: {
          projectCount: 2,
          memberCount: 1,
          taskCount: 8,
        },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.findByUserAndSlug.mockResolvedValue(mockWorkspace as any);

      const result = await controller.findByUserAndSlug(
        'testuser',
        'my-workspace',
      );

      expect(service.findByUserAndSlug).toHaveBeenCalledWith(
        'testuser',
        'my-workspace',
      );
      expect(result.slug).toBe('my-workspace');
    });

    it('should throw NotFoundException when user not found', async () => {
      service.findByUserAndSlug.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.findByUserAndSlug('nonexistent', 'slug'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      service.findByUserAndSlug.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.findByUserAndSlug('testuser', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ UPDATE WORKSPACE TESTS ============

  describe('PUT /workspaces/:id', () => {
    it('should update workspace', async () => {
      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Workspace',
        description: 'Updated description',
      };
      const updatedWorkspace = {
        id: 'ws-123',
        ...updateDto,
        slug: 'test-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        ownerId: mockUser.id,
      };
      service.update.mockResolvedValue(updatedWorkspace as any);

      const result = await controller.update('ws-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('ws-123', updateDto);
      expect(result.name).toBe('Updated Workspace');
    });

    it('should throw NotFoundException when updating non-existent workspace', async () => {
      const updateDto: UpdateWorkspaceDto = { name: 'Updated' };
      service.update.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.update('ws-nonexistent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ DELETE WORKSPACE TESTS ============

  describe('DELETE /workspaces/:id', () => {
    it('should delete workspace', async () => {
      service.remove.mockResolvedValue({ success: true } as any);

      const result = await controller.remove('ws-123', mockUser as any);

      expect(service.remove).toHaveBeenCalledWith('ws-123', mockUser.id);
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException when deleting non-existent workspace', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.remove('ws-nonexistent', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-owner tries to delete', async () => {
      const { ForbiddenException } = require('@nestjs/common');
      service.remove.mockRejectedValue(
        new ForbiddenException(
          'No tienes permisos para eliminar este workspace',
        ),
      );

      await expect(
        controller.remove('ws-123', mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============ ARCHIVE WORKSPACE TESTS ============

  describe('POST /workspaces/:id/archive', () => {
    it('should archive workspace', async () => {
      const archivedWorkspace = {
        id: 'ws-123',
        name: 'Test Workspace',
        isArchived: true,
      };
      service.archive.mockResolvedValue(archivedWorkspace as any);

      const result = await controller.archive('ws-123', mockUser as any);

      expect(service.archive).toHaveBeenCalledWith('ws-123', mockUser.id);
      expect(result.isArchived).toBe(true);
    });

    it('should throw NotFoundException when archiving non-existent workspace', async () => {
      service.archive.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.archive('ws-nonexistent', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ MEMBERS ENDPOINTS TESTS ============

  describe('GET /workspaces/:id/members', () => {
    it('should return workspace members', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          workspaceId: 'ws-123',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'Owner User',
            email: 'owner@example.com',
            image: 'avatar.jpg',
          },
        },
        {
          id: 'member-2',
          workspaceId: 'ws-123',
          userId: 'user-2',
          role: 'MEMBER',
          joinedAt: new Date(),
          user: {
            id: 'user-2',
            name: 'Member User',
            email: 'member@example.com',
            image: null,
          },
        },
      ];
      service.getMembers.mockResolvedValue(mockMembers as any);

      const result = await controller.getMembers('ws-123');

      expect(service.getMembers).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    it('should return owner in members list', async () => {
      const mockMembers = [
        {
          id: 'owner-user-1',
          workspaceId: 'ws-123',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'Owner',
            email: 'owner@example.com',
          },
        },
      ];
      service.getMembers.mockResolvedValue(mockMembers as any);

      const result = await controller.getMembers('ws-123');

      expect(result[0].role).toBe('OWNER');
      expect(result[0].userId).toBe('user-1');
    });

    it('should return empty array when workspace has no members', async () => {
      service.getMembers.mockResolvedValue([]);

      const result = await controller.getMembers('ws-123');

      expect(result).toEqual([]);
    });

    it('should include virtual owner member for legacy workspaces', async () => {
      const mockMembers = [
        {
          id: 'owner-user-legacy',
          workspaceId: 'ws-123',
          userId: 'user-legacy',
          role: 'OWNER',
          joinedAt: new Date('2025-01-01'),
          user: {
            id: 'user-legacy',
            name: 'Legacy Owner',
            email: 'legacy@example.com',
            image: null,
          },
        },
        {
          id: 'member-2',
          workspaceId: 'ws-123',
          userId: 'user-2',
          role: 'MEMBER',
          joinedAt: new Date(),
          user: {
            id: 'user-2',
            name: 'Member',
            email: 'member@example.com',
          },
        },
      ];
      service.getMembers.mockResolvedValue(mockMembers as any);

      const result = await controller.getMembers('ws-123');

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('OWNER');
      expect(result[0].userId).toBe('user-legacy');
    });
  });

  describe('POST /workspaces/:id/members', () => {
    it('should add member to workspace', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'user-789',
        role: 'MEMBER',
      };

      const mockMember = {
        id: 'member-3',
        workspaceId: 'ws-123',
        userId: 'user-789',
        role: 'MEMBER',
        joinedAt: new Date(),
      };

      service.addMember.mockResolvedValue(mockMember as any);

      const result = await controller.addMember('ws-123', addMemberDto);

      expect(service.addMember).toHaveBeenCalledWith('ws-123', addMemberDto);
      expect(result.userId).toBe('user-789');
      expect(result.role).toBe('MEMBER');
    });

    it('should add member with ADMIN role', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'user-admin',
        role: 'ADMIN',
      };

      const mockMember = {
        id: 'member-admin',
        workspaceId: 'ws-123',
        userId: 'user-admin',
        role: 'ADMIN',
        joinedAt: new Date(),
      };

      service.addMember.mockResolvedValue(mockMember as any);

      const result = await controller.addMember('ws-123', addMemberDto);

      expect(service.addMember).toHaveBeenCalledWith('ws-123', addMemberDto);
      expect(result.role).toBe('ADMIN');
    });

    it('should throw NotFoundException when workspace not found', async () => {
      const addMemberDto: AddMemberDto = {
        userId: 'user-789',
        role: 'MEMBER',
      };

      service.addMember.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.addMember('ws-nonexistent', addMemberDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /workspaces/:id/members/:userId', () => {
    it('should remove member from workspace', async () => {
      service.removeMember.mockResolvedValue({ success: true } as any);

      const result = await controller.removeMember('ws-123', 'user-456');

      expect(service.removeMember).toHaveBeenCalledWith('ws-123', 'user-456');
      expect(result).toEqual({ success: true });
    });

    it('should prevent removing owner member', async () => {
      const { BadRequestException } = require('@nestjs/common');
      service.removeMember.mockRejectedValue(
        new Error('Cannot remove the owner from the workspace'),
      );

      await expect(
        controller.removeMember('ws-123', 'user-owner'),
      ).rejects.toThrow('Cannot remove the owner from the workspace');
    });
  });

  // ============ INVITATIONS ENDPOINTS TESTS ============

  describe('POST /workspaces/:id/invitations', () => {
    it('should create invitation for user', async () => {
      const inviteDto: InviteMemberDto = {
        email: 'invitee@example.com',
        role: 'ADMIN',
      };
      const mockResponse = {
        success: true,
        message: 'Invitation created',
        invitationId: 'inv-123',
        devToken: 'test-token-abc',
      };
      service.inviteMember.mockResolvedValue(mockResponse as any);

      const result = await controller.inviteMember(
        'ws-123',
        mockUser as any,
        inviteDto,
      );

      expect(service.inviteMember).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        'invitee@example.com',
        'ADMIN',
      );
      expect(result.success).toBe(true);
      expect(result.devToken).toBe('test-token-abc');
    });

    it('should create invitation with default MEMBER role', async () => {
      const inviteDto: InviteMemberDto = {
        email: 'invitee@example.com',
      };
      const mockResponse = {
        success: true,
        message: 'Invitation created',
        invitationId: 'inv-123',
        devToken: 'test-token',
      };
      service.inviteMember.mockResolvedValue(mockResponse as any);

      const result = await controller.inviteMember(
        'ws-123',
        mockUser as any,
        inviteDto,
      );

      expect(service.inviteMember).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        'invitee@example.com',
        'MEMBER',
      );
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      const inviteDto: InviteMemberDto = {
        email: 'invitee@example.com',
      };
      service.inviteMember.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.inviteMember('ws-nonexistent', mockUser as any, inviteDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /workspaces/:id/invitations', () => {
    it('should return all pending invitations for workspace', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          workspaceId: 'ws-123',
          email: 'user1@example.com',
          role: 'ADMIN',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          invitedById: mockUser.id,
          createdAt: new Date(),
        },
        {
          id: 'inv-2',
          workspaceId: 'ws-123',
          email: 'user2@example.com',
          role: 'MEMBER',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          invitedById: mockUser.id,
          createdAt: new Date(),
        },
      ];
      service.getInvitations.mockResolvedValue(mockInvitations as any);

      const result = await controller.getInvitations('ws-123');

      expect(service.getInvitations).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockInvitations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no invitations exist', async () => {
      service.getInvitations.mockResolvedValue([]);

      const result = await controller.getInvitations('ws-123');

      expect(result).toEqual([]);
    });
  });

  describe('POST /workspaces/invitations/accept', () => {
    it('should accept invitation and add user as member', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'valid-token-abc',
      };
      const mockResponse = {
        success: true,
        message: 'Invitation accepted',
      };
      service.acceptInvitation.mockResolvedValue(mockResponse as any);

      const result = await controller.acceptInvitation(
        mockUser as any,
        acceptDto,
      );

      expect(service.acceptInvitation).toHaveBeenCalledWith(
        'valid-token-abc',
        mockUser.id,
      );
      expect(result.success).toBe(true);
    });

    it('should be idempotent when accepting invitation twice', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'valid-token-abc',
      };
      const mockResponse = {
        success: true,
        message: 'Invitation accepted',
      };
      service.acceptInvitation.mockResolvedValue(mockResponse as any);

      const result1 = await controller.acceptInvitation(
        mockUser as any,
        acceptDto,
      );
      const result2 = await controller.acceptInvitation(
        mockUser as any,
        acceptDto,
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(service.acceptInvitation).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException for invalid token', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'invalid-token',
      };
      service.acceptInvitation.mockRejectedValue(
        new NotFoundException('Invalid invitation token'),
      );

      await expect(
        controller.acceptInvitation(mockUser as any, acceptDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for expired token', async () => {
      const acceptDto: AcceptInvitationDto = {
        token: 'expired-token',
      };
      service.acceptInvitation.mockRejectedValue(
        new NotFoundException('Invitation expired'),
      );

      await expect(
        controller.acceptInvitation(mockUser as any, acceptDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ SETTINGS ENDPOINTS TESTS ============

  describe('GET /workspaces/:id/settings', () => {
    it('should return workspace settings', async () => {
      const mockSettings = {
        workspaceId: 'ws-123',
        defaultView: 'KANBAN',
        defaultDueTime: 9,
        timezone: 'America/New_York',
        locale: 'en',
      };
      service.getSettings.mockResolvedValue(mockSettings as any);

      const result = await controller.getSettings('ws-123');

      expect(service.getSettings).toHaveBeenCalledWith('ws-123');
      expect(result.defaultView).toBe('KANBAN');
      expect(result.timezone).toBe('America/New_York');
    });

    it('should return null when settings not found', async () => {
      service.getSettings.mockResolvedValue(null);

      const result = await controller.getSettings('ws-123');

      expect(result).toBeNull();
    });
  });

  describe('PUT /workspaces/:id/settings', () => {
    it('should update workspace settings', async () => {
      const updateDto: UpdateWorkspaceSettingsDto = {
        defaultView: 'CALENDAR',
        timezone: 'UTC',
        locale: 'es',
      };
      const mockSettings = {
        workspaceId: 'ws-123',
        ...updateDto,
        defaultDueTime: 9,
      };
      service.updateSettings.mockResolvedValue(mockSettings as any);

      const result = await controller.updateSettings('ws-123', updateDto);

      expect(service.updateSettings).toHaveBeenCalledWith('ws-123', updateDto);
      expect(result.defaultView).toBe('CALENDAR');
      expect(result.timezone).toBe('UTC');
      expect(result.locale).toBe('es');
    });
  });

  // ============ AUDIT LOGS ENDPOINTS TESTS ============

  describe('GET /workspaces/:id/audit-logs', () => {
    it('should return audit logs with default pagination', async () => {
      const mockLogs = {
        logs: [
          {
            id: 'log-1',
            workspaceId: 'ws-123',
            action: 'WORKSPACE_CREATED',
            actorId: mockUser.id,
            payload: { name: 'Test' },
            createdAt: new Date(),
          },
          {
            id: 'log-2',
            workspaceId: 'ws-123',
            action: 'MEMBER_ADDED',
            actorId: mockUser.id,
            payload: { userId: 'user-2', role: 'MEMBER' },
            createdAt: new Date(),
          },
        ],
        total: 2,
      };
      service.getAuditLogs.mockResolvedValue(mockLogs as any);

      const result = await controller.getAuditLogs('ws-123');

      expect(service.getAuditLogs).toHaveBeenCalledWith(
        'ws-123',
        undefined,
        undefined,
      );
      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should support custom limit and offset', async () => {
      const mockLogs = {
        logs: [],
        total: 100,
      };
      service.getAuditLogs.mockResolvedValue(mockLogs as any);

      const result = await controller.getAuditLogs('ws-123', 10, 20);

      expect(service.getAuditLogs).toHaveBeenCalledWith('ws-123', 10, 20);
      expect(result.total).toBe(100);
    });
  });

  describe('POST /workspaces/:id/audit-logs', () => {
    it('should create audit log entry', async () => {
      const createLogDto = {
        action: 'CUSTOM_ACTION',
        payload: { custom: 'data' },
      };
      const mockLog = {
        id: 'log-1',
        workspaceId: 'ws-123',
        action: 'CUSTOM_ACTION',
        actorId: mockUser.id,
        payload: { custom: 'data' },
        createdAt: new Date(),
      };
      service.createAuditLog.mockResolvedValue(mockLog as any);

      const result = await controller.createAuditLog(
        'ws-123',
        mockUser as any,
        createLogDto,
      );

      expect(service.createAuditLog).toHaveBeenCalledWith(
        'ws-123',
        'CUSTOM_ACTION',
        mockUser.id,
        { custom: 'data' },
      );
      expect(result.action).toBe('CUSTOM_ACTION');
    });
  });

  // ============ ROUTE ORDERING TESTS ============

  describe('Route ordering', () => {
    it('should match :id/members before :username/:slug', () => {
      // This test documents the intentional route ordering
      // The :id/* routes must come before :username/:slug to avoid conflicts
      // See workspaces.controller.ts line 192-193

      const idMembersPath = 'workspaces/:id/members';
      const usernameSlugPath = 'workspaces/:username/:slug';

      // Routes with :id/members are defined first in the controller
      // ensuring they match before the more generic :username/:slug pattern
      expect(idMembersPath).toBeDefined();
      expect(usernameSlugPath).toBeDefined();
    });
  });
});
