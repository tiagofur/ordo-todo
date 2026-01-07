import { Entity } from '../../shared/entity';

/**
 * Properties for TaskDependency entity
 */
export interface TaskDependencyProps {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  createdAt: Date;
}

/**
 * TaskDependency entity represents a dependency relationship between tasks
 *
 * When Task A blocks Task B, Task B cannot be completed until Task A is done.
 * This is critical for project management and task scheduling.
 *
 * @example
 * ```typescript
 * const dependency = new TaskDependency({
 *   id: 'dep-123',
 *   blockingTaskId: 'task-a', // Must complete first
 *   blockedTaskId: 'task-b',  // Blocked by task-a
 *   createdAt: new Date(),
 * });
 *
 * dependency.isBlocking('task-a'); // true
 * dependency.isBlockedBy('task-b'); // true
 * ```
 */
export class TaskDependency extends Entity<TaskDependencyProps> {
  constructor(props: TaskDependencyProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  /**
   * Validate task dependency properties
   */
  private validate(): void {
    if (!this.props.blockingTaskId || this.props.blockingTaskId.trim() === '') {
      throw new Error('TaskDependency must have a valid blockingTaskId');
    }
    if (!this.props.blockedTaskId || this.props.blockedTaskId.trim() === '') {
      throw new Error('TaskDependency must have a valid blockedTaskId');
    }
    if (this.props.blockingTaskId === this.props.blockedTaskId) {
      throw new Error('Task cannot depend on itself');
    }
  }

  // ===== Getters =====

  get blockingTaskId(): string {
    return this.props.blockingTaskId;
  }

  get blockedTaskId(): string {
    return this.props.blockedTaskId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ===== Business Methods =====

  /**
   * Check if a task is blocking another task
   */
  isBlocking(taskId: string): boolean {
    return this.props.blockingTaskId === taskId;
  }

  /**
   * Check if a task is blocked by another task
   */
  isBlockedBy(taskId: string): boolean {
    return this.props.blockedTaskId === taskId;
  }

  /**
   * Check if this dependency involves a specific task
   */
  involvesTask(taskId: string): boolean {
    return (
      this.props.blockingTaskId === taskId ||
      this.props.blockedTaskId === taskId
    );
  }

  /**
   * Get the other task in the dependency
   */
  getOtherTask(taskId: string): string | null {
    if (this.props.blockingTaskId === taskId) {
      return this.props.blockedTaskId;
    }
    if (this.props.blockedTaskId === taskId) {
      return this.props.blockingTaskId;
    }
    return null;
  }
}
