import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import {
  CreateTaskUseCase,
  UpdateDailyMetricsUseCase,
  UpdateTaskUseCase,
  CompleteTaskUseCase,
  FindTodayTasksUseCase,
  FindScheduledTasksUseCase,
  FindAvailableTasksUseCase,
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
    delete: jest.fn(),
    softDelete: jest.fn(),
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
      expect(result.estimatedTime).toBe(60);
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

      // SoftDeleteTaskUseCase first finds the task, then soft deletes it
      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        props: { id: taskId, title: 'Test Task' },
      });
      mockTaskRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(taskId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
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

      // Create spy BEFORE calling service.create()
      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue(undefined);

      await service.create(createTaskDto, userId);

      // Verify UpdateDailyMetricsUseCase was called
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

      mockTaskRepository.findOne.mockResolvedValue(existingTask as any);
      mockTaskRepository.isMember.mockResolvedValue(true);
      const executeSpy = jest.spyOn(UpdateTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(updatedTask as any);
      mockActivitiesService.logTaskUpdated = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await service.update(taskId, updateTaskDto as any, userId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.isMember).toHaveBeenCalledWith(userId, taskId);
      expect(executeSpy).toHaveBeenCalledWith({
        id: taskId,
        ...updateTaskDto,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';
      const updateTaskDto = { title: 'Updated Title' };

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(taskId, updateTaskDto as any, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(taskId, updateTaskDto as any, userId),
      ).rejects.toThrow('Task not found');
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
      };

      const completedTask = {
        ...existingTask,
        status: 'DONE',
        completedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask as any);
      mockTaskRepository.isMember.mockResolvedValue(true);
      const executeSpy = jest.spyOn(CompleteTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(completedTask as any);
      mockActivitiesService.logTaskCompleted = jest
        .fn()
        .mockResolvedValue(undefined);
      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.complete(taskId, userId);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.isMember).toHaveBeenCalledWith(userId, taskId);
      expect(executeSpy).toHaveBeenCalledWith(taskId);
      expect(mockActivitiesService.logTaskCompleted).toHaveBeenCalledWith(
        taskId,
        userId,
      );
      expect(result).toEqual(completedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.complete(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.complete(taskId, userId)).rejects.toThrow(
        'Task not found',
      );
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      mockTaskRepository.findOne.mockResolvedValue({ id: taskId } as any);
      mockTaskRepository.isMember.mockResolvedValue(false);

      await expect(service.complete(taskId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.complete(taskId, userId)).rejects.toThrow(
        'You do not have permission to complete this task',
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

      const executeSpy = jest.spyOn(FindTodayTasksUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockTasks as any);

      const result = await service.findToday(userId);

      expect(executeSpy).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findScheduledForDate', () => {
    it('should return tasks scheduled for a specific date', async () => {
      const userId = 'user-123';
      const date = new Date('2026-01-03');
      const mockTasks = [{ id: 'task-1', title: 'Task 1', dueDate: date }];

      const executeSpy = jest.spyOn(
        FindScheduledTasksUseCase.prototype,
        'execute',
      );
      executeSpy.mockResolvedValue(mockTasks as any);

      const result = await service.findScheduledForDate(userId, date);

      expect(executeSpy).toHaveBeenCalledWith({ userId, date });
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

      const executeSpy = jest.spyOn(
        FindAvailableTasksUseCase.prototype,
        'execute',
      );
      executeSpy.mockResolvedValue(mockTasks as any);

      const result = await service.findAvailable(userId, projectId);

      expect(executeSpy).toHaveBeenCalledWith({ userId, projectId });
      expect(result).toEqual(mockTasks);
    });
  });
});
