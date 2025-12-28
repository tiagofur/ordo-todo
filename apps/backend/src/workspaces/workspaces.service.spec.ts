import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  // Mock repositories
  const mockWorkspaceRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findByOwnerId: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    findMember: jest.fn(),
    listMembers: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockInvitationRepository = {
    findByWorkspaceId: jest.fn(),
    findPendingInvitations: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockSettingsRepository = {
    findByWorkspaceId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  };

  const mockAuditLogRepository = {
    findByWorkspaceId: jest.fn(),
    countByWorkspaceId: jest.fn(),
    create: jest.fn(),
  };

  const mockWorkflowRepository = {
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockPrismaService = {
    workspace: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: 'WorkspaceRepository',
          useValue: mockWorkspaceRepository,
        },
        {
          provide: 'WorkspaceInvitationRepository',
          useValue: mockInvitationRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'WorkspaceSettingsRepository',
          useValue: mockSettingsRepository,
        },
        {
          provide: 'WorkspaceAuditLogRepository',
          useValue: mockAuditLogRepository,
        },
        {
          provide: 'WorkflowRepository',
          useValue: mockWorkflowRepository,
        },
        {
          provide: 'HashService',
          useValue: mockHashService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============ WORKSPACE CREATION TESTS ============

  describe('create', () => {
    it('should create workspace with default values', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
      };

      const mockWorkspace = {
        id: 'ws-123',
        props: {
          id: 'ws-123',
          name: 'My Workspace',
          slug: 'my-workspace',
          type: 'PERSONAL',
          description: undefined,
          tier: 'FREE',
          color: '#2563EB',
          icon: undefined,
          ownerId: userId,
          isArchived: false,
          isDeleted: false,
          deletedAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.create.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.create(createWorkspaceDto, userId);

      expect(mockWorkspaceRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockWorkspace.props);
    });

    it('should create workspace with custom description and color', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'WORK',
        description: 'A custom workspace',
        color: '#FF5733',
      };

      const mockWorkspace = {
        id: 'ws-123',
        props: {
          id: 'ws-123',
          name: 'My Workspace',
          slug: 'my-workspace',
          type: 'WORK',
          description: 'A custom workspace',
          tier: 'FREE',
          color: '#FF5733',
          ownerId: userId,
          createdAt: new Date(),
        },
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.create.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.create(createWorkspaceDto, userId);

      expect(result.color).toBe('#FF5733');
      expect(result.description).toBe('A custom workspace');
    });

    it('should create default workflow when creating workspace', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
      };

      const mockWorkspace = {
        id: 'ws-123',
        props: {
          id: 'ws-123',
          name: 'My Workspace',
          slug: 'my-workspace',
          type: 'PERSONAL',
          ownerId: userId,
          createdAt: new Date(),
        },
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.save.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.create(createWorkspaceDto, userId);

      expect(result).toEqual(mockWorkspace.props);
      expect(mockWorkflowRepository.save).toHaveBeenCalled();
    });

    it('should create audit log when creating workspace', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
      };

      const mockWorkspace = {
        id: 'ws-123',
        props: {
          id: 'ws-123',
          name: 'My Workspace',
          slug: 'my-workspace',
          type: 'PERSONAL',
          ownerId: userId,
          createdAt: new Date(),
        },
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.create.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      await service.create(createWorkspaceDto, userId);

      expect(mockAuditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if slug already exists for user', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'existing-slug',
        type: 'PERSONAL',
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue({
        id: 'ws-existing',
        name: 'Existing Workspace',
        slug: 'existing-slug',
        ownerId: userId,
      });

      await expect(service.create(createWorkspaceDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(createWorkspaceDto, userId)).rejects.toThrow(
        'You already have a workspace with this slug',
      );
    });

    it('should allow creating workspace with different slug for same user', async () => {
      const userId = 'user-123';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'new-slug',
        type: 'PERSONAL',
      };

      const mockWorkspace = {
        id: 'ws-123',
        props: {
          id: 'ws-123',
          name: 'My Workspace',
          slug: 'new-slug',
          type: 'PERSONAL',
          ownerId: userId,
          createdAt: new Date(),
        },
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.create.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.create(createWorkspaceDto, userId);

      expect(result).toBeDefined();
      expect(result.slug).toBe('new-slug');
    });

    it('should allow same slug for different users', async () => {
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
      };

      const mockWorkspace = {
        id: 'ws-456',
        props: {
          id: 'ws-456',
          name: 'My Workspace',
          slug: 'my-workspace',
          type: 'PERSONAL',
          ownerId: userId2,
          createdAt: new Date(),
        },
      };

      // User 1 has a workspace with this slug, but user 2 doesn't
      mockPrismaService.workspace.findUnique.mockResolvedValue(null);
      mockWorkspaceRepository.create.mockResolvedValue(mockWorkspace as any);
      mockWorkflowRepository.create.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.create(createWorkspaceDto, userId2);

      expect(result).toBeDefined();
    });
  });

  // ============ FIND ALL TESTS ============

  describe('findAll', () => {
    it('should return all workspaces where user is owner', async () => {
      const userId = 'user-123';

      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          description: null,
          type: 'PERSONAL',
          tier: 'FREE',
          color: '#2563EB',
          icon: null,
          ownerId: userId,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: userId,
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
          },
          _count: {
            projects: 3,
            members: 1,
          },
          projects: [
            { _count: { tasks: 5 } },
            { _count: { tasks: 10 } },
            { _count: { tasks: 0 } },
          ],
        },
      ];

      mockPrismaService.workspace.findMany.mockResolvedValue(
        mockWorkspaces as any,
      );

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe(userId);
      expect(result[0].stats).toEqual({
        projectCount: 3,
        memberCount: 1,
        taskCount: 15,
      });
    });

    it('should return all workspaces where user is a member', async () => {
      const userId = 'user-123';
      const ownerId = 'user-owner';

      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Shared Workspace',
          slug: 'shared-workspace',
          type: 'TEAM',
          tier: 'FREE',
          ownerId: ownerId,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: ownerId,
            username: 'owner',
            name: 'Owner User',
            email: 'owner@example.com',
          },
          _count: {
            projects: 2,
            members: 5,
          },
          projects: [{ _count: { tasks: 8 } }, { _count: { tasks: 3 } }],
        },
      ];

      mockPrismaService.workspace.findMany.mockResolvedValue(
        mockWorkspaces as any,
      );

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].stats.taskCount).toBe(11);
    });

    it('should not return deleted workspaces', async () => {
      const userId = 'user-123';

      mockPrismaService.workspace.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
      expect(mockPrismaService.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
          }),
        }),
      );
    });

    it('should return empty array when user has no workspaces', async () => {
      const userId = 'user-no-workspaces';

      mockPrismaService.workspace.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });
  });

  // ============ FIND ONE TESTS ============

  describe('findOne', () => {
    it('should return workspace by id', async () => {
      const workspaceId = 'ws-123';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          slug: 'test-workspace',
          type: 'PERSONAL',
          isDeleted: false,
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);

      const result = await service.findOne(workspaceId);

      expect(result).toEqual(mockWorkspace.props);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      const workspaceId = 'ws-nonexistent';

      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(workspaceId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(workspaceId)).rejects.toThrow(
        'Workspace not found',
      );
    });

    it('should throw NotFoundException when workspace is deleted', async () => {
      const workspaceId = 'ws-deleted';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Deleted Workspace',
          isDeleted: true,
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);

      await expect(service.findOne(workspaceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ FIND BY USER AND SLUG TESTS ============

  describe('findByUserAndSlug', () => {
    it('should return workspace by username and slug', async () => {
      const username = 'testuser';
      const slug = 'my-workspace';
      const userId = 'user-123';

      const mockUser = {
        id: userId,
        username: 'testuser',
      };

      const mockWorkspace = {
        id: 'ws-123',
        name: 'My Workspace',
        slug: 'my-workspace',
        ownerId: userId,
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#2563EB',
        icon: null,
        description: null,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: userId,
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
        },
        _count: {
          projects: 2,
          members: 1,
        },
        projects: [{ _count: { tasks: 5 } }, { _count: { tasks: 3 } }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrismaService.workspace.findUnique.mockResolvedValue(
        mockWorkspace as any,
      );

      const result = await service.findByUserAndSlug(username, slug);

      expect(result).toBeDefined();
      expect(result.slug).toBe(slug);
      expect(result.owner.id).toBe(userId);
      expect(result.stats.taskCount).toBe(8);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.findByUserAndSlug('nonexistent', 'slug'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByUserAndSlug('nonexistent', 'slug'),
      ).rejects.toThrow('User not found');
    });

    it('should throw NotFoundException when workspace not found', async () => {
      const username = 'testuser';
      const slug = 'nonexistent-workspace';
      const userId = 'user-123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        username: 'testuser',
      } as any);
      mockPrismaService.workspace.findUnique.mockResolvedValue(null);

      await expect(service.findByUserAndSlug(username, slug)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByUserAndSlug(username, slug)).rejects.toThrow(
        'Workspace not found',
      );
    });

    it('should throw NotFoundException when workspace is deleted', async () => {
      const username = 'testuser';
      const slug = 'deleted-workspace';
      const userId = 'user-123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        username: 'testuser',
      } as any);
      mockPrismaService.workspace.findUnique.mockResolvedValue({
        isDeleted: true,
      } as any);

      await expect(service.findByUserAndSlug(username, slug)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============ UPDATE TESTS ============

  describe('update', () => {
    it('should update workspace', async () => {
      const workspaceId = 'ws-123';

      const existingWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Old Name',
          slug: 'old-slug',
          type: 'PERSONAL',
          isDeleted: false,
          ownerId: 'user-123',
        },
        update: jest.fn().mockReturnValue({
          id: workspaceId,
          props: {
            id: workspaceId,
            name: 'New Name',
            slug: 'old-slug',
            type: 'PERSONAL',
            isDeleted: false,
            ownerId: 'user-123',
          },
        }),
      };

      const updatedWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'New Name',
          slug: 'old-slug',
          type: 'PERSONAL',
          isDeleted: false,
          ownerId: 'user-123',
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(
        existingWorkspace as any,
      );
      mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.update(workspaceId, { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent workspace', async () => {
      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('ws-nonexistent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============ ARCHIVE TESTS ============

  describe('archive', () => {
    it('should archive workspace', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-123';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: userId,
          isArchived: false,
          isDeleted: false,
        },
        archive: jest.fn().mockReturnThis(),
      };

      const archivedWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: userId,
          isArchived: true,
          isDeleted: false,
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.update.mockResolvedValue(
        archivedWorkspace as any,
      );
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.archive(workspaceId, userId);

      expect(result.isArchived).toBe(true);
    });

    it('should throw NotFoundException when archiving non-existent workspace', async () => {
      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(
        service.archive('ws-nonexistent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-owner tries to archive', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';
      const userId = 'user-other';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          isArchived: false,
        },
        archive: jest.fn().mockReturnThis(),
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);

      // The use case will throw an error when userId != ownerId
      await expect(service.archive(workspaceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ REMOVE (SOFT DELETE) TESTS ============

  describe('remove', () => {
    it('should soft delete workspace', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-123';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: userId,
          isDeleted: false,
          isArchived: false,
        },
        softDelete: jest.fn().mockReturnThis(),
      };

      const deletedWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: userId,
          isDeleted: true,
          isArchived: false,
          deletedAt: new Date(),
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.update.mockResolvedValue(deletedWorkspace as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.remove(workspaceId, userId);

      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException when deleting non-existent workspace', async () => {
      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('ws-nonexistent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-owner tries to delete', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';
      const userId = 'user-other';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          isDeleted: false,
        },
        softDelete: jest.fn().mockReturnThis(),
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);

      await expect(service.remove(workspaceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ MEMBERS TESTS ============

  describe('getMembers', () => {
    it('should return all workspace members including owner as virtual member', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          createdAt: new Date('2025-01-01'),
        },
      };

      const mockOwner = {
        id: ownerId,
        props: {
          id: ownerId,
          name: 'Owner Name',
          username: 'owner',
          email: 'owner@example.com',
          image: 'avatar.jpg',
        },
      };

      const mockMembers = [
        {
          id: 'member-456',
          props: {
            id: 'member-456',
            workspaceId: workspaceId,
            userId: 'user-member',
            role: 'MEMBER',
            joinedAt: new Date('2025-01-02'),
          },
        },
      ];

      const mockMemberUser = {
        id: 'user-member',
        props: {
          id: 'user-member',
          name: 'Member Name',
          username: 'member',
          email: 'member@example.com',
          image: null,
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.listMembers.mockResolvedValue(mockMembers as any);
      mockUserRepository.findById
        .mockResolvedValueOnce(mockOwner as any)
        .mockResolvedValueOnce(mockMemberUser as any);

      const result = await service.getMembers(workspaceId);

      expect(result).toHaveLength(2);

      // Check virtual owner member
      expect(result[0]).toMatchObject({
        userId: ownerId,
        role: 'OWNER',
        workspaceId: workspaceId,
        user: {
          id: ownerId,
          name: 'Owner Name',
          email: 'owner@example.com',
          image: 'avatar.jpg',
        },
      });
      expect(result[0].id).toBe(`owner-${ownerId}`); // Virtual ID

      // Check regular member
      expect(result[1]).toMatchObject({
        id: 'member-456',
        userId: 'user-member',
        role: 'MEMBER',
        user: {
          id: 'user-member',
          name: 'Member Name',
          email: 'member@example.com',
        },
      });
    });

    it('should handle owner already in members list (non-virtual)', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          createdAt: new Date(),
        },
      };

      const mockOwner = {
        id: ownerId,
        props: {
          id: ownerId,
          name: 'Owner Name',
          username: 'owner',
          email: 'owner@example.com',
        },
      };

      // Owner is already in the members list
      const mockMembers = [
        {
          id: 'member-owner',
          props: {
            id: 'member-owner',
            workspaceId: workspaceId,
            userId: ownerId,
            role: 'OWNER',
            joinedAt: new Date(),
          },
        },
        {
          id: 'member-456',
          props: {
            id: 'member-456',
            workspaceId: workspaceId,
            userId: 'user-member',
            role: 'MEMBER',
            joinedAt: new Date(),
          },
        },
      ];

      const mockMemberUser = {
        id: 'user-member',
        props: {
          id: 'user-member',
          name: 'Member Name',
          username: 'member',
          email: 'member@example.com',
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.listMembers.mockResolvedValue(mockMembers as any);
      mockUserRepository.findById
        .mockResolvedValueOnce(mockOwner as any)
        .mockResolvedValueOnce(mockMemberUser as any);

      const result = await service.getMembers(workspaceId);

      // Should return 2 members, not 3 (no duplicate owner)
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        userId: ownerId,
        role: 'OWNER',
        id: 'member-owner', // Real member ID, not virtual
      });
      expect(result[1]).toMatchObject({
        userId: 'user-member',
        role: 'MEMBER',
      });
    });

    it('should return empty array when workspace not found', async () => {
      const workspaceId = 'ws-nonexistent';

      mockWorkspaceRepository.findById.mockResolvedValue(null);

      const result = await service.getMembers(workspaceId);

      expect(result).toEqual([]);
    });

    it('should return members without user data when user not found', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          createdAt: new Date(),
        },
      };

      const mockMembers = [
        {
          id: 'member-456',
          props: {
            id: 'member-456',
            workspaceId: workspaceId,
            userId: 'user-deleted',
            role: 'MEMBER',
            joinedAt: new Date(),
          },
        },
      ];

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.listMembers.mockResolvedValue(mockMembers as any);
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.getMembers(workspaceId);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-deleted');
      expect(result[0].user).toBeNull();
    });

    it('should use username fallback when name is not available', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
          createdAt: new Date(),
        },
      };

      const mockOwner = {
        id: ownerId,
        props: {
          id: ownerId,
          name: null,
          username: 'owneruser',
          email: 'owner@example.com',
        },
      };

      const mockMembers = [];

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.listMembers.mockResolvedValue(mockMembers as any);
      mockUserRepository.findById.mockResolvedValue(mockOwner as any);

      const result = await service.getMembers(workspaceId);

      expect(result[0].user?.name).toBe('owneruser');
    });
  });

  describe('addMember', () => {
    it('should add new member with specified role', async () => {
      const workspaceId = 'ws-123';
      const addMemberDto: AddMemberDto = {
        userId: 'user-new',
        role: 'ADMIN',
      };

      const mockMember = {
        id: 'member-new',
        props: {
          id: 'member-new',
          workspaceId: workspaceId,
          userId: 'user-new',
          role: 'ADMIN',
          joinedAt: new Date(),
        },
      };

      mockWorkspaceRepository.addMember.mockResolvedValue(mockMember as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.addMember(workspaceId, addMemberDto);

      expect(mockWorkspaceRepository.addMember).toHaveBeenCalled();
      expect(result).toEqual(mockMember.props);
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            action: 'MEMBER_ADDED',
            payload: expect.objectContaining({
              userId: 'user-new',
              role: 'ADMIN',
            }),
          }),
        }),
      );
    });

    it('should add member with default MEMBER role when not specified', async () => {
      const workspaceId = 'ws-123';
      const addMemberDto: AddMemberDto = {
        userId: 'user-new',
      };

      const mockMember = {
        id: 'member-new',
        props: {
          id: 'member-new',
          workspaceId: workspaceId,
          userId: 'user-new',
          role: 'MEMBER',
          joinedAt: new Date(),
        },
      };

      mockWorkspaceRepository.addMember.mockResolvedValue(mockMember as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.addMember(workspaceId, addMemberDto);

      expect(result.role).toBe('MEMBER');
    });

    it('should be idempotent when adding existing member', async () => {
      const workspaceId = 'ws-123';
      const addMemberDto: AddMemberDto = {
        userId: 'user-existing',
        role: 'ADMIN',
      };

      const existingMember = {
        id: 'member-existing',
        props: {
          id: 'member-existing',
          workspaceId: workspaceId,
          userId: 'user-existing',
          role: 'MEMBER',
          joinedAt: new Date(),
        },
      };

      // The use case returns the existing member if already a member
      mockWorkspaceRepository.addMember.mockResolvedValue(
        existingMember as any,
      );
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.addMember(workspaceId, addMemberDto);

      // Should return the existing member even though we tried to add as ADMIN
      expect(result.role).toBe('MEMBER'); // Original role preserved
      expect(result.userId).toBe('user-existing');
    });
  });

  describe('removeMember', () => {
    it('should remove member from workspace', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-remove';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: 'user-owner',
        },
      };

      const mockMember = {
        id: 'member-remove',
        props: {
          id: 'member-remove',
          workspaceId: workspaceId,
          userId: userId,
          role: 'MEMBER',
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.findMember.mockResolvedValue(mockMember as any);
      mockWorkspaceRepository.removeMember.mockResolvedValue(undefined);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.removeMember(workspaceId, userId);

      expect(mockWorkspaceRepository.removeMember).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );
      expect(result).toEqual({ success: true });
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
    });

    it('should prevent removing owner', async () => {
      const workspaceId = 'ws-123';
      const ownerId = 'user-owner';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: ownerId,
        },
      };

      const mockOwnerMember = {
        id: 'member-owner',
        props: {
          id: 'member-owner',
          workspaceId: workspaceId,
          userId: ownerId,
          role: 'OWNER',
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockWorkspaceRepository.findMember.mockResolvedValue(
        mockOwnerMember as any,
      );

      // The use case will throw an error
      mockWorkspaceRepository.removeMember.mockImplementation(() => {
        throw new Error('Cannot remove the owner from the workspace');
      });

      await expect(service.removeMember(workspaceId, ownerId)).rejects.toThrow(
        'Cannot remove the owner from the workspace',
      );
    });
  });

  // ============ INVITATIONS TESTS ============

  describe('inviteMember', () => {
    it('should create invitation with hashed token', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-inviter';
      const email = 'invitee@example.com';
      const role = 'ADMIN';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
          ownerId: userId,
        },
      };

      const mockInvitation = {
        id: 'inv-123',
        props: {
          id: 'inv-123',
          workspaceId: workspaceId,
          email: email,
          tokenHash: 'hashed-token',
          role: role,
          invitedById: userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          createdAt: new Date(),
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockHashService.hash.mockResolvedValue('hashed-token');
      mockInvitationRepository.create.mockResolvedValue(mockInvitation as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.inviteMember(
        workspaceId,
        userId,
        email,
        role as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Invitation created');
      expect(result.invitationId).toBe('inv-123');
      expect(result.devToken).toBeDefined();
      expect(mockHashService.hash).toHaveBeenCalled();
      expect(mockAuditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when workspace not found', async () => {
      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(
        service.inviteMember(
          'ws-nonexistent',
          'user-123',
          'email@test.com',
          'MEMBER',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create invitation with MEMBER role as default', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-inviter';
      const email = 'invitee@example.com';

      const mockWorkspace = {
        id: workspaceId,
        props: {
          id: workspaceId,
          name: 'Test Workspace',
        },
      };

      const mockInvitation = {
        id: 'inv-123',
        props: {
          id: 'inv-123',
          workspaceId: workspaceId,
          email: email,
          role: 'MEMBER',
          invitedById: userId,
        },
      };

      mockWorkspaceRepository.findById.mockResolvedValue(mockWorkspace as any);
      mockHashService.hash.mockResolvedValue('hashed-token');
      mockInvitationRepository.create.mockResolvedValue(mockInvitation as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.inviteMember(
        workspaceId,
        userId,
        email,
        'MEMBER',
      );

      expect(result.success).toBe(true);
    });
  });

  describe('acceptInvitation', () => {
    it('should add user as member when accepting valid invitation', async () => {
      const token = 'valid-token';
      const userId = 'user-accepter';
      const workspaceId = 'ws-123';
      const role = 'ADMIN';

      const mockInvitation = {
        id: 'inv-123',
        props: {
          id: 'inv-123',
          workspaceId: workspaceId,
          email: 'invitee@example.com',
          tokenHash: 'hashed-token',
          role: role,
          invitedById: 'user-inviter',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          createdAt: new Date(),
        },
        isExpired: jest.fn().mockReturnValue(false),
        accept: jest.fn().mockReturnThis(),
      };

      const mockMember = {
        id: 'member-new',
        props: {
          id: 'member-new',
          workspaceId: workspaceId,
          userId: userId,
          role: role,
          joinedAt: new Date(),
        },
      };

      mockInvitationRepository.findPendingInvitations.mockResolvedValue([
        mockInvitation as any,
      ]);
      mockHashService.compare.mockResolvedValue(true);
      mockWorkspaceRepository.findMember.mockResolvedValue(null);
      mockWorkspaceRepository.addMember.mockResolvedValue(mockMember as any);
      mockInvitationRepository.update.mockResolvedValue(mockInvitation as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.acceptInvitation(token, userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Invitation accepted');
      expect(mockWorkspaceRepository.addMember).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            workspaceId: workspaceId,
            userId: userId,
            role: role,
          }),
        }),
      );
      expect(mockInvitationRepository.update).toHaveBeenCalled();
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            action: 'INVITATION_ACCEPTED',
            actorId: userId,
            workspaceId: workspaceId,
          }),
        }),
      );
    });

    it('should throw NotFoundException for invalid token', async () => {
      const token = 'invalid-token';
      const userId = 'user-123';

      mockInvitationRepository.findPendingInvitations.mockResolvedValue([]);
      mockHashService.compare.mockResolvedValue(false);

      await expect(service.acceptInvitation(token, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.acceptInvitation(token, userId)).rejects.toThrow(
        'Invalid invitation token',
      );
    });

    it('should throw NotFoundException when no invitations match token', async () => {
      const token = 'non-matching-token';
      const userId = 'user-123';

      const mockInvitations = [
        {
          props: { tokenHash: 'hash1' },
          isExpired: jest.fn().mockReturnValue(false),
        },
        {
          props: { tokenHash: 'hash2' },
          isExpired: jest.fn().mockReturnValue(false),
        },
      ];

      mockInvitationRepository.findPendingInvitations.mockResolvedValue(
        mockInvitations as any,
      );
      mockHashService.compare.mockResolvedValue(false);

      await expect(service.acceptInvitation(token, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should be idempotent when accepting twice', async () => {
      const token = 'valid-token';
      const userId = 'user-accepter';
      const workspaceId = 'ws-123';

      const mockInvitation = {
        id: 'inv-123',
        props: {
          id: 'inv-123',
          workspaceId: workspaceId,
          email: 'invitee@example.com',
          tokenHash: 'hashed-token',
          role: 'MEMBER',
          invitedById: 'user-inviter',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
        },
        isExpired: jest.fn().mockReturnValue(false),
        accept: jest.fn().mockReturnThis(),
      };

      const existingMember = {
        id: 'member-existing',
        props: {
          id: 'member-existing',
          workspaceId: workspaceId,
          userId: userId,
          role: 'MEMBER',
          joinedAt: new Date(),
        },
      };

      mockInvitationRepository.findPendingInvitations.mockResolvedValue([
        mockInvitation as any,
      ]);
      mockHashService.compare.mockResolvedValue(true);
      mockWorkspaceRepository.findMember.mockResolvedValue(
        existingMember as any,
      );
      mockInvitationRepository.update.mockResolvedValue(mockInvitation as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.acceptInvitation(token, userId);

      expect(result.success).toBe(true);
      // Should not try to add member again
      expect(mockWorkspaceRepository.addMember).not.toHaveBeenCalled();
      // But should still mark invitation as accepted
      expect(mockInvitationRepository.update).toHaveBeenCalled();
    });

    it('should compare token hash against all pending invitations', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const workspaceId = 'ws-123';

      const mockInvitation1 = {
        props: {
          tokenHash: 'hash1',
          workspaceId: 'ws-999',
          role: 'MEMBER',
          invitedById: 'inviter',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        isExpired: jest.fn().mockReturnValue(false),
        accept: jest.fn().mockReturnThis(),
      };
      const mockInvitation2 = {
        id: 'inv-123',
        props: {
          tokenHash: 'hash2',
          workspaceId: workspaceId,
          role: 'MEMBER',
          invitedById: 'inviter',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        isExpired: jest.fn().mockReturnValue(false),
        accept: jest.fn().mockReturnThis(),
      };

      mockInvitationRepository.findPendingInvitations.mockResolvedValue([
        mockInvitation1 as any,
        mockInvitation2 as any,
      ]);
      mockHashService.compare
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockWorkspaceRepository.findMember.mockResolvedValue(null);
      mockWorkspaceRepository.addMember.mockResolvedValue({} as any);
      mockInvitationRepository.update.mockResolvedValue({} as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.acceptInvitation(token, userId);

      expect(result.success).toBe(true);
      expect(mockHashService.compare).toHaveBeenCalled();
    });
  });

  describe('getInvitations', () => {
    it('should return all invitations for workspace', async () => {
      const workspaceId = 'ws-123';

      const mockInvitations = [
        {
          id: 'inv-1',
          props: {
            id: 'inv-1',
            workspaceId: workspaceId,
            email: 'user1@example.com',
            role: 'ADMIN',
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        {
          id: 'inv-2',
          props: {
            id: 'inv-2',
            workspaceId: workspaceId,
            email: 'user2@example.com',
            role: 'MEMBER',
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      ];

      mockInvitationRepository.findByWorkspaceId.mockResolvedValue(
        mockInvitations as any,
      );

      const result = await service.getInvitations(workspaceId);

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });

    it('should return empty array when no invitations exist', async () => {
      const workspaceId = 'ws-123';

      mockInvitationRepository.findByWorkspaceId.mockResolvedValue([]);

      const result = await service.getInvitations(workspaceId);

      expect(result).toEqual([]);
    });
  });

  // ============ SETTINGS TESTS ============

  describe('getSettings', () => {
    it('should return workspace settings', async () => {
      const workspaceId = 'ws-123';

      const mockSettings = {
        id: 'settings-123',
        props: {
          id: 'settings-123',
          workspaceId: workspaceId,
          defaultView: 'KANBAN',
          defaultDueTime: 9,
          timezone: 'America/New_York',
          locale: 'en',
        },
      };

      mockSettingsRepository.findByWorkspaceId.mockResolvedValue(
        mockSettings as any,
      );

      const result = await service.getSettings(workspaceId);

      expect(result).toEqual(mockSettings.props);
    });

    it('should return null when settings not found', async () => {
      const workspaceId = 'ws-123';

      mockSettingsRepository.findByWorkspaceId.mockResolvedValue(null);

      const result = await service.getSettings(workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should update workspace settings', async () => {
      const workspaceId = 'ws-123';

      const mockSettings = {
        id: 'settings-123',
        props: {
          id: 'settings-123',
          workspaceId: workspaceId,
          defaultView: 'CALENDAR',
          defaultDueTime: 10,
          timezone: 'UTC',
          locale: 'es',
        },
      };

      mockSettingsRepository.upsert.mockResolvedValue(mockSettings as any);
      mockAuditLogRepository.create.mockResolvedValue({} as any);

      const result = await service.updateSettings(workspaceId, {
        defaultView: 'CALENDAR',
        timezone: 'UTC',
      });

      expect(result.defaultView).toBe('CALENDAR');
      expect(mockSettingsRepository.upsert).toHaveBeenCalled();
    });
  });

  // ============ AUDIT LOGS TESTS ============

  describe('getAuditLogs', () => {
    it('should return audit logs with default pagination', async () => {
      const workspaceId = 'ws-123';

      const mockLogs = [
        {
          id: 'log-1',
          props: {
            id: 'log-1',
            workspaceId: workspaceId,
            action: 'WORKSPACE_CREATED',
            actorId: 'user-123',
            payload: { name: 'Test' },
            createdAt: new Date(),
          },
        },
      ];

      mockAuditLogRepository.findByWorkspaceId.mockResolvedValue(mockLogs);
      mockAuditLogRepository.countByWorkspaceId.mockResolvedValue(1);

      const result = await service.getAuditLogs(workspaceId);

      expect(mockAuditLogRepository.findByWorkspaceId).toHaveBeenCalled();
      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should support custom limit and offset', async () => {
      const workspaceId = 'ws-123';

      mockAuditLogRepository.findByWorkspaceId.mockResolvedValue([]);
      mockAuditLogRepository.countByWorkspaceId.mockResolvedValue(100);

      const result = await service.getAuditLogs(workspaceId, 10, 20);

      expect(mockAuditLogRepository.findByWorkspaceId).toHaveBeenCalledWith(
        workspaceId,
        10,
        20,
      );
      expect(result.total).toBe(100);
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log entry', async () => {
      const workspaceId = 'ws-123';
      const action = 'MEMBER_ADDED';
      const actorId = 'user-123';
      const payload = { userId: 'user-456', role: 'MEMBER' };

      const mockLog = {
        id: 'log-1',
        props: {
          id: 'log-1',
          workspaceId: workspaceId,
          action: action,
          actorId: actorId,
          payload: payload,
          createdAt: new Date(),
        },
      };

      mockAuditLogRepository.create.mockResolvedValue(mockLog as any);

      const result = await service.createAuditLog(
        workspaceId,
        action,
        actorId,
        payload,
      );

      expect(result.action).toBe(action);
      expect(result.actorId).toBe(actorId);
      expect(result.payload).toEqual(payload);
    });
  });
});
