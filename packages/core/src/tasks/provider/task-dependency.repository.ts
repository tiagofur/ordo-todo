import { TaskDependency } from '../model/task-dependency.entity';

/**
 * Input for creating task dependency
 */
export interface TaskDependencyInput {
  blockingTaskId: string;
  blockedTaskId: string;
}

/**
 * Repository interface for TaskDependency domain
 */
export interface TaskDependencyRepository {
  /**
   * Create a dependency between tasks
   */
  create(input: TaskDependencyInput): Promise<TaskDependency>;

  /**
   * Get dependency by ID
   */
  findById(id: string): Promise<TaskDependency | null>;

  /**
   * Get all blocking tasks for a given task
   */
  findBlockingTasks(taskId: string): Promise<TaskDependency[]>;

  /**
   * Get all tasks blocked by a given task
   */
  findBlockedTasks(taskId: string): Promise<TaskDependency[]>;

  /**
   * Check if a dependency exists
   */
  exists(blockingTaskId: string, blockedTaskId: string): Promise<boolean>;

  /**
   * Delete a dependency
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all dependencies for a task
   */
  deleteByTaskId(taskId: string): Promise<number>;

  /**
   * Check if a task has any dependencies
   */
  hasDependencies(taskId: string): Promise<boolean>;
}
