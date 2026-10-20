import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import {
  CreateTaskUseCase,
  UpdateDailyMetricsUseCase,
  CompleteTaskUseCase,
} from '@ordo-todo/core';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;
  let activitiesService: ActivitiesService;

  const mockTaskRepository = {
    findByWorkspaceMemberships: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    isMember: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    findTodayTasks: jest.fn(),
    findScheduledTasks: jest.fn(),
    findAvailableTasks: jest.fn(),
  };

  const mockAnalyticsRepository = {
    findByDate: jest.fn(),
    save: jest.fn(),
  };

  const mockPrismaService = {
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    recurrence: {
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
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
    awardTaskCompletion: jest.fn().mockResolvedValue(undefined),
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
          provide: 'TaskDependencyRepository',
          useValue: {
            findDependencies: jest.fn().mockResolvedValue([]),
            findDependents: jest.fn().mockResolvedValue([]),
            addDependency: jest.fn(),
            removeDependency: jest.fn(),
            hasDependency: jest.fn().mockResolvedValue(false),
            hasCircularDependency: jest.fn().mockResolvedValue(false),
          },
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
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-1', type: 'calendar_feed' }),
          },
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

      mockTaskRepository.findByWorkspaceMemberships.mockResolvedValue(
        mockTasks,
      );

      const result = await service.findAll(userId);

      expect(
        mockTaskRepository.findByWorkspaceMemberships,
      ).toHaveBeenCalledWith(userId, {
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

      mockTaskRepository.findByWorkspaceMemberships.mockResolvedValue(
        mockTasks,
      );

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
    });

    it('should filter by projectId when provided', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      mockTaskRepository.findByWorkspaceMemberships.mockResolvedValue([]);

      await service.findAll(userId, projectId);

      expect(
        mockTaskRepository.findByWorkspaceMemberships,
      ).toHaveBeenCalledWith(userId, {
        projectId,
        tags: undefined,
      });
    });

    it('should filter by tags when provided', async () => {
      const userId = 'user-123';
      const tags = ['urgent', 'bug'];

      mockTaskRepository.findByWorkspaceMemberships.mockResolvedValue([]);

      await service.findAll(userId, undefined, tags);

      expect(
        mockTaskRepository.findByWorkspaceMemberships,
      ).toHaveBeenCalledWith(userId, {
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
        keyResults: [],
        estimatedMinutes: 60,
      };

      mockPrismaService.task.findFirst.mockResolvedValue(mockTaskWithDetails);

      const result = await service.findOneWithDetails(taskId);

      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, isDeleted: false },
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
      expect(result.estimatedMinutes).toBe(60);
    });

    it('should throw NotFoundException when task not found', async () => {
      const taskId = 'non-existent';

      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(service.findOneWithDetails(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.task.findUnique.mockResolvedValue({
        id: taskId,
        title: 'Test Task',
        isDeleted: false,
        projectId: 'proj-1',
      });
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        props: { id: taskId, title: 'Test Task' },
      });
      mockTaskRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(taskId);

      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId);
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
        priority: 'HIGH' as const,
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
      executeSpy.mockResolvedValue(mockTask as any);

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
      executeSpy.mockResolvedValue(mockTask as any);

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
      executeSpy.mockResolvedValue(mockTask as any);

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
      executeSpy.mockResolvedValue(mockTask as any);

      // Create spy BEFORE calling service.create()
      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue(undefined as any);

      await service.create(createTaskDto, userId);

      // Verify UpdateDailyMetricsUseCase was called
      expect(updateMetricsSpy).toHaveBeenCalledWith({
        userId,
        date: expect.any(Date),
        tasksCreated: 1,
      });
    });

    it('should pass doDate through to CreateTaskUseCase (ODD 005 S1)', async () => {
      const userId = 'user-123';
      const doDate = new Date('2026-10-25T09:00:00.000Z');
      const createTaskDto = {
        title: 'Task with doDate',
        projectId: 'project-123',
        doDate,
      };

      const mockTask = {
        id: 'task-123',
        props: {
          id: 'task-123',
          title: 'Task with doDate',
          ownerId: userId,
          assigneeId: userId,
          projectId: 'project-123',
          doDate,
        },
      };

      mockTaskRepository.save = jest.fn().mockResolvedValue(undefined);
      mockActivitiesService.logTaskCreated = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const executeSpy = jest.spyOn(CreateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTask as any);

      const result = await service.create(createTaskDto, userId);

      expect(executeSpy).toHaveBeenCalledWith({
        ...createTaskDto,
        ownerId: userId,
        assigneeId: userId,
      });
      expect(result.doDate).toEqual(doDate);
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
      executeSpy.mockResolvedValue(mockSubtask as any);

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

  describe('update', () => {
    it('should successfully update a task', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const updateTaskDto = {
        title: 'Updated Task Title',
        status: 'IN_PROGRESS',
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        ownerId: userId,
        status: 'TODO',
      };

      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
      };

      const mockTask = {
        id: taskId,
        props: { ...existingTask },
        update: jest.fn().mockReturnValue({
          props: { ...updatedTask },
        }),
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask as any);
      mockTaskRepository.update.mockResolvedValue(undefined);
      mockActivitiesService.logTaskUpdated = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await service.update(taskId, updateTaskDto as any, userId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const updateTaskDto = { title: 'Updated Title' };

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(taskId, updateTaskDto as any, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(taskId, updateTaskDto as any, userId),
      ).rejects.toThrow('Task not found');
    });

    it('should pass doDate through task.update (ODD 005 S1)', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const doDate = new Date('2026-10-26T09:00:00.000Z');
      const updateTaskDto = { doDate };

      const existingTask = {
        id: taskId,
        title: 'Task',
        ownerId: userId,
        status: 'TODO',
        doDate: null,
      };

      const mockTask = {
        id: taskId,
        props: { ...existingTask },
        update: jest.fn().mockReturnValue({
          id: taskId,
          props: { ...existingTask, doDate },
        }),
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask as any);
      mockTaskRepository.update.mockResolvedValue(undefined);

      const result = await service.update(taskId, updateTaskDto as any, userId);

      expect(mockTask.update).toHaveBeenCalledWith(
        expect.objectContaining({ doDate }),
      );
      expect(result.doDate).toEqual(doDate);
    });

    it('preserves legacy contract: update without doDate returns doDate field (ODD 005 S1)', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const updateTaskDto = { title: 'Updated Title' };

      const existingTask = {
        id: taskId,
        title: 'Task',
        ownerId: userId,
        status: 'TODO',
        doDate: null,
      };

      const mockTask = {
        id: taskId,
        props: { ...existingTask },
        update: jest.fn().mockReturnValue({
          id: taskId,
          props: { ...existingTask, title: 'Updated Title' },
        }),
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask as any);
      mockTaskRepository.update.mockResolvedValue(undefined);

      const result = await service.update(taskId, updateTaskDto as any, userId);

      expect(result.title).toBe('Updated Title');
      expect('doDate' in result).toBe(true);
    });
  });

  describe('complete', () => {
    it('should successfully complete a task', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const existingTask = {
        id: taskId,
        title: 'Test Task',
        status: 'TODO',
        ownerId: userId,
        parentTaskId: null,
      };

      const completedTask = {
        ...existingTask,
        status: 'COMPLETED',
        completedAt: new Date(),
      };

      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        props: { ...existingTask },
      });
      const executeSpy = jest.spyOn(CompleteTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue({ props: completedTask } as any);
      mockActivitiesService.logTaskCompleted = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.complete(taskId, userId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(executeSpy).toHaveBeenCalledWith({ taskId, ownerId: userId });
      expect(mockActivitiesService.logTaskCompleted).toHaveBeenCalledWith(
        taskId,
        userId,
      );
      expect(result).toEqual(completedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.complete(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.complete(taskId, userId)).rejects.toThrow(
        'Task not found',
      );
    });
  });

  describe('findToday', () => {
    it('should return tasks scheduled for today', async () => {
      const userId = 'user-123';
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', dueDate: new Date() },
        { id: 'task-2', title: 'Task 2', dueDate: new Date() },
      ];

      mockTaskRepository.findTodayTasks.mockResolvedValue(
        mockTasks.map((t) => ({ props: t })),
      );

      const result = await service.findToday(userId);

      expect(mockTaskRepository.findTodayTasks).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result.dueToday).toEqual(mockTasks);
    });
  });

  describe('findScheduledForDate', () => {
    it('should return tasks scheduled for a specific date', async () => {
      const userId = 'user-123';
      const date = new Date('2026-01-03');
      const mockTasks = [{ id: 'task-1', title: 'Task 1', dueDate: date }];

      mockTaskRepository.findScheduledTasks.mockResolvedValue(
        mockTasks.map((t) => ({ props: t })),
      );

      const result = await service.findScheduledForDate(userId, date);

      expect(mockTaskRepository.findScheduledTasks).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findAvailable', () => {
    it('should return available tasks for user', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Available Task',
          status: 'TODO',
          assigneeId: null,
        },
      ];

      mockTaskRepository.findAvailableTasks.mockResolvedValue(
        mockTasks.map((t) => ({ props: t })),
      );

      const result = await service.findAvailable(userId, projectId);

      expect(mockTaskRepository.findAvailableTasks).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        projectId,
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('handleRecurrenceOnCompletion (via complete)', () => {
    const userId = 'user-123';
    const taskId = 'task-rec-1';

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ timezone: 'UTC' });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should spawn next daily task and preserve tags while removing recurrence from old task', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T08:00:00.000Z'));

      const baseDueDate = new Date('2026-06-01T10:00:00.000Z');
      const expectedDueDate = new Date('2026-06-03T10:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Daily Standup',
          status: 'TODO',
          priority: 'HIGH',
          ownerId: userId,
          dueDate: baseDueDate,
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Daily Standup',
        description: 'Standup notes',
        priority: 'HIGH',
        projectId: 'project-1',
        ownerId: userId,
        assigneeId: userId,
        dueDate: baseDueDate,
        scheduledDate: null,
        scheduledTime: '10:00',
        scheduledEndTime: '10:30',
        isTimeBlocked: false,
        estimatedMinutes: 30,
        tags: [{ tagId: 'tag-work' }],
        recurrence: {
          id: 'rec-1',
          pattern: 'DAILY',
          interval: 2,
          daysOfWeek: [],
          dayOfMonth: null,
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({});
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Daily Standup',
          status: 'TODO',
          dueDate: expectedDueDate,
          tags: {
            create: [{ tagId: 'tag-work' }],
          },
          recurrence: {
            create: {
              pattern: 'DAILY',
              interval: 2,
              daysOfWeek: [],
              dayOfMonth: null,
              endDate: null,
            },
          },
        }),
      });

      expect(mockPrismaService.recurrence.delete).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
      });
    });

    it('should advance weekly recurrence to next selected dayOfWeek', async () => {
      // 2026-06-01 is Monday (day 1)
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T08:00:00.000Z'));

      const mondayDate = new Date('2026-06-01T10:00:00.000Z');
      // Next day in [1, 3, 5] is Wednesday 2026-06-03 (day 3)
      const expectedWednesday = new Date('2026-06-03T10:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Weekly Sync',
          status: 'TODO',
          ownerId: userId,
          dueDate: mondayDate,
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Weekly Sync',
        projectId: 'project-1',
        ownerId: userId,
        dueDate: mondayDate,
        scheduledDate: null,
        tags: [],
        recurrence: {
          id: 'rec-2',
          pattern: 'WEEKLY',
          interval: 1,
          daysOfWeek: [1, 3, 5],
          dayOfMonth: null,
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({});
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: expectedWednesday,
        }),
      });
    });

    it('should wrap weekly recurrence across week boundary', async () => {
      // 2026-06-05 is Friday (day 5)
      jest.useFakeTimers().setSystemTime(new Date('2026-06-05T08:00:00.000Z'));

      const fridayDate = new Date('2026-06-05T10:00:00.000Z');
      // Next week Monday is 2026-06-08 (day 1)
      const expectedMonday = new Date('2026-06-08T10:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Weekly Sync',
          status: 'TODO',
          ownerId: userId,
          dueDate: fridayDate,
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Weekly Sync',
        projectId: 'project-1',
        ownerId: userId,
        dueDate: fridayDate,
        scheduledDate: null,
        tags: [],
        recurrence: {
          id: 'rec-3',
          pattern: 'WEEKLY',
          interval: 1,
          daysOfWeek: [1, 3, 5],
          dayOfMonth: null,
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({});
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: expectedMonday,
        }),
      });
    });

    it('should clamp monthly recurrence to target month max days', async () => {
      // 2026-01-31 (31st of January)
      jest.useFakeTimers().setSystemTime(new Date('2026-01-31T08:00:00.000Z'));

      const jan31 = new Date('2026-01-31T12:00:00.000Z');
      // February 2026 has 28 days -> clamped to 2026-02-28
      const expectedFeb28 = new Date('2026-02-28T12:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Monthly Report',
          status: 'TODO',
          ownerId: userId,
          dueDate: jan31,
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Monthly Report',
        projectId: 'project-1',
        ownerId: userId,
        dueDate: jan31,
        scheduledDate: null,
        tags: [],
        recurrence: {
          id: 'rec-4',
          pattern: 'MONTHLY',
          interval: 1,
          dayOfMonth: 31,
          daysOfWeek: [],
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({});
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: expectedFeb28,
        }),
      });
    });

    it('should schedule overdue task forward from today', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-10-16T12:00:00.000Z'));

      const overdueDate = new Date('2020-01-01T15:00:00.000Z');
      const expectedTomorrow = new Date('2026-10-17T15:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Overdue Task',
          status: 'TODO',
          ownerId: userId,
          dueDate: overdueDate,
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Overdue Task',
        projectId: 'project-1',
        ownerId: userId,
        dueDate: overdueDate,
        scheduledDate: null,
        tags: [],
        recurrence: {
          id: 'rec-5',
          pattern: 'DAILY',
          interval: 1,
          dayOfMonth: null,
          daysOfWeek: [],
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({});
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: expectedTomorrow,
        }),
      });
    });

    it('should clone subtasks and preserve parentTaskId when spawning recurring task', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T08:00:00.000Z'));

      const baseDueDate = new Date('2026-06-01T10:00:00.000Z');

      const mockDomainTask = {
        id: taskId,
        props: {
          id: taskId,
          title: 'Sprint Planning',
          status: 'TODO',
          priority: 'HIGH',
          ownerId: userId,
          dueDate: baseDueDate,
          parentTaskId: 'parent-epic-1',
        },
        clone: jest.fn().mockImplementation((newProps) => ({
          id: taskId,
          props: { ...mockDomainTask.props, ...newProps },
        })),
      };

      mockTaskRepository.findById.mockResolvedValue(mockDomainTask);

      mockPrismaService.task.findUnique = jest.fn().mockResolvedValue({
        id: taskId,
        title: 'Sprint Planning',
        description: 'Bi-weekly sprint planning',
        priority: 'HIGH',
        projectId: 'project-1',
        ownerId: userId,
        assigneeId: userId,
        parentTaskId: 'parent-epic-1',
        dueDate: baseDueDate,
        scheduledDate: null,
        tags: [],
        subTasks: [
          {
            title: 'Review backlog',
            description: null,
            priority: 'MEDIUM',
            projectId: 'project-1',
            ownerId: userId,
            assigneeId: userId,
          },
        ],
        recurrence: {
          id: 'rec-6',
          pattern: 'WEEKLY',
          interval: 2,
          daysOfWeek: [],
          dayOfMonth: null,
          endDate: null,
        },
      });

      mockPrismaService.task.create = jest.fn().mockResolvedValue({ id: 'spawned-task-id' });
      mockPrismaService.recurrence.delete = jest.fn().mockResolvedValue({});

      await service.complete(taskId, userId);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Sprint Planning',
          status: 'TODO',
          parentTaskId: 'parent-epic-1',
          subTasks: {
            create: [
              {
                title: 'Review backlog',
                description: null,
                status: 'TODO',
                priority: 'MEDIUM',
                projectId: 'project-1',
                ownerId: userId,
                assigneeId: userId,
              },
            ],
          },
        }),
      });
      expect(mockActivitiesService.logTaskCreated).toHaveBeenCalledWith(
        'spawned-task-id',
        userId,
      );
    });
  });

  describe('Calendar Export & Token', () => {
    it('should generate a calendar feed token', async () => {
      const res = await service.getCalendarToken('user-1');
      expect(res).toHaveProperty('token');
      expect(res).toHaveProperty('feedUrl');
      expect(res).toHaveProperty('webcalUrl');
      expect(res.feedUrl).toContain('/tasks/export/calendar.ics?token=');
      expect(res.webcalUrl).toContain('webcal://');
    });

    it('should verify calendar token and return userId', async () => {
      const userId = await service.verifyCalendarToken('valid-token');
      expect(userId).toBe('user-1');
    });

    it('should find tasks for calendar export', async () => {
      (mockPrismaService.task as any).findMany = jest.fn().mockResolvedValue([
        {
          id: 'task-1',
          title: 'Launch feature',
          dueDate: new Date(),
          isTimeBlocked: false,
        },
      ]);

      const tasks = await service.findTasksForCalendarExport('user-1');
      expect(tasks).toHaveLength(1);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ownerId: 'user-1',
            isDeleted: false,
          }),
        }),
      );
    });
  });
});

