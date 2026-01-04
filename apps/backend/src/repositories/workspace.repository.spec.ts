import { Test, TestingModule } from '@nestjs/testing';
import { PrismaWorkspaceRepository } from './workspace.repository';
import { PrismaService } from '../database/prisma.service';
import { Workspace, WorkspaceMember } from '@ordo-todo/core';

describe('PrismaWorkspaceRepository', () => {
  let repository: PrismaWorkspaceRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    workspace: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaWorkspaceRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaWorkspaceRepository>(
      PrismaWorkspaceRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a workspace with owner', async () => {
      const workspace = new Workspace({
        id: 'ws-123',
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#ff0000',
        ownerId: 'user-123',
      });

      const mockCreatedWorkspace = {
        id: 'ws-123',
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#ff0000',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          workspace: {
            create: jest.fn().mockResolvedValue(mockCreatedWorkspace),
          },
          workspaceMember: {
            create: jest.fn().mockResolvedValue({ id: 'member-123' }),
          },
        });
      });

      const result = await repository.create(workspace);

      expect(result).toBeInstanceOf(Workspace);
      expect(result?.props.name).toBe('My Workspace');
      expect(result?.props.ownerId).toBe('user-123');
    });

    it('should successfully create a workspace without owner', async () => {
      const workspace = new Workspace({
        id: 'ws-123',
        name: 'Team Workspace',
        slug: 'team-workspace',
        type: 'TEAM',
        tier: 'PRO',
        color: '#00ff00',
      });

      const mockCreatedWorkspace = {
        id: 'ws-123',
        name: 'Team Workspace',
        slug: 'team-workspace',
        type: 'TEAM',
        tier: 'PRO',
        color: '#00ff00',
        ownerId: null,
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          workspace: {
            create: jest.fn().mockResolvedValue(mockCreatedWorkspace),
          },
          workspaceMember: {
            create: jest.fn(),
          },
        });
      });

      const result = await repository.create(workspace);

      expect(result).toBeInstanceOf(Workspace);
      expect(result?.props.name).toBe('Team Workspace');
    });
  });

  describe('findById', () => {
    it('should successfully find workspace by ID', async () => {
      const workspaceId = 'ws-123';

      const mockWorkspace = {
        id: workspaceId,
        name: 'My Workspace',
        slug: 'my-workspace',
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#ff0000',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.workspace.findFirst.mockResolvedValue(mockWorkspace);

      const result = await repository.findById(workspaceId);

      expect(mockPrismaService.workspace.findFirst).toHaveBeenCalledWith({
        where: { id: workspaceId, isDeleted: false },
      });
      expect(result).toBeInstanceOf(Workspace);
      expect(result?.id).toBe(workspaceId);
    });

    it('should return null when workspace not found', async () => {
      const workspaceId = 'nonexistent-ws';

      mockPrismaService.workspace.findFirst.mockResolvedValue(null);

      const result = await repository.findById(workspaceId);

      expect(mockPrismaService.workspace.findFirst).toHaveBeenCalledWith({
        where: { id: workspaceId, isDeleted: false },
      });
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should successfully find workspace by slug', async () => {
      const slug = 'my-workspace';

      const mockWorkspace = {
        id: 'ws-123',
        name: 'My Workspace',
        slug: slug,
        type: 'PERSONAL',
        tier: 'FREE',
        color: '#ff0000',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          projects: 5,
          members: 3,
        },
        projects: [],
      };

      mockPrismaService.workspace.findFirst.mockResolvedValue(mockWorkspace);

      const result = await repository.findBySlug(slug);

      expect(mockPrismaService.workspace.findFirst).toHaveBeenCalledWith({
        where: { slug, isDeleted: false },
        include: expect.any(Object),
      });
      expect(result).toBeInstanceOf(Workspace);
      expect(result?.props.slug).toBe(slug);
    });

    it('should return null when workspace not found by slug', async () => {
      const slug = 'nonexistent-workspace';

      mockPrismaService.workspace.findFirst.mockResolvedValue(null);

      const result = await repository.findBySlug(slug);

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('should successfully find workspaces by owner', async () => {
      const ownerId = 'user-123';

      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          type: 'PERSONAL',
          tier: 'FREE',
          color: '#ff0000',
          ownerId: ownerId,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ws-2',
          name: 'Workspace 2',
          slug: 'workspace-2',
          type: 'WORK',
          tier: 'PRO',
          color: '#00ff00',
          ownerId: ownerId,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.workspace.findMany.mockResolvedValue(mockWorkspaces);

      const result = await repository.findByOwnerId(ownerId);

      expect(mockPrismaService.workspace.findMany).toHaveBeenCalledWith({
        where: { ownerId, isDeleted: false },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Workspace);
      expect(result[0].props.ownerId).toBe(ownerId);
    });
  });

  describe('findByUserId', () => {
    it('should successfully find workspaces by user membership', async () => {
      const userId = 'user-123';

      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          type: 'TEAM',
          tier: 'PRO',
          ownerId: 'other-user',
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.workspace.findMany.mockResolvedValue(mockWorkspaces);

      const result = await repository.findByUserId(userId);

      expect(mockPrismaService.workspace.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should successfully update a workspace', async () => {
      const workspace = new Workspace({
        id: 'ws-123',
        name: 'Updated Workspace',
        slug: 'updated-workspace',
        type: 'WORK',
        tier: 'PRO',
        color: '#0000ff',
        ownerId: 'user-123',
      });

      const mockUpdatedWorkspace = {
        id: 'ws-123',
        name: 'Updated Workspace',
        slug: 'updated-workspace',
        type: 'WORK',
        tier: 'PRO',
        color: '#0000ff',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.workspace.update.mockResolvedValue(
        mockUpdatedWorkspace,
      );

      const result = await repository.update(workspace);

      expect(mockPrismaService.workspace.update).toHaveBeenCalledWith({
        where: { id: 'ws-123' },
        data: expect.objectContaining({
          name: 'Updated Workspace',
          color: '#0000ff',
        }),
      });
      expect(result).toBeInstanceOf(Workspace);
      expect(result?.props.name).toBe('Updated Workspace');
    });
  });

  describe('delete', () => {
    it('should successfully delete a workspace', async () => {
      const workspaceId = 'ws-123';

      mockPrismaService.workspace.delete.mockResolvedValue({ id: workspaceId });

      await repository.delete(workspaceId);

      expect(mockPrismaService.workspace.delete).toHaveBeenCalledWith({
        where: { id: workspaceId },
      });
    });
  });

  describe('softDelete', () => {
    it('should successfully soft delete a workspace', async () => {
      const workspaceId = 'ws-123';

      mockPrismaService.workspace.update.mockResolvedValue({ id: workspaceId });

      await repository.softDelete(workspaceId);

      expect(mockPrismaService.workspace.update).toHaveBeenCalledWith({
        where: { id: workspaceId },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  describe('restore', () => {
    it('should successfully restore a deleted workspace', async () => {
      const workspaceId = 'ws-123';

      mockPrismaService.workspace.update.mockResolvedValue({ id: workspaceId });

      await repository.restore(workspaceId);

      expect(mockPrismaService.workspace.update).toHaveBeenCalledWith({
        where: { id: workspaceId },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
    });
  });

  describe('permanentDelete', () => {
    it('should successfully permanently delete a workspace', async () => {
      const workspaceId = 'ws-123';

      mockPrismaService.workspace.delete.mockResolvedValue({ id: workspaceId });

      await repository.permanentDelete(workspaceId);

      expect(mockPrismaService.workspace.delete).toHaveBeenCalledWith({
        where: { id: workspaceId },
      });
    });
  });

  describe('addMember', () => {
    it('should successfully add a member to workspace', async () => {
      const member = new WorkspaceMember({
        id: 'member-123',
        workspaceId: 'ws-123',
        userId: 'user-123',
        role: 'ADMIN',
        joinedAt: new Date(),
      });

      const mockMember = {
        id: 'member-123',
        workspaceId: 'ws-123',
        userId: 'user-123',
        role: 'ADMIN',
        joinedAt: new Date(),
      };

      mockPrismaService.workspaceMember.create.mockResolvedValue(mockMember);

      const result = await repository.addMember(member);

      expect(mockPrismaService.workspaceMember.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws-123',
          userId: 'user-123',
          role: 'ADMIN',
        },
      });
      expect(result).toBeInstanceOf(WorkspaceMember);
      expect(result?.props.role).toBe('ADMIN');
    });
  });

  describe('removeMember', () => {
    it('should successfully remove a member from workspace', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-123';

      mockPrismaService.workspaceMember.delete.mockResolvedValue({
        id: 'member-123',
      });

      await repository.removeMember(workspaceId, userId);

      expect(mockPrismaService.workspaceMember.delete).toHaveBeenCalledWith({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: userId,
          },
        },
      });
    });
  });

  describe('findMember', () => {
    it('should successfully find a member', async () => {
      const workspaceId = 'ws-123';
      const userId = 'user-123';

      const mockMember = {
        id: 'member-123',
        workspaceId: workspaceId,
        userId: userId,
        role: 'MEMBER',
        joinedAt: new Date(),
      };

      mockPrismaService.workspaceMember.findFirst.mockResolvedValue(mockMember);

      const result = await repository.findMember(workspaceId, userId);

      expect(mockPrismaService.workspaceMember.findFirst).toHaveBeenCalledWith({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: userId,
          },
        },
      });
      expect(result).toBeInstanceOf(WorkspaceMember);
    });

    it('should return null when member not found', async () => {
      const workspaceId = 'ws-123';
      const userId = 'nonexistent-user';

      mockPrismaService.workspaceMember.findFirst.mockResolvedValue(null);

      const result = await repository.findMember(workspaceId, userId);

      expect(result).toBeNull();
    });
  });

  describe('listMembers', () => {
    it('should successfully list all members of workspace', async () => {
      const workspaceId = 'ws-123';

      const mockMembers = [
        {
          id: 'member-1',
          workspaceId: workspaceId,
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: new Date(),
        },
        {
          id: 'member-2',
          workspaceId: workspaceId,
          userId: 'user-2',
          role: 'ADMIN',
          joinedAt: new Date(),
        },
      ];

      mockPrismaService.workspaceMember.findMany.mockResolvedValue(mockMembers);

      const result = await repository.listMembers(workspaceId);

      expect(mockPrismaService.workspaceMember.findMany).toHaveBeenCalledWith({
        where: { workspaceId: workspaceId },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(WorkspaceMember);
    });
  });

  describe('mapping functions', () => {
    it('should correctly map type from Prisma to Domain', async () => {
      const mockWorkspace = {
        id: 'ws-123',
        name: 'Workspace',
        slug: 'workspace',
        type: 'TEAM',
        tier: 'FREE',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.workspace.findFirst.mockResolvedValue(mockWorkspace);

      const result = await repository.findById('ws-123');

      expect(result?.props.type).toBe('TEAM');
    });

    it('should correctly map tier from Prisma to Domain', async () => {
      const mockWorkspace = {
        id: 'ws-123',
        name: 'Workspace',
        slug: 'workspace',
        type: 'PERSONAL',
        tier: 'ENTERPRISE',
        ownerId: 'user-123',
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.workspace.findFirst.mockResolvedValue(mockWorkspace);

      const result = await repository.findById('ws-123');

      expect(result?.props.tier).toBe('ENTERPRISE');
    });

    it('should correctly map role from Prisma to Domain', async () => {
      const mockMember = {
        id: 'member-123',
        workspaceId: 'ws-123',
        userId: 'user-123',
        role: 'VIEWER',
        joinedAt: new Date(),
      };

      mockPrismaService.workspaceMember.findFirst.mockResolvedValue(mockMember);

      const result = await repository.findMember('ws-123', 'user-123');

      expect(result?.props.role).toBe('VIEWER');
    });
  });
});
