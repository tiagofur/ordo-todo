import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import type {
  TaskRepository,
  AnalyticsRepository,
  TaskDependencyRepository,
} from '@ordo-todo/core';
import type { Task } from '@ordo-todo/core';
import {
  CreateTaskUseCase,
  CompleteTaskUseCase,
  UpdateDailyMetricsUseCase,
  SoftDeleteTaskUseCase,
  RestoreTaskUseCase,
  PermanentDeleteTaskUseCase,
  GetDeletedTasksUseCase,
  toCalendarDateString,
} from '@ordo-todo/core';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, ResourceType } from '@prisma/client';

import { GamificationService } from '../gamification/gamification.service';
import { EmbeddingIndexerService } from '../ai/retrieval/embedding-indexer.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    @Inject('TaskDependencyRepository')
    private readonly taskDependencyRepository: TaskDependencyRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    private readonly gamificationService: GamificationService,
    private readonly jwtService: JwtService,
    @Optional() private readonly indexer?: EmbeddingIndexerService,
  ) {}

  /**
   * Creates a new task with automatic priority calculation and notifications
   *
   * Creates a task for the specified user, automatically assigning it to the creator
   * if no assignee is provided. Triggers notifications to the assignee and updates
   * daily metrics (tasksCreated counter).
   *
   * @param createTaskDto - Task creation data
   * @param createTaskDto.title - Task title (required, min 3 chars, max 100 chars)
   * @param createTaskDto.description - Optional task description (max 2000 chars)
   * @param createTaskDto.dueDate - Optional due date (ISO 8601 format)
   * @param createTaskDto.projectId - Optional project ID for task assignment
   * @param createTaskDto.assigneeId - Optional assignee user ID (defaults to creator)
   * @param createTaskDto.priority - Optional priority (LOW, MEDIUM, HIGH, URGENT)
   * @param createTaskDto.status - Optional status (TODO, IN_PROGRESS, DONE)
   * @param userId - ID of user creating the task (for authorization)
   *
   * @returns Promise resolving to created task with all properties (id, props, notifications sent)
   *
   * @throws {BadRequestException} If validation fails (title too short/long, invalid date format)
   * @throws {NotFoundException} If project or workspace not found
   * @throws {ForbiddenException} If user doesn't have permission to create task in project
   *
   * @example
   * ```typescript
   * const task = await tasksService.create(
   *   {
   *     title: 'Complete project documentation',
   *     description: 'Write comprehensive API docs',
   *     dueDate: '2025-12-31',
   *     projectId: 'proj-123',
   *     priority: 'HIGH',
   *     status: 'TODO',
   *   },
   *   'user-456'
   * );
   * // Returns: {
   * //   id: 'task-789',
   * //   props: { id: 'task-789', title: 'Complete project documentation', ... },
   * // }
   * ```
   *
   * @since 1.0.0
   * @see {@link ../tasks.controller.ts | Tasks Controller}
   * @see {@link ../../packages/core/src/tasks/task.entity.ts | Task Entity}
   */
  async create(createTaskDto: CreateTaskDto, userId: string) {
    // ODD 021: una tarea express (sin projectId) es personal del creador;
    // sin proyecto no hay workspace contra el que validar asignaciones.
    if (createTaskDto.projectId) {
      await this.assertAssigneeIsWorkspaceMember(
        createTaskDto.assigneeId,
        createTaskDto.projectId,
      );
    } else if (
      createTaskDto.assigneeId &&
      createTaskDto.assigneeId !== userId
    ) {
      throw new BadRequestException('EXPRESS_TASK_NO_FOREIGN_ASSIGNEE');
    }

    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const task = await createTaskUseCase.execute({
      ...createTaskDto,
      ownerId: userId,
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
        resourceId: task.id,
        resourceType: ResourceType.TASK,
      });
    }

    // Log activity
    await this.activitiesService.logTaskCreated(task.id, userId);

    // Update daily metrics - increment tasksCreated
    const updateMetrics = new UpdateDailyMetricsUseCase(
      this.analyticsRepository,
    );
    await updateMetrics.execute({
      userId,
      date: new Date(),
      tasksCreated: 1,
    });

    await this.indexer?.indexContent(
      'TASK',
      task.id,
      `${task.props.title}\n${task.props.description ?? ''}`,
    );

    return task.props;
  }

  /**
   * Marks a task as completed and updates metrics
   *
   * Completes a task by setting its status to 'DONE' and recording the
   * completion timestamp. Automatically updates daily metrics based on task type:
   * - If task is a subtask, increments subtasksCompleted counter
   * - If task is standalone, increments tasksCompleted counter
   * Prevents double counting by checking if task was already completed.
   *
   * Logs completion activity and tracks parent task completion for subtasks.
   *
   * @param id - Unique identifier of the task to complete
   * @param userId - ID of user completing the task (for authorization)
   *
   * @returns Promise resolving to completed task with updated status and completion timestamp
   *
   * @throws {NotFoundException} If task with given ID does not exist
   *
   * @example
   * ```typescript
   * const task = await tasksService.complete('task-123', 'user-456');
   * console.log(task);
   * // {
   * //   id: 'task-123',
   * //   status: 'DONE',
   * //   completedAt: '2025-12-29T14:30:00.000Z',
   * //   ...
   * // }
   * ```
   *
   * @since 1.0.0
   */
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
      ownerId: userId,
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

    // Award XP if first completion
    if (!wasAlreadyCompleted && !task.props.parentTaskId) {
      await this.gamificationService.awardTaskCompletion(userId);
    }

    // Spawn next recurring task instance if applicable
    if (!wasAlreadyCompleted) {
      await this.handleRecurrenceOnCompletion(id, userId);
    }

    await this.indexer?.indexContent(
      'TASK',
      task.id,
      `${task.props.title}\n${task.props.description ?? ''}`,
    );

    return task.props;
  }

  /**
   * Retrieves all tasks for a specific user with optional filtering by project and tags.
   *
   * @param userId - ID of the user whose tasks to retrieve
   * @param projectId - Optional filter by project ID
   * @param tags - Optional list of tags to filter by
   * @param assignedToMe - If true, returns only tasks where the user is the assignee
   * @returns List of task properties
   * @example
   * ```typescript
   * const tasks = await tasksService.findAll('user-1', 'proj-1', ['urgent']);
   * ```
   */
  async findAll(
    userId: string,
    projectId?: string,
    tags?: string[],
    assignedToMe?: boolean,
    withoutProject?: boolean,
  ) {
    try {
      this.logger.debug(
        `Finding tasks for user ${userId} with tags: ${JSON.stringify(
          tags,
        )}, assignedToMe: ${assignedToMe}`,
      );
      const tasks = await this.taskRepository.findByWorkspaceMemberships(
        userId,
        {
          projectId,
          tags,
          withoutProject,
        },
      );
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
    } catch (error) {
      this.logger.error(
        `Error finding tasks for user ${userId}, project ${projectId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find tasks for today view - returns categorized tasks
   * Categories: overdue, dueToday, scheduledToday, available, notYetAvailable
   */
  async findToday(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = user?.timezone || 'America/Mexico_City';

    // Current date string in user's timezone (YYYY-MM-DD)
    const userTodayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const tasks = await this.taskRepository.findTodayTasks(
      userId,
      new Date(),
      new Date(),
    );

    const overdue = tasks.filter((t) => {
      const dueStr = toCalendarDateString(t.props.dueDate, timezone);
      return dueStr !== '' && dueStr < userTodayStr;
    });

    const dueToday = tasks.filter((t) => {
      const dueStr = toCalendarDateString(t.props.dueDate, timezone);
      return dueStr === userTodayStr;
    });

    const scheduledToday = tasks.filter((t) => {
      const schedStr = toCalendarDateString(t.props.scheduledDate, timezone);
      return schedStr === userTodayStr;
    });

    const notYetAvailable = tasks.filter((t) => {
      const startStr = toCalendarDateString(t.props.startDate, timezone);
      return startStr !== '' && startStr > userTodayStr;
    });

    const available = tasks.filter((t) => {
      const startStr = toCalendarDateString(t.props.startDate, timezone);
      const schedStr = toCalendarDateString(t.props.scheduledDate, timezone);
      const dueStr = toCalendarDateString(t.props.dueDate, timezone);

      const isStarted = !startStr || startStr <= userTodayStr;
      const isNotScheduledForToday = schedStr !== userTodayStr;
      const isNotDueTodayOrOverdue = !dueStr || dueStr > userTodayStr;

      return isStarted && isNotScheduledForToday && isNotDueTodayOrOverdue;
    });

    return {
      overdue: overdue.map((t) => t.props),
      dueToday: dueToday.map((t) => t.props),
      scheduledToday: scheduledToday.map((t) => t.props),
      available: available.map((t) => t.props),
      notYetAvailable: notYetAvailable.map((t) => t.props),
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

    const tasks = await this.taskRepository.findScheduledTasks(
      userId,
      startOfDay,
      endOfDay,
    );

    return tasks.map((task) => task.props);
  }

  /**
   * Find all available tasks (startDate <= today or no startDate)
   */
  async findAvailable(userId: string, projectId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await this.taskRepository.findAvailableTasks(
      userId,
      today,
      projectId,
    );

    return tasks.map((task) => task.props);
  }

  /**
   * Find time-blocked tasks within a date range for calendar view
   */
  async findTimeBlocks(userId: string, startDate: Date, endDate: Date) {
    const tasks = await this.taskRepository.findTimeBlockedTasks(
      userId,
      startDate,
      endDate,
    );

    return tasks.map((task) => ({
      id: task.id,
      title: task.props.title,
      status: task.props.status,
      priority: task.props.priority,
      scheduledDate: task.props.scheduledDate,
      scheduledTime: task.props.scheduledTime,
      scheduledEndTime: task.props.scheduledEndTime,
      estimatedMinutes: task.props.estimatedMinutes,
      project: task.props.project,
      tags: task.props.tags,
    }));
  }

  /**
   * Generates a signed calendar feed token for the user (valid for 1 year)
   */
  getCalendarToken(userId: string): {
    token: string;
    feedUrl: string;
    webcalUrl: string;
  } {
    const token = this.jwtService.sign(
      { sub: userId, type: 'calendar_feed' },
      { expiresIn: '365d' },
    );
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const feedUrl = `${baseUrl}/tasks/export/calendar.ics?token=${token}`;
    const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://');

    return { token, feedUrl, webcalUrl };
  }

  /**
   * Verifies a calendar token and returns the userId
   */
  verifyCalendarToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type === 'calendar_feed' && payload.sub) {
        return payload.sub;
      }
      throw new UnauthorizedException('Invalid calendar feed token');
    } catch {
      throw new UnauthorizedException('Invalid or expired calendar feed token');
    }
  }

  /**
   * Find all tasks with dates for calendar feed export
   */
  async findTasksForCalendarExport(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        OR: [{ dueDate: { not: null } }, { scheduledDate: { not: null } }],
      },
      include: {
        project: {
          select: { name: true, color: true },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { dueDate: 'asc' }],
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      scheduledDate: t.scheduledDate,
      scheduledTime: t.scheduledTime,
      scheduledEndTime: t.scheduledEndTime,
      estimatedMinutes: t.estimatedMinutes,
      projectName: t.project?.name,
    }));
  }

  /**
   * Finds a task by ID and returns its data including subtasks
   *
   * Retrieves a task from the repository by its unique ID. Includes all subtasks
   * associated with the task for complete hierarchical display.
   *
   * @param id - Unique identifier of the task to retrieve
   *
   * @returns Promise resolving to task object with all properties and subtasks array
   *
   * @throws {NotFoundException} If task with given ID does not exist
   *
   * @example
   * ```typescript
   * const task = await tasksService.findOne('task-123');
   * console.log(task);
   * // {
   * //   id: 'task-123',
   * //   title: 'Complete documentation',
   * //   status: 'TODO',
   * //   subTasks: [ ... ]
   * // }
   * ```
   *
   * @since 1.0.0
   */
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

  /**
   * Retrieves a task with full details including comments, attachments, activities, and relations.
   *
   * @param id - Unique identifier of the task
   * @returns Task with full relational data
   * @throws {NotFoundException} If task is not found or is deleted
   */
  async findOneWithDetails(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, isDeleted: false },
      include: {
        subTasks: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to last 50 activities
        },
        tags: {
          include: { tag: true },
        },
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        keyResults: {
          include: {
            keyResult: {
              include: {
                objective: {
                  select: {
                    id: true,
                    title: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      ...task,
      tags: task.tags.map((t) => t.tag),
      estimatedMinutes: task.estimatedMinutes,
      // Flatten keyResults for easier access
      linkedKeyResults: task.keyResults.map((krt) => ({
        id: krt.keyResult.id,
        title: krt.keyResult.title,
        weight: krt.weight,
        objective: krt.keyResult.objective,
      })),
    };
  }

  /**
   * Updates a task and handles notifications, metrics, and activity logging
   *
   * Updates task fields (title, description, status, priority, due date, etc.) and:
   * - Cleans undefined fields from update DTO
   * - Sends notification to new assignee if changed
   * - Logs assignee change activity
   * - Logs status change activity
   * - Updates daily metrics if status changed to COMPLETED
   * - Increments subtasksCompleted or tasksCompleted based on task type
   *
   * @param id - Unique identifier of task to update
   * @param updateTaskDto - Partial task update data (all fields optional)
   * @param updateTaskDto.title - Updated task title (min 3, max 100 chars)
   * @param updateTaskDto.description - Updated description (max 2000 chars)
   * @param updateTaskDto.status - New status (TODO, IN_PROGRESS, DONE)
   * @param updateTaskDto.priority - New priority (LOW, MEDIUM, HIGH, URGENT)
   * @param updateTaskDto.dueDate - Updated due date (ISO 8601 format)
   * @param updateTaskDto.assigneeId - New assignee user ID
   * @param userId - ID of user making the update (for authorization)
   *
   * @returns Promise resolving to updated task with all properties
   *
   * @throws {NotFoundException} If task with given ID does not exist
   * @throws {BadRequestException} If update DTO contains invalid data
   *
   * @example
   * ```typescript
   * const updatedTask = await tasksService.update(
   *   'task-123',
   *   {
   *     status: 'IN_PROGRESS',
   *     dueDate: '2025-12-31',
   *     assigneeId: 'user-789',
   *   },
   *   'user-456'
   * );
   * console.log(updatedTask);
   * // {
   * //   id: 'task-123',
   * //   props: { title: 'Updated task', status: 'IN_PROGRESS', ... }
   * // }
   * ```
   *
   * @since 1.0.0
   * @see {@link ../tasks.controller.ts | Tasks Controller}
   * @see {@link ../../packages/core/src/tasks/task.entity.ts | Task Entity}
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    try {
      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // ODD 021 S9: cambio de proyecto (mover a proyecto o quitar a express).
      // Cubre también el assignee final, así que sustituye al check de abajo
      // cuando hay movimiento.
      const isProjectMove =
        updateTaskDto.projectId !== undefined &&
        updateTaskDto.projectId !== task.props.projectId;

      if (isProjectMove) {
        await this.assertProjectMove(
          task,
          updateTaskDto.projectId as string | null,
          updateTaskDto.assigneeId,
          userId,
        );
      } else if (updateTaskDto.assigneeId !== undefined) {
        if (task.props.projectId) {
          await this.assertAssigneeIsWorkspaceMember(
            updateTaskDto.assigneeId,
            task.props.projectId,
          );
        } else if (
          updateTaskDto.assigneeId !== null &&
          updateTaskDto.assigneeId !== userId
        ) {
          // ODD 021: tarea express — solo su dueño puede estar asignado
          throw new BadRequestException('EXPRESS_TASK_NO_FOREIGN_ASSIGNEE');
        }
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

      // ODD 021 S9: las subtareas están ancladas al proyecto del padre —
      // se mueven en cascada para mantener el invariante.
      if (isProjectMove) {
        await this.prisma.task.updateMany({
          where: { parentTaskId: id },
          data: { projectId: updateTaskDto.projectId as string | null },
        });
      }

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

          // Spawn next recurring task instance if applicable
          await this.handleRecurrenceOnCompletion(id, userId);
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
        updateTaskDto.estimatedMinutes
      ) {
        await this.activitiesService.logTaskUpdated(id, userId);
      }

      await this.indexer?.indexContent(
        'TASK',
        updatedTask.id,
        `${updatedTask.props.title}\n${updatedTask.props.description ?? ''}`,
      );

      return updatedTask.props;
    } catch (error) {
      this.logger.error(`Failed to update task ${id}`, error);
      throw error;
    }
  }

  /**
   * ODD 021 S9: valida un cambio de proyecto de una tarea existente.
   *
   * - Destino express (null): la tarea no puede quedar con un assignee
   *   distinto de su dueño (regla A2).
   * - Destino proyecto: debe existir y el solicitante debe ser miembro del
   *   workspace destino (o su owner). El assignee final, si es distinto del
   *   dueño de la tarea, debe ser miembro del workspace destino.
   */
  private async assertProjectMove(
    task: Task,
    targetProjectId: string | null,
    incomingAssigneeId: string | null | undefined,
    userId: string,
  ): Promise<void> {
    const finalAssigneeId =
      incomingAssigneeId !== undefined
        ? incomingAssigneeId
        : task.props.assigneeId;

    if (targetProjectId === null) {
      if (finalAssigneeId && finalAssigneeId !== task.props.ownerId) {
        throw new BadRequestException('EXPRESS_TASK_NO_FOREIGN_ASSIGNEE');
      }
      return;
    }

    const project = await this.prisma.project.findUnique({
      where: { id: targetProjectId },
      select: { workspaceId: true, workspace: { select: { ownerId: true } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.assertWorkspaceMembershipOrOwner(
      userId,
      project.workspaceId,
      project.workspace.ownerId,
      'You are not a member of the target workspace',
      ForbiddenException,
    );

    if (
      finalAssigneeId &&
      finalAssigneeId !== task.props.ownerId &&
      finalAssigneeId !== project.workspace.ownerId
    ) {
      await this.assertWorkspaceMembershipOrOwner(
        finalAssigneeId,
        project.workspaceId,
        project.workspace.ownerId,
        'Assignee must be a member of the target workspace',
        BadRequestException,
      );
    }
  }

  private async assertWorkspaceMembershipOrOwner(
    memberUserId: string,
    workspaceId: string,
    workspaceOwnerId: string | null,
    message: string,
    exception: new (msg: string) => Error,
  ): Promise<void> {
    // workspace sin owner (ownerId null): solo cuenta la membresía
    if (workspaceOwnerId !== null && workspaceOwnerId === memberUserId) return;

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: memberUserId },
      },
      select: { id: true },
    });
    if (!membership) {
      throw new exception(message);
    }
  }

  /**
   * Rejects assignees from outside the workspace that owns the task's project.
   * `null`/`undefined` always pass (unassigned task). The workspace owner is
   * accepted even without a membership row: legacy workspaces predate the
   * member table and are only repaired lazily by WorkspaceGuard.
   */
  private async assertAssigneeIsWorkspaceMember(
    assigneeId: string | null | undefined,
    projectId: string,
  ): Promise<void> {
    if (!assigneeId) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true, workspace: { select: { ownerId: true } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.workspace.ownerId === assigneeId) return;

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: assigneeId,
        },
      },
      select: { id: true },
    });
    if (!membership) {
      throw new BadRequestException(
        'Assignee must be a member of the task workspace',
      );
    }
  }

  /**
   * Soft deletes a task (marks as deleted but keeps in database)
   *
   * Marks a task as deleted using soft delete pattern. The task remains
   * in the database but is excluded from normal queries. Can be restored later.
   * Updates daily metrics on task deletion.
   *
   * @param id - Unique identifier of task to delete
   *
   * @returns Promise resolving to success object { success: true }
   *
   * @example
   * ```typescript
   * const result = await tasksService.remove('task-123');
   * console.log(result); // { success: true }
   * ```
   *
   * @since 1.0.0
   * @see {@link ../tasks.controller.ts | Tasks Controller}
   */
  async remove(id: string) {
    this.logger.log(`[Soft Delete] Starting soft delete for task: ${id}`);

    // Check if task exists before deleting
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, isDeleted: true, projectId: true },
    });

    if (!existingTask) {
      this.logger.error(`[Soft Delete] Task not found: ${id}`);
      throw new NotFoundException('Task not found');
    }

    this.logger.log(
      `[Soft Delete] Task found: ${existingTask.title}, current isDeleted: ${existingTask.isDeleted}, projectId: ${existingTask.projectId}`,
    );

    const softDeleteTaskUseCase = new SoftDeleteTaskUseCase(
      this.taskRepository,
    );
    await softDeleteTaskUseCase.execute(id);

    // Verify the delete was successful
    const deletedTask = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, isDeleted: true, deletedAt: true },
    });

    this.logger.log(
      `[Soft Delete] Task after delete: isDeleted=${deletedTask?.isDeleted}, deletedAt=${deletedTask?.deletedAt}`,
    );

    await this.indexer?.removeContent('TASK', id);

    return { success: true };
  }

  /**
   * Retrieves soft-deleted tasks for a project, or the caller's own deleted
   * express tasks when projectId is omitted (ODD 021 S4).
   *
   * @param projectId - ID of the project; omit to list the user's deleted tasks without project
   * @param userId - Requesting user (required to scope the no-project listing)
   * @returns List of deleted tasks
   */
  async getDeleted(projectId?: string, userId?: string) {
    this.logger.log(
      `[Get Deleted Tasks] Fetching deleted tasks for projectId: ${projectId}`,
    );

    if (!projectId && !userId) {
      throw new BadRequestException(
        'userId is required to list deleted tasks without project',
      );
    }

    const getDeletedTasksUseCase = new GetDeletedTasksUseCase(
      this.taskRepository,
    );
    const result = await getDeletedTasksUseCase.execute(
      projectId ?? null,
      userId,
    );

    this.logger.log(
      `[Get Deleted Tasks] Found ${result.length} deleted tasks for projectId: ${projectId}`,
    );
    if (result.length > 0) {
      result.forEach((task) => {
        this.logger.log(
          `[Get Deleted Tasks] - Task: ${task.props.title}, isDeleted: ${task.props.isDeleted}, deletedAt: ${task.props.deletedAt}`,
        );
      });
    }

    return result.map((t) => t.props);
  }

  /**
   * Restores a previously soft-deleted task.
   *
   * @param id - ID of the task to restore
   * @returns The restored task
   * @throws {NotFoundException} If task is not found
   */
  async restore(id: string) {
    const restoreTaskUseCase = new RestoreTaskUseCase(this.taskRepository);
    await restoreTaskUseCase.execute(id);

    // Get the restored task to return it
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.indexer?.indexContent(
      'TASK',
      task.id,
      `${task.props.title}\n${task.props.description ?? ''}`,
    );
    return {
      ...task.props,
      deletedAt: null,
    };
  }

  /**
   * Permanently deletes a task from the database.
   *
   * @param id - ID of the task to delete permanently
   * @returns Success status
   */
  async permanentDelete(id: string) {
    const permanentDeleteTaskUseCase = new PermanentDeleteTaskUseCase(
      this.taskRepository,
    );
    await permanentDeleteTaskUseCase.execute(id);
    await this.indexer?.removeContent('TASK', id);
    return { success: true };
  }

  /**
   * Creates a subtask for a given parent task.
   *
   * @param parentTaskId - ID of the parent task
   * @param createSubtaskDto - Subtask creation data
   * @param userId - ID of the user creating the subtask
   * @returns The created subtask
   * @throws {NotFoundException} If parent task is not found
   */
  async createSubtask(
    parentTaskId: string,
    createSubtaskDto: CreateSubtaskDto,
    userId: string,
  ) {
    const parentTask = await this.taskRepository.findById(parentTaskId);
    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    // A subtask is pinned to its parent's project: a foreign projectId would
    // otherwise smuggle the row into another workspace (TaskGuard authorizes
    // by the parent task, not by this dto field).
    if (
      createSubtaskDto.projectId &&
      createSubtaskDto.projectId !== parentTask.props.projectId
    ) {
      throw new BadRequestException(
        'Subtask must belong to the same project as its parent task',
      );
    }
    const projectId = parentTask.props.projectId;
    if (projectId) {
      await this.assertAssigneeIsWorkspaceMember(
        createSubtaskDto.assigneeId,
        projectId,
      );
    } else if (
      createSubtaskDto.assigneeId &&
      createSubtaskDto.assigneeId !== userId
    ) {
      // ODD 021: subtarea de tarea express — solo su dueño puede estar asignado
      throw new BadRequestException('EXPRESS_TASK_NO_FOREIGN_ASSIGNEE');
    }

    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const subtask = await createTaskUseCase.execute({
      ...createSubtaskDto,
      projectId,
      ownerId: userId,
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
    await this.activitiesService.logTaskCreated(subtask.id, userId);

    await this.indexer?.indexContent(
      'TASK',
      subtask.id,
      `${subtask.props.title}\n${subtask.props.description ?? ''}`,
    );

    return subtask.props;
  }

  /**
   * Generates a public access token for a task to allow shared viewing.
   *
   * @param id - ID of the task
   * @param userId - ID of the user generating the token
   * @returns The generated public token
   * @throws {NotFoundException} If task is not found
   */
  async generatePublicToken(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Generate a random token
    const publicToken = crypto.randomUUID();

    // Update task with public token using repository
    const updatedTask = task.update({ publicToken });
    await this.taskRepository.update(updatedTask);

    return { publicToken };
  }

  /**
   * Retrieves a task by its public access token.
   *
   * @param token - Public access token
   * @returns Task details with minimal public information
   * @throws {NotFoundException} If task is not found or token is invalid
   */
  async findByPublicToken(token: string) {
    const task = await this.prisma.task.findFirst({
      where: { publicToken: token, isDeleted: false },
      include: {
        subTasks: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        tags: {
          include: { tag: true },
        },
        owner: { select: { id: true, name: true, image: true } },
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
  /**
   * Adds a blocking dependency between two tasks.
   *
   * @param blockedTaskId - ID of the task that is blocked
   * @param blockingTaskId - ID of the task that blocks the other
   * @returns The created dependency record
   * @throws {BadRequestException} If tasks are the same or circular dependency detected
   * @throws {NotFoundException} If either task is not found
   */
  async addDependency(blockedTaskId: string, blockingTaskId: string) {
    if (blockedTaskId === blockingTaskId) {
      throw new BadRequestException('Cannot depend on self');
    }

    // Check if tasks exist
    const [blocked, blocking] = await Promise.all([
      this.taskRepository.findById(blockedTaskId),
      this.taskRepository.findById(blockingTaskId),
    ]);

    if (!blocked || !blocking) throw new NotFoundException('Task not found');

    // Check direct circular dependency
    const hasReverse = await this.taskDependencyRepository.exists(
      blockedTaskId,
      blockingTaskId,
    );

    if (hasReverse)
      throw new BadRequestException('Circular dependency detected');

    // Check duplicate dependency
    const existing = await this.taskDependencyRepository.exists(
      blockingTaskId,
      blockedTaskId,
    );
    if (existing) {
      throw new ConflictException('Dependency already exists');
    }

    const dependency = await this.taskDependencyRepository.create({
      blockingTaskId,
      blockedTaskId,
    });

    return {
      id: dependency.id,
      blockingTaskId: dependency.props?.blockingTaskId ?? blockingTaskId,
      blockedTaskId: dependency.props?.blockedTaskId ?? blockedTaskId,
      createdAt: dependency.props?.createdAt,
    };
  }

  /**
   * Removes a dependency between two tasks.
   *
   * @param blockedTaskId - ID of the blocked task
   * @param blockingTaskId - ID of the blocking task
   * @returns Success status
   * @throws {NotFoundException} If dependency does not exist
   */
  async removeDependency(blockedTaskId: string, blockingTaskId: string) {
    try {
      await this.taskDependencyRepository.deleteByTasks(
        blockingTaskId,
        blockedTaskId,
      );
      return { success: true };
    } catch (e) {
      throw new NotFoundException('Dependency not found');
    }
  }

  /**
   * Retrieves both blocking and blocked-by dependencies for a task.
   *
   * @param taskId - Unique identifier of the task
   * @returns Object containing lists of 'blockedBy' and 'blocking' tasks
   * @throws {NotFoundException} If task is not found
   */
  async getDependencies(taskId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    const [blockingDependencies, blockedDependencies] = await Promise.all([
      this.taskDependencyRepository.findBlockingTasks(taskId),
      this.taskDependencyRepository.findBlockedTasks(taskId),
    ]);

    // Get the actual task objects
    const blockedByTaskIds = blockingDependencies.map(
      (d) => d.props.blockingTaskId,
    );
    const blockingTaskIds = blockedDependencies.map(
      (d) => d.props.blockedTaskId,
    );

    const [blockedByTasks, blockingTasks] = await Promise.all([
      Promise.all(
        blockedByTaskIds.map((id) => this.taskRepository.findById(id)),
      ),
      Promise.all(
        blockingTaskIds.map((id) => this.taskRepository.findById(id)),
      ),
    ]);

    return {
      blockedBy: blockedByTasks.filter((t) => t !== null).map((t) => t.props),
      blocking: blockingTasks.filter((t) => t !== null).map((t) => t.props),
    };
  }

  /**
   * Calculates the next date and creates the next recurrence task instance upon task completion.
   */
  private async handleRecurrenceOnCompletion(
    taskId: string,
    userId: string,
  ): Promise<void> {
    try {
      const taskWithRecurrence = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { recurrence: true, tags: true, subTasks: true },
      });

      if (!taskWithRecurrence || !taskWithRecurrence.recurrence) {
        return;
      }

      const recurrence = taskWithRecurrence.recurrence;
      const rawBaseDate =
        taskWithRecurrence.dueDate ||
        taskWithRecurrence.scheduledDate ||
        new Date();

      const now = new Date();
      // If task was overdue (scheduled/due prior to today),
      // advance calculation base to today while preserving original time of day.
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const baseStart = new Date(
        rawBaseDate.getFullYear(),
        rawBaseDate.getMonth(),
        rawBaseDate.getDate(),
      );

      let baseDate = new Date(rawBaseDate);
      if (baseStart < todayStart) {
        baseDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          rawBaseDate.getHours(),
          rawBaseDate.getMinutes(),
          rawBaseDate.getSeconds(),
          rawBaseDate.getMilliseconds(),
        );
      }

      const nextDate = new Date(baseDate);
      const interval = Math.max(recurrence.interval || 1, 1);

      switch (recurrence.pattern) {
        case 'DAILY':
          nextDate.setDate(nextDate.getDate() + interval);
          break;

        case 'WEEKLY': {
          const daysOfWeek = (recurrence.daysOfWeek || [])
            .map(Number)
            .filter((d) => d >= 0 && d <= 6)
            .sort((a, b) => a - b);

          if (daysOfWeek.length > 0) {
            const currentDay = baseDate.getDay();
            // Find next weekday in current week
            const nextDayInWeek = daysOfWeek.find((d) => d > currentDay);

            if (nextDayInWeek !== undefined) {
              nextDate.setDate(
                nextDate.getDate() + (nextDayInWeek - currentDay),
              );
            } else {
              // Wrap to first selected day in next interval cycle
              const firstDay = daysOfWeek[0];
              const daysUntilNextWeek = 7 - currentDay;
              const additionalWeeks = (interval - 1) * 7;
              nextDate.setDate(
                nextDate.getDate() +
                  daysUntilNextWeek +
                  additionalWeeks +
                  firstDay,
              );
            }
          } else {
            nextDate.setDate(nextDate.getDate() + 7 * interval);
          }
          break;
        }

        case 'MONTHLY': {
          const currentYear = baseDate.getFullYear();
          const currentMonth = baseDate.getMonth();
          const targetDay = recurrence.dayOfMonth || baseDate.getDate();

          const totalMonths = currentMonth + interval;
          const targetYear = currentYear + Math.floor(totalMonths / 12);
          const targetMonth = ((totalMonths % 12) + 12) % 12;

          // Days in target month (day 0 of next month returns last day of target month)
          const daysInTargetMonth = new Date(
            targetYear,
            targetMonth + 1,
            0,
          ).getDate();
          const clampedDay = Math.min(targetDay, daysInTargetMonth);

          nextDate.setFullYear(targetYear, targetMonth, clampedDay);
          break;
        }

        case 'YEARLY': {
          const targetYear = baseDate.getFullYear() + interval;
          const targetMonth = baseDate.getMonth();
          const targetDay = baseDate.getDate();

          const daysInTargetMonth = new Date(
            targetYear,
            targetMonth + 1,
            0,
          ).getDate();
          const clampedDay = Math.min(targetDay, daysInTargetMonth);

          nextDate.setFullYear(targetYear, targetMonth, clampedDay);
          break;
        }

        case 'CUSTOM':
          nextDate.setDate(nextDate.getDate() + interval);
          break;

        default:
          nextDate.setDate(nextDate.getDate() + interval);
          break;
      }

      // Check if past recurrence end date
      if (recurrence.endDate && nextDate > new Date(recurrence.endDate)) {
        this.logger.log(
          `[Recurrence] End date reached (${recurrence.endDate.toISOString()}) for task ${taskId}. No further tasks scheduled.`,
        );
        return;
      }

      // Maintain relative offset between dueDate and scheduledDate if both are present
      let nextDueDate: Date | null = null;
      let nextScheduledDate: Date | null = null;

      if (taskWithRecurrence.dueDate && taskWithRecurrence.scheduledDate) {
        const offsetMs =
          taskWithRecurrence.scheduledDate.getTime() -
          taskWithRecurrence.dueDate.getTime();
        nextDueDate = nextDate;
        nextScheduledDate = new Date(nextDate.getTime() + offsetMs);
      } else if (taskWithRecurrence.dueDate) {
        nextDueDate = nextDate;
      } else if (taskWithRecurrence.scheduledDate) {
        nextScheduledDate = nextDate;
      }

      // Transfer recurrence definition, subtasks, and tags to the new occurrence so the chain continues
      const nextTask = await this.prisma.task.create({
        data: {
          title: taskWithRecurrence.title,
          description: taskWithRecurrence.description,
          status: 'TODO',
          priority: taskWithRecurrence.priority,
          projectId: taskWithRecurrence.projectId,
          ownerId: taskWithRecurrence.ownerId,
          assigneeId: taskWithRecurrence.assigneeId,
          parentTaskId: taskWithRecurrence.parentTaskId,
          dueDate: nextDueDate,
          scheduledDate: nextScheduledDate,
          scheduledTime: taskWithRecurrence.scheduledTime,
          scheduledEndTime: taskWithRecurrence.scheduledEndTime,
          isTimeBlocked: taskWithRecurrence.isTimeBlocked,
          estimatedMinutes: taskWithRecurrence.estimatedMinutes,
          tags: taskWithRecurrence.tags?.length
            ? {
                create: taskWithRecurrence.tags.map((t) => ({
                  tagId: t.tagId,
                })),
              }
            : undefined,
          subTasks: taskWithRecurrence.subTasks?.length
            ? {
                create: taskWithRecurrence.subTasks.map((st) => ({
                  title: st.title,
                  description: st.description,
                  status: 'TODO',
                  priority: st.priority,
                  projectId: st.projectId,
                  ownerId: st.ownerId,
                  assigneeId: st.assigneeId,
                })),
              }
            : undefined,
          recurrence: {
            create: {
              pattern: recurrence.pattern,
              interval: recurrence.interval,
              daysOfWeek: recurrence.daysOfWeek,
              dayOfMonth: recurrence.dayOfMonth,
              endDate: recurrence.endDate,
            },
          },
        },
      });

      // Remove recurrence from the completed task to prevent duplicate triggers
      await this.prisma.recurrence.delete({
        where: { id: recurrence.id },
      });

      // Log activity for the newly spawned task
      await this.activitiesService.logTaskCreated(nextTask.id, userId);

      this.logger.log(
        `[Recurrence] Successfully spawned next task for recurring task ${taskId} scheduled at ${nextDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `[Recurrence] Failed to handle recurrence for task ${taskId}`,
        error,
      );
    }
  }
}
