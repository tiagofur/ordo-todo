import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { DayPlanService } from './day-plan.service';
import { RiskAlertService } from '../scheduling/risk-alert.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { PrismaService } from '../database/prisma.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;
  let prismaService: PrismaService;
  let dayPlanService: DayPlanService;
  let riskAlertService: RiskAlertService;

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
  };

  const mockTagsService = {
    getTaskTags: jest.fn(),
  };

  const mockCommentsService = {
    getTaskComments: jest.fn(),
  };

  const mockAttachmentsService = {
    getTaskAttachments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneWithDetails: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            complete: jest.fn(),
            createSubtask: jest.fn(),
          },
        },
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: AttachmentsService,
          useValue: mockAttachmentsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DayPlanService,
          useValue: {
            getDayPlan: jest.fn(),
            freeze: jest.fn(),
            unfreeze: jest.fn(),
            apply: jest.fn(),
          },
        },
        {
          provide: RiskAlertService,
          useValue: { assessForUser: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    dayPlanService = module.get<DayPlanService>(DayPlanService);
    riskAlertService = module.get<RiskAlertService>(RiskAlertService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with valid data', async () => {
      const dto = {
        title: 'Test Task',
        projectId: 'project-123',
        description: 'Test description',
        priority: 'HIGH' as const,
      };
      const user = { id: 'user-1', email: 'test@example.com' };
      const expectedResult = {
        id: 'task-1',
        title: 'Test Task',
        projectId: 'project-123',
        ownerId: 'user-1',
      };

      (tasksService.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(dto as any, user as any);

      expect(result).toEqual(expectedResult);
      expect(tasksService.create).toHaveBeenCalledWith(dto, user.id);
    });

    it('should throw BadRequestException if title is missing', async () => {
      const dto = { projectId: 'project-123' }; // Missing title
      const user = { id: 'user-1', email: 'test@example.com' };

      (tasksService.create as jest.Mock).mockRejectedValue(
        new BadRequestException('Title is required'),
      );

      await expect(controller.create(dto as any, user as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks for user', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', ownerId: 'user-1' },
        { id: 'task-2', title: 'Task 2', ownerId: 'user-1' },
      ];

      (tasksService.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await controller.findAll(user as any);

      expect(result).toEqual(mockTasks);
      expect(tasksService.findAll).toHaveBeenCalledWith(
        user.id,
        undefined,
        undefined,
        false,
      );
    });

    it('should filter tasks by project ID', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const projectId = 'project-123';
      const mockTasks = [{ id: 'task-1', title: 'Task 1' }];

      (tasksService.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await controller.findAll(user as any, projectId);

      expect(result).toEqual(mockTasks);
      expect(tasksService.findAll).toHaveBeenCalledWith(
        user.id,
        projectId,
        undefined,
        false,
      );
    });

    it('should filter tasks by tags', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const tags = ['urgent', 'bug'];
      const mockTasks = [{ id: 'task-1', title: 'Urgent Bug' }];

      (tasksService.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await controller.findAll(user as any, undefined, tags);

      expect(result).toEqual(mockTasks);
      expect(tasksService.findAll).toHaveBeenCalledWith(
        user.id,
        undefined,
        tags,
        false,
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        ownerId: 'user-1',
      };

      (tasksService.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId, user as any);

      expect(result).toEqual(mockTask);
      expect(tasksService.findOne).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = 'non-existent';
      const user = { id: 'user-1', email: 'test@example.com' };

      (tasksService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.findOne(taskId, user as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow any workspace member to view task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-2', email: 'other@example.com' };
      const mockTask = { id: taskId, title: 'Test Task', ownerId: 'user-1' };

      (tasksService.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId, user as any);

      expect(result).toEqual(mockTask);
      expect(tasksService.findOne).toHaveBeenCalledWith(taskId);
      // Note: TaskGuard verifies workspace membership, so any member can view
    });
  });

  describe('findOneWithDetails', () => {
    it('should return task with all relations', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const mockTask = {
        id: taskId,
        ownerId: 'user-1',
        title: 'Test Task',
        subTasks: [],
        comments: [{ id: 'comment-1', content: 'Test comment' }],
        attachments: [],
        tags: [{ tag: { id: 'tag-1', name: 'urgent' } }],
      };

      (tasksService.findOneWithDetails as jest.Mock).mockResolvedValue(
        mockTask,
      );
      mockTagsService.getTaskTags.mockResolvedValue([]);
      mockCommentsService.getTaskComments.mockResolvedValue([]);
      mockAttachmentsService.getTaskAttachments.mockResolvedValue([]);

      const result = await controller.findOneWithDetails(taskId, user as any);

      expect(result).toEqual(mockTask);
      expect(tasksService.findOneWithDetails).toHaveBeenCalledWith(taskId);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const dto = {
        title: 'Updated Task',
        status: 'IN_PROGRESS' as const,
      };
      const expectedResult = {
        id: taskId,
        title: 'Updated Task',
        status: 'IN_PROGRESS',
      };

      (tasksService.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.update(taskId, dto as any, user as any);

      expect(result).toEqual(expectedResult);
      expect(tasksService.update).toHaveBeenCalledWith(taskId, dto, user.id);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = 'non-existent';
      const user = { id: 'user-1', email: 'test@example.com' };
      const dto = { title: 'Updated' };

      (tasksService.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(
        controller.update(taskId, dto as any, user as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-2', email: 'other@example.com' };
      const dto = { title: 'Hacked!' };

      (tasksService.update as jest.Mock).mockRejectedValue(
        new ForbiddenException('You can only update your own tasks'),
      );

      await expect(
        controller.update(taskId, dto as any, user as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('complete', () => {
    it('should complete a task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const expectedResult = {
        id: taskId,
        title: 'Test Task',
        status: 'DONE',
      };

      (tasksService.complete as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.complete(taskId, user as any);

      expect(result).toEqual(expectedResult);
      expect(tasksService.complete).toHaveBeenCalledWith(taskId, user.id);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = 'non-existent';
      const user = { id: 'user-1', email: 'test@example.com' };

      (tasksService.complete as jest.Mock).mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.complete(taskId, user as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const expectedResult = { success: true };

      (tasksService.remove as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.remove(taskId, user as any);

      expect(result).toEqual(expectedResult);
      expect(tasksService.remove).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = 'non-existent';
      const user = { id: 'user-1', email: 'test@example.com' };

      (tasksService.remove as jest.Mock).mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.remove(taskId, user as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own task', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-2', email: 'other@example.com' };

      (tasksService.remove as jest.Mock).mockRejectedValue(
        new ForbiddenException('You can only delete your own tasks'),
      );

      await expect(controller.remove(taskId, user as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask', async () => {
      const parentTaskId = 'task-123';
      const user = { id: 'user-1', email: 'test@example.com' };
      const dto = {
        title: 'Subtask',
        projectId: 'project-123',
      };
      const expectedResult = {
        id: 'subtask-1',
        title: 'Subtask',
        parentTaskId: parentTaskId,
      };

      (tasksService.createSubtask as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.createSubtask(
        parentTaskId,
        dto as any,
        user as any,
      );

      expect(result).toEqual(expectedResult);
      expect(tasksService.createSubtask).toHaveBeenCalledWith(
        parentTaskId,
        dto,
        user.id,
      );
    });

    it('should throw NotFoundException if parent task not found', async () => {
      const parentTaskId = 'non-existent';
      const user = { id: 'user-1', email: 'test@example.com' };
      const dto = { title: 'Subtask', projectId: 'project-123' };

      (tasksService.createSubtask as jest.Mock).mockRejectedValue(
        new NotFoundException('Parent task not found'),
      );

      await expect(
        controller.createSubtask(parentTaskId, dto as any, user as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ODD 005 S3 (T3b): day-plan endpoints delegate to DayPlanService.
  describe('day-plan', () => {
    const user = { id: 'user-1', email: 'test@example.com' } as any;

    it('getDayPlan returns the current plan', async () => {
      const view = { proposalId: 'p1', status: 'PROPOSED' };
      (dayPlanService.getDayPlan as jest.Mock).mockResolvedValue(view);

      const result = await controller.getDayPlan(user);

      expect(result).toEqual(view);
      expect(dayPlanService.getDayPlan).toHaveBeenCalledWith('user-1');
    });

    it('freezeDayPlanBlock freezes the task', async () => {
      const view = { proposalId: 'p1', frozenTaskIds: ['a'] };
      (dayPlanService.freeze as jest.Mock).mockResolvedValue(view);

      const result = await controller.freezeDayPlanBlock({ taskId: 'a' }, user);

      expect(result).toEqual(view);
      expect(dayPlanService.freeze).toHaveBeenCalledWith('user-1', 'a');
    });

    it('unfreezeDayPlanBlock unfreezes the task', async () => {
      const view = { proposalId: 'p1', frozenTaskIds: [] };
      (dayPlanService.unfreeze as jest.Mock).mockResolvedValue(view);

      const result = await controller.unfreezeDayPlanBlock(
        { taskId: 'a' },
        user,
      );

      expect(result).toEqual(view);
      expect(dayPlanService.unfreeze).toHaveBeenCalledWith('user-1', 'a');
    });

    it('applyDayPlan applies the proposal', async () => {
      const view = { proposalId: 'p1', status: 'APPLIED' };
      (dayPlanService.apply as jest.Mock).mockResolvedValue(view);

      const result = await controller.applyDayPlan({ proposalId: 'p1' }, user);

      expect(result).toEqual(view);
      expect(dayPlanService.apply).toHaveBeenCalledWith('user-1', 'p1');
    });
  });

  // ODD 005 S4 (T4b): risks endpoint delegates + defaults daysAhead to 3.
  describe('day-plan/risks', () => {
    const user = { id: 'user-1', email: 'test@example.com' } as any;

    it('getDayPlanRisks passes a valid daysAhead through', async () => {
      const alerts = [{ kind: 'overload', taskIds: ['b'], options: [{}, {}] }];
      (riskAlertService.assessForUser as jest.Mock).mockResolvedValue(alerts);

      const result = await controller.getDayPlanRisks(user, '7');

      expect(result).toEqual(alerts);
      expect(riskAlertService.assessForUser).toHaveBeenCalledWith('user-1', 7);
    });

    it.each([undefined, 'abc', '-2', '0'])(
      'getDayPlanRisks defaults invalid daysAhead (%s) to 3',
      async (daysAhead) => {
        (riskAlertService.assessForUser as jest.Mock).mockResolvedValue([]);

        await controller.getDayPlanRisks(user, daysAhead as any);

        expect(riskAlertService.assessForUser).toHaveBeenCalledWith(
          'user-1',
          3,
        );
      },
    );
  });
});
