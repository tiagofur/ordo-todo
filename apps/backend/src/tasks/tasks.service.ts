import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import type { TaskRepository } from '@ordo-todo/core';
import { CreateTaskUseCase, CompleteTaskUseCase } from '@ordo-todo/core';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    const task = await createTaskUseCase.execute({
      ...createTaskDto,
      creatorId: userId,
    });

    // Log activity
    await this.activitiesService.logTaskCreated(task.id as string, userId);

    return task.props;
  }

  async complete(id: string, userId: string) {
    const completeTaskUseCase = new CompleteTaskUseCase(this.taskRepository);
    const task = await completeTaskUseCase.execute({
      taskId: id,
      creatorId: userId,
    });

    // Log activity
    await this.activitiesService.logTaskCompleted(id, userId);

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

  async findAll(userId: string, projectId?: string, tags?: string[]) {
    this.logger.debug(`Finding tasks for user ${userId} with tags: ${JSON.stringify(tags)}`);
    const tasks = await this.taskRepository.findByCreatorId(userId, {
      projectId,
      tags,
    });
    this.logger.debug(`Found ${tasks.length} tasks for user ${userId}`);
    // Filter only main tasks (no parentTaskId)
    // Project filtering is now done in repository, but we keep the check just in case or remove it if fully handled
    const filteredTasks = tasks.filter((t) => !t.props.parentTaskId);
    this.logger.debug(`Filtered to ${filteredTasks.length} main tasks`);
    return filteredTasks.map((t) => t.props);
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
        Object.entries(updateTaskDto).filter(([_, v]) => v !== undefined)
      );

      const updatedTask = task.update(cleanUpdateDto);

      this.logger.debug(`Updating task ${id} with data: ${JSON.stringify(updateTaskDto)}`);

      await this.taskRepository.update(updatedTask);
      this.logger.debug(`Task ${id} updated successfully`);

      // Log specific field changes
      if (updateTaskDto.status && updateTaskDto.status !== oldTask.status) {
        this.logger.debug(`Logging status change for task ${id}`);
        await this.activitiesService.logStatusChanged(
          id,
          userId,
          oldTask.status,
          updateTaskDto.status,
        );
      }

      if (updateTaskDto.priority && updateTaskDto.priority !== oldTask.priority) {
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
}
