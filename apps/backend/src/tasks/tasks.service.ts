import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { TaskRepository, AnalyticsRepository } from '@ordo-todo/core';
import {
  CreateTaskUseCase,
  CompleteTaskUseCase,
  UpdateDailyMetricsUseCase,
} from '@ordo-todo/core';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, ResourceType } from '@prisma/client';

import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    private readonly gamificationService: GamificationService,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const task = await createTaskUseCase.execute({
      ...createTaskDto,
      creatorId: userId,
      // Auto-assign to creator if no assignee specified
      assigneeId: createTaskDto.assigneeId ?? userId,
    });

    // Notify Assignee if different from creator
    if (task.props.assigneeId && task.props.assigneeId !== userId) {
      await this.notificationsService.create({
        userId: task.props.assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task assigned to you',
        message: `You were assigned to task "${task.props.title}"`,
        resourceId: task.id as string,
        resourceType: ResourceType.TASK,
      });
    }

    // Log activity
    await this.activitiesService.logTaskCreated(task.id as string, userId);

    // Update daily metrics - increment tasksCreated
    const updateMetrics = new UpdateDailyMetricsUseCase(
      this.analyticsRepository,
    );
    await updateMetrics.execute({
      userId,
      date: new Date(),
      tasksCreated: 1,
    });

    return task.props;
  }

  async complete(id: string, userId: string) {
    // Get current task to check if it was already completed
    const currentTask = await this.taskRepository.findById(id);
    if (!currentTask) {
      throw new NotFoundException('Task not found');
    }

    const wasAlreadyCompleted = currentTask.props.status === 'COMPLETED';

    const completeTaskUseCase = new CompleteTaskUseCase(this.taskRepository);
    const task = await completeTaskUseCase.execute({
      taskId: id,
      creatorId: userId,
    });

    // Log activity
    await this.activitiesService.logTaskCompleted(id, userId);

    // Only update metrics if task wasn't already completed (prevent double counting)
    if (!wasAlreadyCompleted) {
      const updateMetrics = new UpdateDailyMetricsUseCase(
        this.analyticsRepository,
      );

      // If subtask, increment subtasksCompleted; otherwise increment tasksCompleted
      if (task.props.parentTaskId) {
        await updateMetrics.execute({
          userId,
          date: new Date(),
          subtasksCompleted: 1,
        });
      } else {
        await updateMetrics.execute({
          userId,
          date: new Date(),
          tasksCompleted: 1,
        });
      }
    }

    // If subtask, log on parent
    if (task.props.parentTaskId) {
      await this.activitiesService.logSubtaskCompleted(
        task.props.parentTaskId,
        userId,
        task.props.title,
      );
    }

    return task.props;
  }

  async findAll(
    userId: string,
    projectId?: string,
    tags?: string[],
    assignedToMe?: boolean,
  ) {
    this.logger.debug(
      `Finding tasks for user ${userId} with tags: ${JSON.stringify(tags)}, assignedToMe: ${assignedToMe}`,
    );
    const tasks = await this.taskRepository.findByCreatorId(userId, {
      projectId,
      tags,
    });
    this.logger.debug(`Found ${tasks.length} tasks for user ${userId}`);
    // Filter only main tasks (no parentTaskId)
    // Project filtering is now done in repository, but we keep the check just in case or remove it if fully handled
    let filteredTasks = tasks.filter((t) => !t.props.parentTaskId);

    // Apply "My Tasks" filter - show only tasks assigned to the current user
    if (assignedToMe) {
      filteredTasks = filteredTasks.filter(
        (t) => t.props.assigneeId === userId,
      );
      this.logger.debug(
        `Filtered to ${filteredTasks.length} tasks assigned to user`,
      );
    }

    this.logger.debug(`Returning ${filteredTasks.length} main tasks`);
    return filteredTasks.map((t) => t.props);
  }

  /**
   * Find tasks for today view - returns categorized tasks
   * Categories: overdue, dueToday, scheduledToday, available, notYetAvailable
   */
  async findToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        status: { not: 'COMPLETED' },
        parentTaskId: null, // Only main tasks
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    // Categorize tasks
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < today,
    );
    const dueToday = tasks.filter(
      (t) => t.dueDate && t.dueDate >= today && t.dueDate < tomorrow,
    );
    const scheduledToday = tasks.filter(
      (t) => t.scheduledDate && t.scheduledDate >= today && t.scheduledDate < tomorrow,
    );
    const notYetAvailable = tasks.filter(
      (t) => t.startDate && t.startDate > today,
    );
    const available = tasks.filter(
      (t) =>
        (!t.startDate || t.startDate <= today) &&
        (!t.scheduledDate || t.scheduledDate < today || t.scheduledDate >= tomorrow) &&
        (!t.dueDate || t.dueDate >= tomorrow),
    );

    const formatTask = (task: typeof tasks[0]) => ({
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedTime: task.estimatedMinutes,
    });

    return {
      overdue: overdue.map(formatTask),
      dueToday: dueToday.map(formatTask),
      scheduledToday: scheduledToday.map(formatTask),
      available: available.map(formatTask),
      notYetAvailable: notYetAvailable.map(formatTask),
    };
  }

  /**
   * Find tasks scheduled for a specific date
   */
  async findScheduledForDate(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ scheduledTime: 'asc' }, { priority: 'desc' }],
    });

    return tasks.map((task) => ({
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedTime: task.estimatedMinutes,
    }));
  }

  /**
   * Find all available tasks (startDate <= today or no startDate)
   */
  async findAvailable(userId: string, projectId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        status: { not: 'COMPLETED' },
        parentTaskId: null,
        OR: [
          { startDate: null },
          { startDate: { lte: today } },
        ],
        ...(projectId ? { projectId } : {}),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    return tasks.map((task) => ({
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedTime: task.estimatedMinutes,
    }));
  }

  /**
   * Find time-blocked tasks within a date range for calendar view
   */
  async findTimeBlocks(userId: string, startDate: Date, endDate: Date) {
    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        isTimeBlocked: true,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        scheduledTime: { not: null },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      scheduledDate: task.scheduledDate,
      scheduledTime: task.scheduledTime,
      scheduledEndTime: task.scheduledEndTime,
      estimatedTime: task.estimatedMinutes,
      project: task.project,
      tags: task.tags.map((t) => t.tag),
    }));
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return {
      ...task.props,
      subTasks: task.props.subTasks?.map((st) => st.props) || [],
    };
  }

  async findOneWithDetails(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subTasks: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: { uploadedBy: true } as any,
          orderBy: { uploadedAt: 'desc' },
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to last 50 activities
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedTime: task.estimatedMinutes,
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const oldTask = task.props;

      // Remove undefined fields from updateTaskDto to avoid overwriting with undefined
      const cleanUpdateDto = Object.fromEntries(
        Object.entries(updateTaskDto).filter(([_, v]) => v !== undefined),
      );

      const updatedTask = task.update(cleanUpdateDto);

      this.logger.debug(
        `Updating task ${id} with data: ${JSON.stringify(updateTaskDto)}`,
      );

      await this.taskRepository.update(updatedTask);
      this.logger.debug(`Task ${id} updated successfully`);

      // Notify Assignee if changed
      if (
        updateTaskDto.assigneeId &&
        updateTaskDto.assigneeId !== oldTask.assigneeId &&
        updateTaskDto.assigneeId !== userId
      ) {
        await this.notificationsService.create({
          userId: updateTaskDto.assigneeId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task assigned to you',
          message: `You were assigned to task "${updatedTask.props.title}"`,
          resourceId: id,
          resourceType: ResourceType.TASK,
        });

        // Log activity
        await this.activitiesService.logAssigneeChanged(
          id,
          userId,
          oldTask.assigneeId || null,
          updateTaskDto.assigneeId,
        );
      }

      // Log specific field changes
      if (updateTaskDto.status && updateTaskDto.status !== oldTask.status) {
        this.logger.debug(`Logging status change for task ${id}`);
        await this.activitiesService.logStatusChanged(
          id,
          userId,
          oldTask.status,
          updateTaskDto.status,
        );

        const updateMetrics = new UpdateDailyMetricsUseCase(
          this.analyticsRepository,
        );
        const isSubtask = !!oldTask.parentTaskId;

        // If status changed to COMPLETED from non-COMPLETED, increment metrics
        if (
          updateTaskDto.status === 'COMPLETED' &&
          oldTask.status !== 'COMPLETED'
        ) {
          if (isSubtask) {
            await updateMetrics.execute({
              userId,
              date: new Date(),
              subtasksCompleted: 1,
            });
          } else {
            await updateMetrics.execute({
              userId,
              date: new Date(),
              tasksCompleted: 1,
            });

            // Award XP
            await this.gamificationService.awardTaskCompletion(userId);
          }
        }

        // If status changed from COMPLETED to non-COMPLETED (reopening), decrement metrics
        if (
          oldTask.status === 'COMPLETED' &&
          updateTaskDto.status !== 'COMPLETED'
        ) {
          if (isSubtask) {
            await updateMetrics.execute({
              userId,
              date: new Date(),
              subtasksCompleted: -1, // Decrement
            });
          } else {
            await updateMetrics.execute({
              userId,
              date: new Date(),
              tasksCompleted: -1, // Decrement
            });
          }
        }
      }

      if (
        updateTaskDto.priority &&
        updateTaskDto.priority !== oldTask.priority
      ) {
        this.logger.debug(`Logging priority change for task ${id}`);
        await this.activitiesService.logPriorityChanged(
          id,
          userId,
          oldTask.priority,
          updateTaskDto.priority,
        );
      }

      if (
        updateTaskDto.dueDate !== undefined &&
        updateTaskDto.dueDate?.toString() !== oldTask.dueDate?.toString()
      ) {
        await this.activitiesService.logDueDateChanged(
          id,
          userId,
          oldTask.dueDate?.toISOString() || null,
          updateTaskDto.dueDate?.toISOString() || null,
        );
      }

      // Log general update if other fields changed
      if (
        updateTaskDto.title ||
        updateTaskDto.description ||
        updateTaskDto.estimatedTime
      ) {
        await this.activitiesService.logTaskUpdated(id, userId);
      }

      return updatedTask.props;
    } catch (error) {
      this.logger.error(`Failed to update task ${id}`, error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.taskRepository.delete(id);
    return { success: true };
  }

  async createSubtask(
    parentTaskId: string,
    createSubtaskDto: CreateSubtaskDto,
    userId: string,
  ) {
    const parentTask = await this.taskRepository.findById(parentTaskId);
    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const subtask = await createTaskUseCase.execute({
      ...createSubtaskDto,
      projectId: createSubtaskDto.projectId || parentTask.props.projectId,
      creatorId: userId,
      // Auto-assign to creator if no assignee specified
      assigneeId: createSubtaskDto.assigneeId ?? userId,
      parentTaskId,
    });

    // Log activity on parent task
    await this.activitiesService.logSubtaskAdded(
      parentTaskId,
      userId,
      subtask.props.title,
    );

    // Log creation on the subtask itself
    await this.activitiesService.logTaskCreated(subtask.id as string, userId);

    return subtask.props;
  }

  async generatePublicToken(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Generate a random token
    const publicToken = crypto.randomUUID();

    await this.prisma.task.update({
      where: { id },
      data: { publicToken },
    });

    return { publicToken };
  }

  async findByPublicToken(token: string) {
    const task = await this.prisma.task.findUnique({
      where: { publicToken: token },
      include: {
        subTasks: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: { uploadedBy: true } as any,
          orderBy: { uploadedAt: 'desc' },
        },
        tags: {
          include: { tag: true },
        },
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found or link expired');
    }

    return {
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedTime: task.estimatedMinutes,
    };
  }

  // Dependencies
  async addDependency(blockedTaskId: string, blockingTaskId: string) {
    if (blockedTaskId === blockingTaskId) {
      throw new BadRequestException('Cannot depend on self');
    }

    // Check if tasks exist
    const [blocked, blocking] = await Promise.all([
      this.prisma.task.findUnique({ where: { id: blockedTaskId } }),
      this.prisma.task.findUnique({ where: { id: blockingTaskId } }),
    ]);

    if (!blocked || !blocking) throw new NotFoundException('Task not found');

    // Check direct circular dependency
    const reverse = await this.prisma.taskDependency.findUnique({
      where: {
        blockingTaskId_blockedTaskId: {
          blockingTaskId: blockedTaskId,
          blockedTaskId: blockingTaskId,
        },
      },
    });

    if (reverse) throw new BadRequestException('Circular dependency detected');

    return this.prisma.taskDependency.create({
      data: {
        blockedTaskId,
        blockingTaskId,
      },
    });
  }

  async removeDependency(blockedTaskId: string, blockingTaskId: string) {
    // Check if exists first to avoid P2025? Or let it throw/catch.
    // Prisma delete throws if record not found unless we use deleteMany or check.
    // We'll trust client pass correct IDs or handle error
    try {
      return await this.prisma.taskDependency.delete({
        where: {
          blockingTaskId_blockedTaskId: {
            blockedTaskId,
            blockingTaskId,
          },
        },
      });
    } catch (e) {
      throw new NotFoundException('Dependency not found');
    }
  }

  async getDependencies(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        blockedBy: { include: { blockingTask: true } },
        blocking: { include: { blockedTask: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    return {
      blockedBy: task.blockedBy.map((d) => d.blockingTask),
      blocking: task.blocking.map((d) => d.blockedTask),
    };
  }
}
