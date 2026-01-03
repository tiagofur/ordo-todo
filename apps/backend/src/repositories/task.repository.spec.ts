import { Test, TestingModule } from '@nestjs/testing';
import { PrismaTaskRepository } from './task.repository';
import { PrismaService } from '../database/prisma.service';
import { Task } from '@ordo-todo/core';

describe('PrismaTaskRepository', () => {
  let repository: PrismaTaskRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTaskRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaTaskRepository>(PrismaTaskRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should successfully create a new task', async () => {
      const task = new Task({
        id: 'task-123',
        title: 'Test Task',
        status: 'TODO',
        priority: 'MEDIUM',
        ownerId: 'user-123',
      });

      mockPrismaService.task.upsert.mockResolvedValue({ id: 'task-123' });

      await repository.save(task);

      expect(mockPrismaService.task.upsert).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        create: expect.objectContaining({
          id: 'task-123',
          title: 'Test Task',
          status: 'TODO',
          priority: 'MEDIUM',
        }),
        update: expect.any(Object),
      });
    });

    it('should successfully update an existing task', async () => {
      const task = new Task({
        id: 'task-123',
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        ownerId: 'user-123',
      });

      mockPrismaService.task.upsert.mockResolvedValue({ id: 'task-123' });

      await repository.save(task);

      expect(mockPrismaService.task.upsert).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        create: expect.any(Object),
        update: expect.objectContaining({
          title: 'Updated Task',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
        }),
      });
    });

    it('should handle task with recurrence', async () => {
      const task = new Task({
        id: 'task-123',
        title: 'Recurring Task',
        status: 'TODO',
        priority: 'MEDIUM',
        ownerId: 'user-123',
        recurrence: {
          pattern: 'DAILY',
          interval: 1,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      });

      mockPrismaService.task.upsert.mockResolvedValue({ id: 'task-123' });

      await repository.save(task);

      expect(mockPrismaService.task.upsert).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        create: expect.objectContaining({
          recurrence: {
            create: {
              pattern: 'DAILY',
              interval: 1,
              daysOfWeek: [1, 2, 3, 4, 5],
            },
          },
        }),
        update: expect.any(Object),
      });
    });
  });

  describe('findById', () => {
    it('should successfully find task by ID', async () => {
      const taskId = 'task-123';

      const mockPrismaTask = {
        id: taskId,
        title: 'Test Task',
        status: 'TODO',
        priority: 'MEDIUM',
        isDeleted: false,
        subTasks: [],
        recurrence: null,
        project: null,
        assignee: null,
        owner: {
          id: 'user-123',
          name: 'Test User',
          image: null,
        },
      };

      mockPrismaService.task.findFirst.mockResolvedValue(mockPrismaTask);

      const result = await repository.findById(taskId);

      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, isDeleted: false },
        include: expect.any(Object),
      });
      expect(result).toBeInstanceOf(Task);
      expect(result?.props.title).toBe('Test Task');
    });

    it('should return null when task not found', async () => {
      const taskId = 'nonexistent-task';

      mockPrismaService.task.findFirst.mockResolvedValue(null);

      const result = await repository.findById(taskId);

      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, isDeleted: false },
        include: expect.any(Object),
      });
      expect(result).toBeNull();
    });

    it('should return null when task is deleted', async () => {
      const taskId = 'deleted-task';

      mockPrismaService.task.findFirst.mockResolvedValue(null);

      const result = await repository.findById(taskId);

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('should successfully find tasks by owner', async () => {
      const ownerId = 'user-123';

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: 'TODO',
          priority: 'MEDIUM',
          isDeleted: false,
          subTasks: [],
          recurrence: null,
          project: null,
          assignee: null,
          owner: { id: ownerId, name: 'User', image: null },
          tags: [],
        },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          isDeleted: false,
          subTasks: [],
          recurrence: null,
          project: null,
          assignee: null,
          owner: { id: ownerId, name: 'User', image: null },
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findByOwnerId(ownerId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { ownerId, isDeleted: false },
        include: expect.any(Object),
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Task);
    });

    it('should filter by projectId when provided', async () => {
      const ownerId = 'user-123';
      const projectId = 'project-123';

      mockPrismaService.task.findMany.mockResolvedValue([]);

      await repository.findByOwnerId(ownerId, { projectId });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          ownerId,
          projectId,
        }),
        include: expect.any(Object),
      });
    });

    it('should filter by tags when provided', async () => {
      const ownerId = 'user-123';
      const tags = ['tag-1', 'tag-2'];

      mockPrismaService.task.findMany.mockResolvedValue([]);

      await repository.findByOwnerId(ownerId, { tags });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          tags: {
            some: {
              tagId: {
                in: tags,
              },
            },
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findByWorkspaceMemberships', () => {
    it('should successfully find tasks from workspace memberships', async () => {
      const userId = 'user-123';

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: 'TODO',
          priority: 'MEDIUM',
          isDeleted: false,
          subTasks: [],
          recurrence: null,
          project: {
            id: 'project-1',
            name: 'Project 1',
            color: '#ff0000',
            workspace: { id: 'ws-1', name: 'Workspace' },
          },
          assignee: null,
          owner: { id: userId, name: 'User', image: null },
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findByWorkspaceMemberships(userId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          OR: [
            { ownerId: userId },
            { assigneeId: userId },
            {
              project: {
                workspace: {
                  members: {
                    some: {
                      userId,
                      workspace: {
                        isDeleted: false,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        include: expect.any(Object),
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should successfully update a task', async () => {
      const task = new Task({
        id: 'task-123',
        title: 'Updated Task',
        status: 'COMPLETED',
        priority: 'HIGH',
        ownerId: 'user-123',
      });

      mockPrismaService.task.update.mockResolvedValue({ id: 'task-123' });

      await repository.update(task);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: expect.objectContaining({
          title: 'Updated Task',
          status: 'COMPLETED',
          priority: 'HIGH',
        }),
      });
    });

    it('should handle assigneeId update', async () => {
      const task = new Task({
        id: 'task-123',
        title: 'Task',
        status: 'TODO',
        priority: 'MEDIUM',
        ownerId: 'user-123',
        assigneeId: 'assignee-123',
      });

      mockPrismaService.task.update.mockResolvedValue({ id: 'task-123' });

      await repository.update(task);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: expect.objectContaining({
          assigneeId: 'assignee-123',
        }),
      });
    });
  });

  describe('delete', () => {
    it('should successfully delete a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.task.delete.mockResolvedValue({ id: taskId });

      await repository.delete(taskId);

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });

  describe('softDelete', () => {
    it('should successfully soft delete a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.task.update.mockResolvedValue({ id: taskId });

      await repository.softDelete(taskId);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  describe('restore', () => {
    it('should successfully restore a deleted task', async () => {
      const taskId = 'task-123';

      mockPrismaService.task.update.mockResolvedValue({ id: taskId });

      await repository.restore(taskId);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
    });
  });

  describe('permanentDelete', () => {
    it('should successfully permanently delete a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.task.delete.mockResolvedValue({ id: taskId });

      await repository.permanentDelete(taskId);

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });

  describe('findDeleted', () => {
    it('should successfully find deleted tasks for project', async () => {
      const projectId = 'project-123';

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Deleted Task 1',
          status: 'TODO',
          priority: 'MEDIUM',
          isDeleted: true,
          deletedAt: new Date(),
          subTasks: [],
          recurrence: null,
          project: { id: projectId, name: 'Project', color: '#ff0000' },
          assignee: null,
          owner: { id: 'user-123', name: 'User', image: null },
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findDeleted(projectId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId,
          isDeleted: true,
        },
        include: expect.any(Object),
      });
      expect(result).toHaveLength(1);
      expect(result[0].props.isDeleted).toBe(true);
    });
  });

  describe('findTodayTasks', () => {
    it('should successfully find today tasks', async () => {
      const userId = 'user-123';
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Today Task',
          status: 'TODO',
          priority: 'HIGH',
          isDeleted: false,
          parentTaskId: null,
          subTasks: [],
          recurrence: null,
          project: { id: 'project-1', name: 'Project', color: '#ff0000' },
          assignee: null,
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findTodayTasks(userId, today, tomorrow);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          status: { not: 'COMPLETED' },
          parentTaskId: null,
          isDeleted: false,
        },
        include: expect.any(Object),
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findScheduledTasks', () => {
    it('should successfully find scheduled tasks', async () => {
      const userId = 'user-123';
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Scheduled Task',
          status: 'TODO',
          priority: 'HIGH',
          isDeleted: false,
          scheduledDate: startOfDay,
          subTasks: [],
          recurrence: null,
          project: { id: 'project-1', name: 'Project', color: '#ff0000' },
          assignee: null,
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findScheduledTasks(
        userId,
        startOfDay,
        endOfDay,
      );

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          isDeleted: false,
        },
        include: expect.any(Object),
        orderBy: [{ scheduledTime: 'asc' }, { priority: 'desc' }],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findAvailableTasks', () => {
    it('should successfully find available tasks', async () => {
      const userId = 'user-123';
      const today = new Date();

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Available Task',
          status: 'TODO',
          priority: 'MEDIUM',
          isDeleted: false,
          isTimeBlocked: false,
          startDate: null,
          parentTaskId: null,
          subTasks: [],
          recurrence: null,
          project: { id: 'project-1', name: 'Project', color: '#ff0000' },
          assignee: null,
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findAvailableTasks(userId, today);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          status: { not: 'COMPLETED' },
          parentTaskId: null,
          isTimeBlocked: { not: true },
          isDeleted: false,
          OR: [{ startDate: null }, { startDate: { lte: today } }],
        },
        include: expect.any(Object),
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by projectId when provided', async () => {
      const userId = 'user-123';
      const today = new Date();
      const projectId = 'project-123';

      mockPrismaService.task.findMany.mockResolvedValue([]);

      await repository.findAvailableTasks(userId, today, projectId);

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          projectId,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findTimeBlockedTasks', () => {
    it('should successfully find time-blocked tasks', async () => {
      const userId = 'user-123';
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const mockPrismaTasks = [
        {
          id: 'task-1',
          title: 'Time Blocked Task',
          status: 'TODO',
          priority: 'HIGH',
          isDeleted: false,
          isTimeBlocked: true,
          scheduledDate: startDate,
          scheduledTime: '10:00',
          subTasks: [],
          recurrence: null,
          project: { id: 'project-1', name: 'Project', color: '#ff0000' },
          assignee: null,
          tags: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockPrismaTasks);

      const result = await repository.findTimeBlockedTasks(
        userId,
        startDate,
        endDate,
      );

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          isTimeBlocked: true,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
          scheduledTime: { not: null },
          isDeleted: false,
        },
        include: expect.any(Object),
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('groupByStatus', () => {
    it('should successfully group tasks by status', async () => {
      const userId = 'user-123';

      const mockGrouped = [
        { status: 'TODO', _count: { id: 5 } },
        { status: 'IN_PROGRESS', _count: { id: 3 } },
        { status: 'COMPLETED', _count: { id: 10 } },
      ];

      mockPrismaService.task.groupBy.mockResolvedValue(mockGrouped);

      const result = await repository.groupByStatus(userId);

      expect(mockPrismaService.task.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          assigneeId: userId,
        },
        _count: { id: true },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ status: 'TODO', count: 5 });
      expect(result[1]).toEqual({ status: 'IN_PROGRESS', count: 3 });
      expect(result[2]).toEqual({ status: 'COMPLETED', count: 10 });
    });
  });

  describe('mapping functions', () => {
    it('should correctly map status from Prisma to Domain', async () => {
      const mockPrismaTask = {
        id: 'task-123',
        title: 'Test',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        isDeleted: false,
        subTasks: [],
        recurrence: null,
        project: null,
        assignee: null,
        owner: { id: 'user-123', name: 'User', image: null },
      };

      mockPrismaService.task.findFirst.mockResolvedValue(mockPrismaTask);

      const result = await repository.findById('task-123');

      expect(result?.props.status).toBe('COMPLETED');
    });

    it('should correctly map priority from Prisma to Domain', async () => {
      const mockPrismaTask = {
        id: 'task-123',
        title: 'Test',
        status: 'TODO',
        priority: 'URGENT',
        isDeleted: false,
        subTasks: [],
        recurrence: null,
        project: null,
        assignee: null,
        owner: { id: 'user-123', name: 'User', image: null },
      };

      mockPrismaService.task.findFirst.mockResolvedValue(mockPrismaTask);

      const result = await repository.findById('task-123');

      expect(result?.props.priority).toBe('URGENT');
    });
  });
});
