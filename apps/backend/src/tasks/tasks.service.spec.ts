import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;
  let activitiesService: ActivitiesService;

  const mockTaskRepository = {
    findByCreatorId: jest.fn(),
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
            creatorId: userId,
            parentTaskId: null,
          },
        },
        {
          props: {
            id: 'task-2',
            title: 'Task 2',
            creatorId: userId,
            parentTaskId: null,
          },
        },
      ];

      mockTaskRepository.findByCreatorId.mockResolvedValue(mockTasks);

      const result = await service.findAll(userId);

      expect(mockTaskRepository.findByCreatorId).toHaveBeenCalledWith(userId, {
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
            creatorId: userId,
            parentTaskId: null,
          },
        },
        {
          props: {
            id: 'subtask-1',
            title: 'Subtask 1',
            creatorId: userId,
            parentTaskId: 'task-1',
          },
        },
      ];

      mockTaskRepository.findByCreatorId.mockResolvedValue(mockTasks);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
    });

    it('should filter by projectId when provided', async () => {
      const userId = 'user-123';
      const projectId = 'project-123';

      mockTaskRepository.findByCreatorId.mockResolvedValue([]);

      await service.findAll(userId, projectId);

      expect(mockTaskRepository.findByCreatorId).toHaveBeenCalledWith(userId, {
        projectId,
        tags: undefined,
      });
    });

    it('should filter by tags when provided', async () => {
      const userId = 'user-123';
      const tags = ['urgent', 'bug'];

      mockTaskRepository.findByCreatorId.mockResolvedValue([]);

      await service.findAll(userId, undefined, tags);

      expect(mockTaskRepository.findByCreatorId).toHaveBeenCalledWith(userId, {
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
});
