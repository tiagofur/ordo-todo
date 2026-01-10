import { Inject, Injectable, Logger } from '@nestjs/common';
import { ActivityType as CoreActivityType, LogActivityUseCase } from '@ordo-todo/core';
import { ActivityType as PrismaActivityType } from '@prisma/client';

interface CreateActivityData {
  taskId: string;
  userId: string;
  type: PrismaActivityType;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fieldName?: string;
    itemName?: string;
  };
}

/**
 * Activities service for logging task-related actions
 *
 * Refactored to use domain layer (LogActivityUseCase)
 * instead of direct Prisma calls.
 */
@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @Inject('LogActivityUseCase')
    private readonly logActivityUseCase: LogActivityUseCase,
  ) {}

  async createActivity(data: CreateActivityData): Promise<void> {
    try {
      await this.logActivityUseCase.execute({
        ...data,
        type: this.toCoreActivityType(data.type),
      });
      this.logger.log(`Activity: ${data.type} on task ${data.taskId}`);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${data.type}`, error);
    }
  }

  private toCoreActivityType(prismaType: PrismaActivityType): CoreActivityType {
    switch (prismaType) {
      case PrismaActivityType.TASK_CREATED:
        return CoreActivityType.TASK_CREATED;
      case PrismaActivityType.TASK_UPDATED:
        return CoreActivityType.TASK_UPDATED;
      case PrismaActivityType.TASK_COMPLETED:
        return CoreActivityType.TASK_COMPLETED;
      case PrismaActivityType.TASK_DELETED:
        return CoreActivityType.TASK_DELETED;
      case PrismaActivityType.COMMENT_ADDED:
        return CoreActivityType.COMMENT_ADDED;
      case PrismaActivityType.COMMENT_EDITED:
        return CoreActivityType.COMMENT_EDITED;
      case PrismaActivityType.COMMENT_DELETED:
        return CoreActivityType.COMMENT_DELETED;
      case PrismaActivityType.ATTACHMENT_ADDED:
        return CoreActivityType.ATTACHMENT_ADDED;
      case PrismaActivityType.ATTACHMENT_DELETED:
        return CoreActivityType.ATTACHMENT_DELETED;
      case PrismaActivityType.SUBTASK_ADDED:
        return CoreActivityType.SUBTASK_ADDED;
      case PrismaActivityType.SUBTASK_COMPLETED:
        return CoreActivityType.SUBTASK_COMPLETED;
      case PrismaActivityType.STATUS_CHANGED:
        return CoreActivityType.STATUS_CHANGED;
      case PrismaActivityType.PRIORITY_CHANGED:
        return CoreActivityType.PRIORITY_CHANGED;
      case PrismaActivityType.ASSIGNEE_CHANGED:
        return CoreActivityType.ASSIGNEE_CHANGED;
      case PrismaActivityType.DUE_DATE_CHANGED:
        return CoreActivityType.DUE_DATE_CHANGED;
      default:
        return CoreActivityType.TASK_UPDATED;
    }
  }

  async logTaskCreated(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.TASK_CREATED,
    });
  }

  async logTaskUpdated(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.TASK_UPDATED,
    });
  }

  async logTaskCompleted(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.TASK_COMPLETED,
    });
  }

  async logStatusChanged(
    taskId: string,
    userId: string,
    oldValue: string,
    newValue: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.STATUS_CHANGED,
      metadata: { oldValue, newValue, fieldName: 'status' },
    });
  }

  async logPriorityChanged(
    taskId: string,
    userId: string,
    oldValue: string,
    newValue: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.PRIORITY_CHANGED,
      metadata: { oldValue, newValue, fieldName: 'priority' },
    });
  }

  async logDueDateChanged(
    taskId: string,
    userId: string,
    oldValue: string | null,
    newValue: string | null,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.DUE_DATE_CHANGED,
      metadata: {
        oldValue: oldValue || 'none',
        newValue: newValue || 'none',
        fieldName: 'dueDate',
      },
    });
  }

  async logCommentAdded(
    taskId: string,
    userId: string,
    mentions?: string[],
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.COMMENT_ADDED,
      metadata:
        mentions && mentions.length > 0
          ? { itemName: mentions.join(', ') }
          : undefined,
    });
  }

  async logCommentEdited(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.COMMENT_EDITED,
    });
  }

  async logCommentDeleted(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.COMMENT_DELETED,
    });
  }

  async logAttachmentAdded(
    taskId: string,
    userId: string,
    filename: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.ATTACHMENT_ADDED,
      metadata: { itemName: filename },
    });
  }

  async logAttachmentDeleted(
    taskId: string,
    userId: string,
    filename: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.ATTACHMENT_DELETED,
      metadata: { itemName: filename },
    });
  }

  async logSubtaskAdded(
    taskId: string,
    userId: string,
    subtaskTitle: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.SUBTASK_ADDED,
      metadata: { itemName: subtaskTitle },
    });
  }

  async logSubtaskCompleted(
    taskId: string,
    userId: string,
    subtaskTitle: string,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.SUBTASK_COMPLETED,
      metadata: { itemName: subtaskTitle },
    });
  }

  async logAssigneeChanged(
    taskId: string,
    userId: string,
    oldValue: string | null,
    newValue: string | null,
  ): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: PrismaActivityType.ASSIGNEE_CHANGED,
      metadata: {
        oldValue: oldValue || 'unassigned',
        newValue: newValue || 'unassigned',
        fieldName: 'assignee',
      },
    });
  }
}
