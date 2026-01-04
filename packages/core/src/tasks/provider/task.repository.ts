import { Task } from "../model/task.entity";

/**
 * Repository interface for Task entity.
 *
 * Provides data access methods for task persistence and retrieval,
 * including filtering, searching, and soft delete functionality.
 *
 * @example
 * ```typescript
 * class PrismaTaskRepository implements TaskRepository {
 *   async save(task: Task): Promise<void> {
 *     await prisma.task.create({ data: task.toJSON() });
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface TaskRepository {
  /**
   * Saves a new task to the database.
   *
   * @param task - The task entity to save
   * @returns Promise that resolves when the task is saved
   * @throws {Error} If the task already exists or database operation fails
   *
   * @example
   * ```typescript
   * const task = new Task({ title: 'My Task', ownerId: 'user-123' });
   * await repository.save(task);
   * ```
   */
  save(task: Task): Promise<void>;

  /**
   * Finds a task by its unique ID.
   *
   * @param id - The unique identifier of the task
   * @returns Promise that resolves to the task if found, null otherwise
   *
   * @example
   * ```typescript
   * const task = await repository.findById('task-123');
   * if (task) {
   *   console.log(task.title);
   * }
   * ```
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Finds all tasks owned by a specific user.
   *
   * @param ownerId - The unique identifier of the task owner
   * @param filters - Optional filters for narrowing results
   * @param filters.projectId - Filter tasks by project ID
   * @param filters.tags - Filter tasks by tag names
   * @returns Promise that resolves to an array of tasks
   *
   * @example
   * ```typescript
   * // Get all tasks for a user
   * const tasks = await repository.findByOwnerId('user-123');
   *
   * // Get tasks for a specific project
   * const projectTasks = await repository.findByOwnerId('user-123', {
   *   projectId: 'project-456'
   * });
   *
   * // Get tasks with specific tags
   * const taggedTasks = await repository.findByOwnerId('user-123', {
   *   tags: ['urgent', 'bug']
   * });
   * ```
   */
  findByOwnerId(
    ownerId: string,
    filters?: { projectId?: string; tags?: string[] },
  ): Promise<Task[]>;

  /**
   * Finds all tasks from workspaces where the user is a member.
   *
   * This includes tasks from:
   * - Personal workspace
   * - Workspaces where user is a member
   * - Projects within those workspaces
   *
   * @param userId - The unique identifier of the user
   * @param filters - Optional filters for narrowing results
   * @param filters.projectId - Filter tasks by project ID
   * @param filters.tags - Filter tasks by tag names
   * @returns Promise that resolves to an array of tasks
   *
   * @example
   * ```typescript
   * const tasks = await repository.findByWorkspaceMemberships('user-123');
   * ```
   */
  findByWorkspaceMemberships(
    userId: string,
    filters?: { projectId?: string; tags?: string[] },
  ): Promise<Task[]>;

  /**
   * Updates an existing task in the database.
   *
   * @param task - The task entity with updated properties
   * @returns Promise that resolves when the task is updated
   * @throws {Error} If the task doesn't exist or database operation fails
   *
   * @example
   * ```typescript
   * const updated = task.clone({ status: TaskStatus.DONE });
   * await repository.update(updated);
   * ```
   */
  update(task: Task): Promise<void>;

  /**
   * Soft deletes a task by marking it as deleted.
   *
   * The task remains in the database but is marked as deleted
   * and won't appear in normal queries.
   *
   * @param id - The unique identifier of the task to delete
   * @returns Promise that resolves when the task is soft deleted
   *
   * @example
   * ```typescript
   * await repository.softDelete('task-123');
   * ```
   */
  softDelete(id: string): Promise<void>;

  /**
   * Permanently deletes a task (hard delete).
   *
   * WARNING: This operation cannot be undone. Use softDelete
   * unless you absolutely need to permanently remove the task.
   *
   * @param id - The unique identifier of the task to delete
   * @returns Promise that resolves when the task is permanently deleted
   *
   * @example
   * ```typescript
   * await repository.permanentDelete('task-123');
   * ```
   */
  permanentDelete(id: string): Promise<void>;

  /**
   * Alias for softDelete. Maintains compatibility with code using 'delete' terminology.
   *
   * @param id - The unique identifier of the task to delete
   * @returns Promise that resolves when the task is deleted
   * @see softDelete
   */
  delete(id: string): Promise<void>;

  /**
   * Restores a previously soft-deleted task.
   *
   * @param id - The unique identifier of the task to restore
   * @returns Promise that resolves when the task is restored
   *
   * @example
   * ```typescript
   * await repository.restore('task-123');
   * ```
   */
  restore(id: string): Promise<void>;

  /**
   * Finds all soft-deleted tasks for a specific project.
   *
   * Useful for implementing a "trash" or "recycle bin" feature.
   *
   * @param projectId - The unique identifier of the project
   * @returns Promise that resolves to an array of deleted tasks
   *
   * @example
   * ```typescript
   * const deletedTasks = await repository.findDeleted('project-456');
   * ```
   */
  findDeleted(projectId: string): Promise<Task[]>;

  /**
   * Finds tasks scheduled for today (due today, overdue, or in progress).
   *
   * Used for the "Today" view in the application.
   *
   * @param userId - The unique identifier of the user
   * @param today - The start of today (midnight)
   * @param tomorrow - The start of tomorrow (midnight)
   * @returns Promise that resolves to an array of today's tasks
   *
   * @example
   * ```typescript
   * const today = new Date();
   * today.setHours(0, 0, 0, 0);
   * const tomorrow = new Date(today);
   * tomorrow.setDate(tomorrow.getDate() + 1);
   *
   * const todaysTasks = await repository.findTodayTasks('user-123', today, tomorrow);
   * ```
   */
  findTodayTasks(userId: string, today: Date, tomorrow: Date): Promise<Task[]>;

  /**
   * Finds tasks scheduled for a specific date range.
   *
   * Includes tasks with due dates or scheduled dates within the range.
   *
   * @param userId - The unique identifier of the user
   * @param startOfDay - The start of the date range
   * @param endOfDay - The end of the date range
   * @returns Promise that resolves to an array of scheduled tasks
   *
   * @example
   * ```typescript
   * const startOfWeek = new Date();
   * startOfWeek.setHours(0, 0, 0, 0);
   * const endOfWeek = new Date(startOfWeek);
   * endOfWeek.setDate(endOfWeek.getDate() + 7);
   *
   * const weeklyTasks = await repository.findScheduledTasks(
   *   'user-123',
   *   startOfWeek,
   *   endOfWeek
   * );
   * ```
   */
  findScheduledTasks(
    userId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<Task[]>;

  /**
   * Finds available tasks that can be worked on.
   *
   * Available tasks are:
   * - Not completed
   * - Not blocked by dependencies
   * - Not scheduled for the future
   * - In the specified project (if provided)
   *
   * @param userId - The unique identifier of the user
   * @param today - The current date/time
   * @param projectId - Optional project ID to filter by
   * @returns Promise that resolves to an array of available tasks
   *
   * @example
   * ```typescript
   * const available = await repository.findAvailableTasks(
   *   'user-123',
   *   new Date(),
   *   'project-456'
   * );
   * ```
   */
  findAvailableTasks(
    userId: string,
    today: Date,
    projectId?: string,
  ): Promise<Task[]>;

  /**
   * Finds tasks with time blocks scheduled in a date range.
   *
   * Used for the calendar view and time blocking features.
   *
   * @param userId - The unique identifier of the user
   * @param startDate - The start of the date range
   * @param endDate - The end of the date range
   * @returns Promise that resolves to an array of time-blocked tasks
   *
   * @example
   * ```typescript
   * const startOfWeek = new Date();
   * const endOfWeek = new Date();
   * endOfWeek.setDate(endOfWeek.getDate() + 7);
   *
   * const timeBlockedTasks = await repository.findTimeBlockedTasks(
   *   'user-123',
   *   startOfWeek,
   *   endOfWeek
   * );
   * ```
   */
  findTimeBlockedTasks(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Task[]>;

  /**
   * Groups tasks by status and returns counts for each status.
   *
   * Useful for dashboard widgets and statistics.
   *
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves to an array of status/count pairs
   *
   * @example
   * ```typescript
   * const statusCounts = await repository.groupByStatus('user-123');
   * // Returns: [
   * //   { status: 'TODO', count: 5 },
   * //   { status: 'IN_PROGRESS', count: 2 },
   * //   { status: 'DONE', count: 10 }
   * // ]
   * ```
   */
  groupByStatus(
    userId: string,
  ): Promise<Array<{ status: string; count: number }>>;
}
