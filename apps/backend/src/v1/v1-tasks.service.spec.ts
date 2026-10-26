import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { V1TasksService } from './v1-tasks.service';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../database/prisma.service';

describe('V1TasksService', () => {
  let service: V1TasksService;

  const mockTasksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    task: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        V1TasksService,
        { provide: TasksService, useValue: mockTasksService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<V1TasksService>(V1TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should delegate to TasksService.findAll with the token owner', async () => {
      mockTasksService.findAll.mockResolvedValue([{ id: 'task-1' }]);

      const result = await service.list('user-123', {
        projectId: 'proj-1',
      });

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        'user-123',
        'proj-1',
        undefined,
        undefined,
      );
      expect(result).toEqual([{ id: 'task-1' }]);
    });
  });

  describe('get', () => {
    it('should return the task when the user owns it', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'user-123',
        assigneeId: null,
        project: { workspaceId: 'ws-1' },
      });
      mockTasksService.findOne.mockResolvedValue({ id: 'task-1' });

      const result = await service.get('user-123', 'task-1');

      expect(result).toEqual({ id: 'task-1' });
    });

    it('should allow the assignee even when someone else owns the task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'someone-else',
        assigneeId: 'user-123',
        project: { workspaceId: 'ws-1' },
      });
      mockTasksService.findOne.mockResolvedValue({ id: 'task-1' });

      await expect(service.get('user-123', 'task-1')).resolves.toEqual({
        id: 'task-1',
      });
    });

    it('should allow a workspace member who is neither owner nor assignee', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'someone-else',
        assigneeId: null,
        project: { workspaceId: 'ws-1' },
      });
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        id: 'member-1',
      });
      mockTasksService.findOne.mockResolvedValue({ id: 'task-1' });

      await expect(service.get('user-123', 'task-1')).resolves.toEqual({
        id: 'task-1',
      });
      expect(mockPrismaService.workspaceMember.findUnique).toHaveBeenCalledWith(
        {
          where: {
            workspaceId_userId: { workspaceId: 'ws-1', userId: 'user-123' },
          },
          select: { id: true },
        },
      );
    });

    it('should throw Forbidden for a stranger outside the workspace', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'someone-else',
        assigneeId: null,
        project: { workspaceId: 'ws-1' },
      });
      mockPrismaService.workspaceMember = {
        findUnique: jest.fn().mockResolvedValue(null),
      };

      await expect(service.get('intruder', 'task-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockTasksService.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFound when the task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.get('user-123', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTasksService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create scoped to the token owner', async () => {
      mockTasksService.create.mockImplementation(async (dto: any) => ({
        id: 'task-9',
        ...dto,
      }));

      const result = await service.create('user-123', {
        title: 'Via API',
        projectId: 'proj-1',
      });

      // TasksService.create forces ownerId/assigneeId from userId internally.
      expect(mockTasksService.create).toHaveBeenCalledWith(
        { title: 'Via API', projectId: 'proj-1' },
        'user-123',
      );
      expect(result.id).toBe('task-9');
    });
  });

  describe('update and remove', () => {
    it('should verify access before mutating', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'user-123',
        project: { workspaceId: 'ws-1' },
      });
      mockTasksService.update.mockResolvedValue({ id: 'task-1' });
      mockTasksService.remove.mockResolvedValue({ id: 'task-1' });

      await service.update('user-123', 'task-1', { title: 'x' });
      await service.remove('user-123', 'task-1');

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledTimes(2);
      expect(mockTasksService.update).toHaveBeenCalledWith(
        'task-1',
        { title: 'x' },
        'user-123',
      );
      expect(mockTasksService.remove).toHaveBeenCalledWith('task-1');
    });

    it('should throw Forbidden when the owner differs', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        id: 'task-1',
        ownerId: 'other-user',
        project: { workspaceId: 'ws-1' },
      });

      await expect(
        service.update('user-123', 'task-1', { title: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      await expect(service.remove('user-123', 'task-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
