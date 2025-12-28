import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import { CreateTaskUseCase, UpdateDailyMetricsUseCase } from '@ordo-todo/core';

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskRepository = {
    findByOwnerId: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockAnalyticsRepository = {
    findByDate: jest.fn(),
    save: jest.fn(),
  };

  const mockPrismaService = {
    task: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockActivitiesService = {
    logTaskCreated: jest.fn(),
    logTaskCompleted: jest.fn(),
    logSubtaskCompleted: jest.fn(),
    logTaskUpdated: jest.fn(),
    logStatusChanged: jest.fn(),
    logPriorityChanged: jest.fn(),
    logDueDateChanged: jest.fn(),
    logSubtaskAdded: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
    sendToUser: jest.fn(),
    sendBulk: jest.fn(),
  };

  const mockGamificationService = {
    onTaskCompleted: jest.fn(),
    onSubtaskCompleted: jest.fn(),
    getProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: 'TaskRepository',
          useValue: mockTaskRepository,
        },
        {
          provide: 'AnalyticsRepository',
          useValue: mockAnalyticsRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    activitiesService = module.get<ActivitiesService>(ActivitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tasks for a user', async () => {
      const userId = 'user-123';
      const mockTasks = [
        {
          props: {
            id: 'task-1',
            title: 'Task 1',
            ownerId: userId,
            parentTaskId: null,
          },
        },
        {
          props: {
            id: 'task-2',
            title: 'Task 2',
            ownerId: userId,
            parentTaskId: null,
          },
        },
      ];

      mockTaskRepository.findByOwnerId.mockResolvedValue(mockTasks);

      const result = await service.findAll(userId);

      expect(mockTaskRepository.findByOwnerId).toHaveBeenCalledWith(userId, {
        projectId: undefined,
        tags: undefined,
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task-1');
    });

    it('should filter out subtasks', async () => {
      const userId = 'user-123';
      const mockTasks = [
        {
          props: {
            id: 'task-1',
            title: 'Task 1',
            ownerId: userId,
            parentTaskId: null,
          },
        },
        {
          props: {
            id: 'subtask-1',
            title: 'Subtask 1',
            ownerId: userId,
            parentTaskId: 'task-1',
          },
        },
      ];

      mockTaskRepository.findByOwnerId.mockResolvedValue(mockTasks);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
    });

    it('should filter by projectId when provided', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      mockTaskRepository.findByOwnerId.mockResolvedValue([]);

      await service.findAll(userId, projectId);

      expect(mockTaskRepository.findByOwnerId).toHaveBeenCalledWith(userId, {
        projectId,
        tags: undefined,
      });
    });

    it('should filter by tags when provided', async () => {
      const userId = 'user-123';
      const tags = ['urgent', 'bug'];

      mockTaskRepository.findByOwnerId.mockResolvedValue([]);

      await service.findAll(userId, undefined, tags);

      expect(mockTaskRepository.findByOwnerId).toHaveBeenCalledWith(userId, {
        projectId: undefined,
        tags,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 'task-123';
      const mockTask = {
        props: {
          id: taskId,
          title: 'Test Task',
          subTasks: [],
        },
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result.id).toBe(taskId);
      expect(result.title).toBe('Test Task');
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent';

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(taskId)).rejects.toThrow('Task not found');
    });

    it('should include subtasks in the response', async () => {
      const taskId = 'task-123';
      const mockTask = {
        props: {
          id: taskId,
          title: 'Test Task',
          subTasks: [
            { props: { id: 'subtask-1', title: 'Subtask 1' } },
            { props: { id: 'subtask-2', title: 'Subtask 2' } },
          ],
        },
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(result.subTasks).toHaveLength(2);
      expect(result.subTasks[0].id).toBe('subtask-1');
    });
  });

  describe('findOneWithDetails', () => {
    it('should return task with all relations', async () => {
      const taskId = 'task-123';
      const mockTaskWithDetails = {
        id: taskId,
        title: 'Test Task',
        subTasks: [],
        comments: [
          {
            id: 'comment-1',
            content: 'Test comment',
            author: { id: 'user-1', name: 'User 1' },
          },
        ],
        attachments: [],
        activities: [],
        tags: [{ tag: { id: 'tag-1', name: 'urgent' } }],
        estimatedMinutes: 60,
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTaskWithDetails);

      const result = await service.findOneWithDetails(taskId);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        include: expect.objectContaining({
          subTasks: true,
          comments: expect.any(Object),
          attachments: expect.any(Object),
          activities: expect.any(Object),
          tags: expect.any(Object),
        }),
      });
      expect(result.id).toBe(taskId);
      expect(result.comments).toHaveLength(1);
      expect(result.tags).toHaveLength(1);
      expect(result.estimatedTime).toBe(60);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent';

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOneWithDetails(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const taskId = 'task-123';

      mockTaskRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(taskId);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(result).toEqual({ success: true });
    });
  });

  describe('create', () => {
    it('should create task with auto-assignee to creator when not specified', async () => {
      const userId = 'user-123';
      const createTaskDto = {
        title: 'New Task',
        projectId: 'project-123',
        description: 'Test task',
        priority: 'HIGH',
        dueDate: new Date(),
      };

      const mockTask = {
        id: 'task-123',
        props: {
          id: 'task-123',
          title: 'New Task',
          ownerId: userId,
          assigneeId: userId, // Should be auto-assigned to creator
          projectId: 'project-123',
          description: 'Test task',
          priority: 'HIGH',
          dueDate: createTaskDto.dueDate,
        },
      };

      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      // Mock the use case execution
      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, userId);

      // Verify CreateTaskUseCase was called with assigneeId set to userId
      expect(executeSpy).toHaveBeenCalledWith({
        ...createTaskDto,
        ownerId: userId,
        assigneeId: userId, // Auto-assigned to creator
      });

      expect(result).toEqual(mockTask.props);
    });

    it('should create task with specified assignee when provided', async () => {
      const userId = 'user-123';
      const assigneeId = 'user-456';
      const createTaskDto = {
        title: 'New Task',
        projectId: 'project-123',
        assigneeId: assigneeId, // Explicit assignee
      };

      const mockTask = {
        id: 'task-123',
        props: {
          id: 'task-123',
          title: 'New Task',
          ownerId: userId,
          assigneeId: assigneeId, // Should use specified assignee
          projectId: 'project-123',
        },
      };

      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);
      mockNotificationsService.create = jest.fn().mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      // Mock the use case execution
      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, userId);

      // Verify CreateTaskUseCase was called with the specified assigneeId
      expect(executeSpy).toHaveBeenCalledWith({
        ...createTaskDto,
        ownerId: userId,
        assigneeId: assigneeId,
      });

      // Verify notification was sent to assignee (different from creator)
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        userId: assigneeId,
        type: 'TASK_ASSIGNED',
        title: 'Task assigned to you',
        message: 'You were assigned to task "New Task"',
        resourceId: 'task-123',
        resourceType: 'TASK',
      });

      expect(result).toEqual(mockTask.props);
    });

    it('should not send notification when assignee is the creator', async () => {
      const userId = 'user-123';
      const createTaskDto = {
        title: 'New Task',
        projectId: 'project-123',
        assigneeId: userId, // Same as creator
      };

      const mockTask = {
        id: 'task-123',
        props: {
          id: 'task-123',
          title: 'New Task',
          ownerId: userId,
          assigneeId: userId,
          projectId: 'project-123',
        },
      };

      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTask);

      await service.create(createTaskDto, userId);

      // Verify notification was NOT sent (assignee == creator)
      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should update daily metrics when creating task', async () => {
      const userId = 'user-123';
      const createTaskDto = {
        title: 'New Task',
        projectId: 'project-123',
      };

      const mockTask = {
        id: 'task-123',
        props: {
          id: 'task-123',
          title: 'New Task',
          ownerId: userId,
          assigneeId: userId,
          projectId: 'project-123',
        },
      };

      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTask);

      await service.create(createTaskDto, userId);

      // Verify UpdateDailyMetricsUseCase was called
      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      expect(updateMetricsSpy).toHaveBeenCalledWith({
        userId,
        date: expect.any(Date),
        tasksCreated: 1,
      });
    });
  });

  describe('createSubtask', () => {
    it('should auto-assign subtask to creator when not specified', async () => {
      const userId = 'user-123';
      const parentTaskId = 'task-parent';
      const createSubtaskDto = {
        title: 'New Subtask',
        projectId: 'project-123',
      };

      const mockParentTask = {
        id: parentTaskId,
        props: {
          id: parentTaskId,
          projectId: 'project-123',
        },
      };

      const mockSubtask = {
        id: 'subtask-123',
        props: {
          id: 'subtask-123',
          title: 'New Subtask',
          ownerId: userId,
          assigneeId: userId, // Auto-assigned
          parentTaskId: parentTaskId,
          projectId: 'project-123',
        },
      };

      mockTaskRepository.findById.mockResolvedValue(mockParentTask);
      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logSubtaskAdded = jest
        .fn()
        .mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);

      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSubtask);

      const result = await service.createSubtask(
        parentTaskId,
        createSubtaskDto,
        userId,
      );

      // Verify CreateTaskUseCase was called with auto-assignee
      expect(executeSpy).toHaveBeenCalledWith({
        ...createSubtaskDto,
        projectId: 'project-123',
        ownerId: userId,
        assigneeId: userId, // Auto-assigned to creator
        parentTaskId: parentTaskId,
      });

      expect(result).toEqual(mockSubtask.props);
    });
  });
});
