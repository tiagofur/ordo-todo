import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type {
  TaskRepository,
  AnalyticsRepository,
  TaskDependencyRepository,
} from '@ordo-todo/core';
import {
  CreateTaskUseCase,
  CompleteTaskUseCase,
  UpdateDailyMetricsUseCase,
  SoftDeleteTaskUseCase,
  RestoreTaskUseCase,
  PermanentDeleteTaskUseCase,
  GetDeletedTasksUseCase,
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
    @Inject('TaskDependencyRepository')
    private readonly taskDependencyRepository: TaskDependencyRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    private readonly gamificationService: GamificationService,
  ) { }

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
  ) {
    this.logger.debug(
      `Finding tasks for user ${userId} with tags: ${JSON.stringify(tags)}, assignedToMe: ${assignedToMe}`,
    );
    const tasks = await this.taskRepository.findByWorkspaceMemberships(userId, {
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

    const tasks = await this.taskRepository.findTodayTasks(
      userId,
      today,
      tomorrow,
    );

    const overdue = tasks.filter(
      (t) => t.props.dueDate && t.props.dueDate < today,
    );
    const dueToday = tasks.filter(
      (t) =>
        t.props.dueDate &&
        t.props.dueDate >= today &&
        t.props.dueDate < tomorrow,
    );
    const scheduledToday = tasks.filter(
      (t) =>
        t.props.scheduledDate &&
        t.props.scheduledDate >= today &&
        t.props.scheduledDate < tomorrow,
    );
    const notYetAvailable = tasks.filter(
      (t) => t.props.startDate && t.props.startDate > today,
    );
    const available = tasks.filter(
      (t) =>
        (!t.props.startDate || t.props.startDate <= today) &&
        (!t.props.scheduledDate ||
          t.props.scheduledDate < today ||
          t.props.scheduledDate >= tomorrow) &&
        (!t.props.dueDate || t.props.dueDate >= tomorrow),
    );

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
        updateTaskDto.estimatedMinutes
      ) {
        await this.activitiesService.logTaskUpdated(id, userId);
      }

      return updatedTask.props;
    } catch (error) {
      this.logger.error(`Failed to update task ${id}`, error);
      throw error;
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
    const softDeleteTaskUseCase = new SoftDeleteTaskUseCase(
      this.taskRepository,
    );
    await softDeleteTaskUseCase.execute(id);
    return { success: true };
  }

  /**
   * Retrieves soft-deleted tasks for a project.
   *
   * @param projectId - ID of the project
   * @returns List of deleted tasks
   */
  async getDeleted(projectId: string) {
    const getDeletedTasksUseCase = new GetDeletedTasksUseCase(
      this.taskRepository,
    );
    return getDeletedTasksUseCase.execute(projectId);
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
    return task.props;
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

    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const subtask = await createTaskUseCase.execute({
      ...createSubtaskDto,
      projectId: createSubtaskDto.projectId || parentTask.props.projectId,
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
    await this.activitiesService.logTaskCreated(subtask.id as string, userId);

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

    if (hasReverse) throw new BadRequestException('Circular dependency detected');

    const dependency = await this.taskDependencyRepository.create({
      blockingTaskId,
      blockedTaskId,
    });

    return dependency;
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
      blockedBy: blockedByTasks.filter((t) => t !== null).map((t) => t!.props),
      blocking: blockingTasks.filter((t) => t !== null).map((t) => t!.props),
    };
  }
}
