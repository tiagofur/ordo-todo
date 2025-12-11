import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let workspacesService: jest.Mocked<WorkspacesService>;

  const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

  beforeEach(async () => {
    const mockWorkspacesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getMembers: jest.fn(),
      addMember: jest.fn(),
      updateMember: jest.fn(),
      removeMember: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        { provide: WorkspacesService, useValue: mockWorkspacesService },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    workspacesService = module.get<WorkspacesService>(
      WorkspacesService,
    ) as jest.Mocked<WorkspacesService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new workspace', async () => {
      const createDto = {
        name: 'New Workspace',
        description: 'Test workspace',
      };
      const mockWorkspace = {
        id: 'ws-123',
        ...createDto,
        ownerId: mockUser.id,
      };
      workspacesService.create.mockResolvedValue(mockWorkspace as any);

      const result = await controller.create(createDto, mockUser);

      expect(workspacesService.create).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('findAll', () => {
    it('should return all workspaces for user', async () => {
      const mockWorkspaces = [
        { id: 'ws-1', name: 'Workspace 1' },
        { id: 'ws-2', name: 'Workspace 2' },
      ];
      workspacesService.findAll.mockResolvedValue(mockWorkspaces as any);

      const result = await controller.findAll(mockUser);

      expect(workspacesService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockWorkspaces);
    });
  });

  describe('findOne', () => {
    it('should return workspace by id', async () => {
      const mockWorkspace = { id: 'ws-123', name: 'Test Workspace' };
      workspacesService.findById.mockResolvedValue(mockWorkspace as any);

      const result = await controller.findOne('ws-123', mockUser);

      expect(workspacesService.findById).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
      );
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('update', () => {
    it('should update workspace', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedWorkspace = { id: 'ws-123', name: 'Updated Name' };
      workspacesService.update.mockResolvedValue(updatedWorkspace as any);

      const result = await controller.update('ws-123', updateDto, mockUser);

      expect(workspacesService.update).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        updateDto,
      );
      expect(result).toEqual(updatedWorkspace);
    });
  });

  describe('remove', () => {
    it('should delete workspace', async () => {
      workspacesService.delete.mockResolvedValue(undefined);

      await controller.remove('ws-123', mockUser);

      expect(workspacesService.delete).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
      );
    });
  });

  describe('getMembers', () => {
    it('should return workspace members', async () => {
      const mockMembers = [
        { userId: 'user-1', role: 'OWNER', user: { name: 'Owner' } },
        { userId: 'user-2', role: 'MEMBER', user: { name: 'Member' } },
      ];
      workspacesService.getMembers.mockResolvedValue(mockMembers as any);

      const result = await controller.getMembers('ws-123', mockUser);

      expect(workspacesService.getMembers).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
      );
      expect(result).toEqual(mockMembers);
    });
  });

  describe('addMember', () => {
    it('should add member to workspace', async () => {
      const addMemberDto = { email: 'new@example.com', role: 'MEMBER' };
      const mockResult = { userId: 'user-new', role: 'MEMBER' };
      workspacesService.addMember.mockResolvedValue(mockResult as any);

      const result = await controller.addMember(
        'ws-123',
        addMemberDto,
        mockUser,
      );

      expect(workspacesService.addMember).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        addMemberDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateMember', () => {
    it('should update member role', async () => {
      const updateDto = { role: 'ADMIN' };
      const updatedMember = { userId: 'user-456', role: 'ADMIN' };
      workspacesService.updateMember.mockResolvedValue(updatedMember as any);

      const result = await controller.updateMember(
        'ws-123',
        'user-456',
        updateDto,
        mockUser,
      );

      expect(workspacesService.updateMember).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        'user-456',
        updateDto,
      );
      expect(result).toEqual(updatedMember);
    });
  });

  describe('removeMember', () => {
    it('should remove member from workspace', async () => {
      workspacesService.removeMember.mockResolvedValue(undefined);

      await controller.removeMember('ws-123', 'user-456', mockUser);

      expect(workspacesService.removeMember).toHaveBeenCalledWith(
        'ws-123',
        mockUser.id,
        'user-456',
      );
    });
  });
});
