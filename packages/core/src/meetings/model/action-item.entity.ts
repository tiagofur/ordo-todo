import { Entity, EntityProps } from '../../shared/entity';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ActionItemProps extends EntityProps {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: Date;
  priority: Priority;
  context: string; // Original transcript that generated this
  completed?: boolean;
  taskId?: string; // Linked task if converted
}

export class ActionItem extends Entity<ActionItemProps> {
  constructor(props: ActionItemProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('ActionItem title is required');
    }
    if (this.props.title.length > 500) {
      throw new Error('ActionItem title must be 500 characters or less');
    }
    if (this.props.description && this.props.description.length > 2000) {
      throw new Error('ActionItem description must be 2000 characters or less');
    }
    if (this.props.context && this.props.context.length > 1000) {
      throw new Error('ActionItem context must be 1000 characters or less');
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(this.props.priority)) {
      throw new Error('Invalid priority value');
    }
  }

  // Business logic methods
  isAssigned(): boolean {
    return !!this.props.assignee && this.props.assignee.trim().length > 0;
  }

  hasDueDate(): boolean {
    return !!this.props.dueDate;
  }

  isOverdue(): boolean {
    if (!this.props.dueDate) return false;
    return new Date() > this.props.dueDate;
  }

  isDueWithin(days: number): boolean {
    if (!this.props.dueDate) return false;
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return this.props.dueDate >= now && this.props.dueDate <= future;
  }

  markAsCompleted(taskId?: string): ActionItem {
    return this.clone({
      completed: true,
      taskId: taskId || this.props.taskId,
    });
  }

  linkToTask(taskId: string): ActionItem {
    return this.clone({
      taskId,
    });
  }

  isUrgent(): boolean {
    return this.props.priority === 'URGENT' || this.props.priority === 'HIGH';
  }

  getPriorityLevel(): number {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
    return levels[this.props.priority];
  }

  isHigherPriorityThan(other: ActionItem): boolean {
    return this.getPriorityLevel() > other.getPriorityLevel();
  }

  // Getters
  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get assignee(): string | undefined {
    return this.props.assignee;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get context(): string {
    return this.props.context;
  }

  get completed(): boolean {
    return this.props.completed ?? false;
  }

  get taskId(): string | undefined {
    return this.props.taskId;
  }
}
