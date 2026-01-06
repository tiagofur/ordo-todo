import { Logger } from '@nestjs/common';

/**
 * Base Controller
 *
 * Standardized controller pattern for all API controllers.
 * Provides consistent logging, error handling, and action tracking.
 *
 * @example
 * ```typescript
 * @Controller('tasks')
 * export class TasksController extends BaseController {
 *   constructor(private readonly tasksService: TasksService) {
 *     super('TasksController');
 *   }
 *
 *   @Post()
 *   async create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
 *     this.logAction('create', user, { taskId: dto.id });
 *     return this.tasksService.create(dto, user.id);
 *   }
 * }
 * ```
 */
export abstract class BaseController {
  protected readonly logger: Logger;

  /**
   * Creates a new BaseController instance
   *
   * @param contextName - Name of the controller for logging context
   */
  constructor(contextName: string) {
    this.logger = new Logger(contextName);
  }

  /**
   * Log an action performed by a user
   *
   * @param action - The action being performed (e.g., 'create', 'update', 'delete')
   * @param user - The user performing the action
   * @param meta - Additional metadata to log
   *
   * @example
   * ```typescript
   * this.logAction('create', user, { taskId: '123', title: 'New Task' });
   * // Output: [TasksController] User(user-123) performed action: create
   * ```
   */
  protected logAction(
    action: string,
    user?: { id?: string },
    meta?: Record<string, unknown>,
  ): void {
    const userInfo = user?.id ? `User(${user.id})` : 'Anonymous';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    this.logger.log(`${userInfo} performed action: ${action}${metaStr}`);
  }

  /**
   * Log an error with context
   *
   * @param action - The action that failed
   * @param error - The error that occurred
   * @param user - The user who encountered the error (optional)
   * @param meta - Additional metadata (optional)
   *
   * @example
   * ```typescript
   * try {
   *   await this.tasksService.create(dto, userId);
   * } catch (error) {
   *   this.logError('create', error, user, { dto });
   *   throw error;
   * }
   * ```
   */
  protected logError(
    action: string,
    error: Error,
    user?: { id?: string },
    meta?: Record<string, unknown>,
  ): void {
    const userInfo = user?.id ? `User(${user.id})` : 'Anonymous';
    const metaStr = meta ? ` | Context: ${JSON.stringify(meta)}` : '';
    this.logger.error(
      `${userInfo} failed action: ${action} | Error: ${error.message}${metaStr}`,
      error.stack,
    );
  }

  /**
   * Log a warning with context
   *
   * @param message - The warning message
   * @param meta - Additional metadata (optional)
   *
   * @example
   * ```typescript
   * this.logWarning('deprecated_endpoint', { endpoint: '/old-path', use: '/new-path' });
   * ```
   */
  protected logWarning(message: string, meta?: Record<string, unknown>): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    this.logger.warn(`${message}${metaStr}`);
  }

  /**
   * Log debug information
   *
   * @param message - The debug message
   * @param meta - Additional metadata (optional)
   *
   * @example
   * ```typescript
   * this.logDebug('Processing request', { userId, taskId, processingTime: 150 });
   * ```
   */
  protected logDebug(message: string, meta?: Record<string, unknown>): void {
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    this.logger.debug(`${message}${metaStr}`);
  }

  /**
   * Log successful operation
   *
   * @param action - The action that succeeded
   * @param user - The user who performed the action (optional)
   * @param meta - Additional metadata (optional)
   *
   * @example
   * ```typescript
   * this.logSuccess('task_completed', user, { taskId, completionTime: 45 });
   * ```
   */
  protected logSuccess(
    action: string,
    user?: { id?: string },
    meta?: Record<string, unknown>,
  ): void {
    const userInfo = user?.id ? `User(${user.id})` : 'Anonymous';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    this.logger.log(`${userInfo} success: ${action}${metaStr}`);
  }
}
