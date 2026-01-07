import { Entity } from '../../shared/entity';
import { ActivityType } from '@prisma/client';

/**
 * Metadata structure for activity logs
 */
export interface ActivityMetadata {
  oldValue?: string;
  newValue?: string;
  fieldName?: string;
  itemName?: string;
}

/**
 * Properties for Activity entity
 */
export interface ActivityProps {
  id: string;
  taskId: string;
  userId: string;
  type: ActivityType;
  metadata?: ActivityMetadata;
  createdAt: Date;
}

/**
 * Activity entity represents a log entry for task-related actions
 *
 * Activities are immutable records of what happened to a task.
 * They provide an audit trail for task history and user actions.
 *
 * @example
 * ```typescript
 * const activity = new Activity({
 *   id: 'act-123',
 *   taskId: 'task-456',
 *   userId: 'user-789',
 *   type: ActivityType.STATUS_CHANGED,
 *   metadata: { oldValue: 'TODO', newValue: 'IN_PROGRESS', fieldName: 'status' },
 *   createdAt: new Date(),
 * });
 *
 * activity.isTaskRelated(); // true
 * activity.isCommentActivity(); // false
 * ```
 */
export class Activity extends Entity<ActivityProps> {
  constructor(props: ActivityProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  /**
   * Validate activity properties
   */
  private validate(): void {
    if (!this.props.taskId || this.props.taskId.trim() === '') {
      throw new Error('Activity must have a valid taskId');
    }
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new Error('Activity must have a valid userId');
    }
    if (!this.props.type) {
      throw new Error('Activity must have a type');
    }
    if (!this.props.createdAt) {
      throw new Error('Activity must have a createdAt timestamp');
    }
  }

  // ===== Getters =====

  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): ActivityType {
    return this.props.type;
  }

  get metadata(): ActivityMetadata | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ===== Business Methods =====

  /**
   * Check if this is a task-related activity
   */
  isTaskActivity(): boolean {
    return [
      ActivityType.TASK_CREATED,
      ActivityType.TASK_UPDATED,
      ActivityType.TASK_COMPLETED,
      ActivityType.TASK_DELETED,
    ].includes(this.props.type as any);
  }

  /**
   * Check if this is a comment-related activity
   */
  isCommentActivity(): boolean {
    return [
      ActivityType.COMMENT_ADDED,
      ActivityType.COMMENT_EDITED,
      ActivityType.COMMENT_DELETED,
    ].includes(this.props.type as any);
  }

  /**
   * Check if this is an attachment-related activity
   */
  isAttachmentActivity(): boolean {
    return [
      ActivityType.ATTACHMENT_ADDED,
      ActivityType.ATTACHMENT_DELETED,
    ].includes(this.props.type as any);
  }

  /**
   * Check if this is a subtask-related activity
   */
  isSubtaskActivity(): boolean {
    return [
      ActivityType.SUBTASK_ADDED,
      ActivityType.SUBTASK_COMPLETED,
    ].includes(this.props.type as any);
  }

  /**
   * Check if this is a field change activity
   */
  isFieldChangeActivity(): boolean {
    return [
      ActivityType.STATUS_CHANGED,
      ActivityType.PRIORITY_CHANGED,
      ActivityType.DUE_DATE_CHANGED,
      ActivityType.ASSIGNEE_CHANGED,
    ].includes(this.props.type as any);
  }

  /**
   * Get the field name that changed (if applicable)
   */
  getChangedFieldName(): string | null {
    if (this.isFieldChangeActivity() && this.props.metadata) {
      return this.props.metadata.fieldName || null;
    }
    return null;
  }

  /**
   * Get human-readable description of the activity
   */
  getDescription(): string {
    const type = this.props.type;
    const metadata = this.props.metadata;

    switch (type) {
      case ActivityType.TASK_CREATED:
        return 'Task created';
      case ActivityType.TASK_UPDATED:
        return 'Task updated';
      case ActivityType.TASK_COMPLETED:
        return 'Task completed';
      case ActivityType.TASK_DELETED:
        return 'Task deleted';
      case ActivityType.COMMENT_ADDED:
        return 'Comment added';
      case ActivityType.COMMENT_EDITED:
        return 'Comment edited';
      case ActivityType.COMMENT_DELETED:
        return 'Comment deleted';
      case ActivityType.ATTACHMENT_ADDED:
        return `Attachment added: ${metadata?.itemName || 'file'}`;
      case ActivityType.ATTACHMENT_DELETED:
        return `Attachment deleted: ${metadata?.itemName || 'file'}`;
      case ActivityType.SUBTASK_ADDED:
        return `Subtask added: ${metadata?.itemName || 'subtask'}`;
      case ActivityType.SUBTASK_COMPLETED:
        return `Subtask completed: ${metadata?.itemName || 'subtask'}`;
      case ActivityType.STATUS_CHANGED:
        return `Status changed from ${metadata?.oldValue || 'none'} to ${metadata?.newValue || 'none'}`;
      case ActivityType.PRIORITY_CHANGED:
        return `Priority changed from ${metadata?.oldValue || 'none'} to ${metadata?.newValue || 'none'}`;
      case ActivityType.DUE_DATE_CHANGED:
        return `Due date changed from ${metadata?.oldValue || 'none'} to ${metadata?.newValue || 'none'}`;
      case ActivityType.ASSIGNEE_CHANGED:
        return `Assignee changed from ${metadata?.oldValue || 'unassigned'} to ${metadata?.newValue || 'unassigned'}`;
      default:
        return 'Unknown activity';
    }
  }
}
