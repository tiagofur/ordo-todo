import { Inject, Injectable, Logger } from '@nestjs/common';
import { ActivityType, Prisma } from '@prisma/client';
import { LogActivityUseCase } from '@ordo-todo/core';

interface CreateActivityData {
  taskId: string;
  userId: string;
  type: ActivityType;
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
      await this.logActivityUseCase.execute(data);
      this.logger.log(`Activity: ${data.type} on task ${data.taskId}`);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${data.type}`, error);
    }
  }

  async logTaskCreated(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: ActivityType.TASK_CREATED,
    });
  }

  async logTaskUpdated(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: ActivityType.TASK_UPDATED,
    });
  }

  async logTaskCompleted(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: ActivityType.TASK_COMPLETED,
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
      type: ActivityType.STATUS_CHANGED,
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
      type: ActivityType.PRIORITY_CHANGED,
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
      type: ActivityType.DUE_DATE_CHANGED,
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
      type: ActivityType.COMMENT_ADDED,
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
      type: ActivityType.COMMENT_EDITED,
    });
  }

  async logCommentDeleted(taskId: string, userId: string): Promise<void> {
    await this.createActivity({
      taskId,
      userId,
      type: ActivityType.COMMENT_DELETED,
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
      type: ActivityType.ATTACHMENT_ADDED,
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
      type: ActivityType.ATTACHMENT_DELETED,
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
      type: ActivityType.SUBTASK_ADDED,
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
      type: ActivityType.SUBTASK_COMPLETED,
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
      type: ActivityType.ASSIGNEE_CHANGED,
      metadata: {
        oldValue: oldValue || 'unassigned',
        newValue: newValue || 'unassigned',
        fieldName: 'assignee',
      },
    });
  }
}
