import { TimeSession, SessionType } from "../model/time-session.entity";

/**
 * Filter criteria for querying time sessions.
 *
 * Used to find sessions matching specific conditions, such as those for a particular task,
 * of a certain type (work, break), or within a date range.
 *
 * @example
 * ```typescript
 * // Find all completed work sessions for a task in January
 * const filters: SessionFilters = {
 *   taskId: 'task-123',
 *   type: 'WORK',
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-01-31'),
 *   completedOnly: true
 * };
 *
 * const sessions = await repository.findWithFilters('user-456', filters, { page: 1, limit: 20 });
 * ```
 */
export interface SessionFilters {
  /** Filter sessions associated with a specific task */
  taskId?: string;

  /** Filter sessions by type (WORK, SHORT_BREAK, LONG_BREAK, CONTINUOUS) */
  type?: SessionType;

  /** Filter sessions starting on or after this date */
  startDate?: Date;

  /** Filter sessions starting on or before this date */
  endDate?: Date;

  /** If true, only return completed sessions (with a finished timestamp) */
  completedOnly?: boolean;
}

/**
 * Pagination parameters for querying sessions.
 *
 * Used to control pagination of session queries, allowing efficient retrieval
 * of large datasets in chunks.
 *
 * @example
 * ```typescript
 * const pagination: PaginationParams = {
 *   page: 1,
 *   limit: 20
 * };
 *
 * const result = await repository.findWithFilters('user-123', {}, pagination);
 * console.log(`Showing ${result.sessions.length} of ${result.total} sessions`);
 * ```
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;

  /** Number of items per page */
  limit: number;
}

/**
 * Paginated result of time sessions query.
 *
 * Contains the session data for the current page along with pagination metadata.
 *
 * @example
 * ```typescript
 * const result: PaginatedSessions = {
 *   sessions: [session1, session2, session3],
 *   total: 45,
 *   page: 1,
 *   limit: 20,
 *   totalPages: 3
 * };
 *
 * console.log(`Page ${result.page} of ${result.totalPages}`);
 * result.sessions.forEach(session => {
 *   console.log(`${session.type}: ${session.duration} minutes`);
 * });
 * ```
 */
export interface PaginatedSessions {
  /** Array of sessions for the current page */
  sessions: TimeSession[];

  /** Total number of sessions matching the filter */
  total: number;

  /** Current page number */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * Statistics summary for time sessions.
 *
 * Provides aggregated metrics about a user's time tracking, including total work time,
 * break time, pomodoros completed, pauses taken, and breakdowns by session type.
 * Useful for analytics dashboards and productivity reports.
 *
 * @example
 * ```typescript
 * const stats: SessionStats = {
 *   totalSessions: 150,
 *   totalWorkSessions: 100,
 *   totalBreakSessions: 50,
 *   totalMinutesWorked: 2500,
 *   totalBreakMinutes: 200,
 *   pomodorosCompleted: 85,
 *   totalPauses: 25,
 *   totalPauseSeconds: 750,
 *   completedSessions: 140,
 *   byType: {
 *     WORK: { count: 100, totalMinutes: 2500 },
 *     SHORT_BREAK: { count: 35, totalMinutes: 105 },
 *     LONG_BREAK: { count: 15, totalMinutes: 95 },
 *     CONTINUOUS: { count: 0, totalMinutes: 0 }
 *   }
 * };
 *
 * console.log(`Productivity: ${stats.pomodorosCompleted} pomodoros`);
 * console.log(`Focus score: ${(stats.totalMinutesWorked / (stats.totalMinutesWorked + stats.totalBreakMinutes) * 100).toFixed(1)}%`);
 * ```
 */
export interface SessionStats {
  /** Total number of sessions (work + break) */
  totalSessions: number;

  /** Total number of work sessions */
  totalWorkSessions: number;

  /** Total number of break sessions (short + long) */
  totalBreakSessions: number;

  /** Total minutes spent in work sessions */
  totalMinutesWorked: number;

  /** Total minutes spent in breaks */
  totalBreakMinutes: number;

  /** Number of completed pomodoro cycles (work + break) */
  pomodorosCompleted: number;

  /** Total number of times user paused a session */
  totalPauses: number;

  /** Total seconds spent in paused state */
  totalPauseSeconds: number;

  /** Number of sessions that were completed (not abandoned) */
  completedSessions: number;

  /** Breakdown of sessions by type */
  byType: {
    /** Work session statistics */
    WORK: { count: number; totalMinutes: number };

    /** Short break session statistics */
    SHORT_BREAK: { count: number; totalMinutes: number };

    /** Long break session statistics */
    LONG_BREAK: { count: number; totalMinutes: number };

    /** Continuous timer session statistics */
    CONTINUOUS: { count: number; totalMinutes: number };
  };
}

/**
 * Repository interface for TimeSession entity persistence operations.
 *
 * This interface defines the contract for time tracking data access, providing CRUD operations
 * plus specialized methods for finding active sessions, querying by date ranges, calculating
 * statistics, and retrieving sessions with related task and project data.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaTimerRepository implements TimerRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(session: TimeSession): Promise<TimeSession> {
 *     const data = await this.prisma.timeSession.create({
 *       data: {
 *         id: session.id,
 *         type: session.type,
 *         startedAt: session.startedAt,
 *         userId: session.userId,
 *         taskId: session.taskId,
 *         // ... other fields
 *       }
 *     });
 *     return new TimeSession(data);
 *   }
 *
 *   async findActiveSession(userId: string): Promise<TimeSession | null> {
 *     const data = await this.prisma.timeSession.findFirst({
 *       where: { userId, finishedAt: null }
 *     });
 *     return data ? new TimeSession(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/time-session.entity.ts | TimeSession entity}
 */
export interface TimerRepository {
  /**
   * Creates a new time tracking session in the repository.
   *
   * Used when starting a new work session or break session through the timer UI.
   * The session should have all required fields populated before calling this method.
   *
   * @param session - The time session entity to create (must be valid)
   * @returns Promise resolving to the created session with any database-generated fields populated
   * @throws {Error} If session validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const session = new TimeSession({
   *   type: 'WORK',
   *   userId: 'user-123',
   *   taskId: 'task-456',
   *   startedAt: new Date(),
   *   duration: 25 * 60 // 25 minutes in seconds
   * });
   *
   * const created = await repository.create(session);
   * console.log(`Session started with ID: ${created.id}`);
   * ```
   */
  create(session: TimeSession): Promise<TimeSession>;

  /**
   * Updates an existing time session in the repository.
   *
   * Used when finishing a session, pausing/resuming, or updating session metadata.
   * The session entity should already exist and be valid before calling this method.
   *
   * @param session - The time session entity with updated fields
   * @returns Promise resolving to the updated session
   * @throws {NotFoundException} If the session doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('session-123');
   * if (existing) {
   *   const completed = existing.clone({
   *     finishedAt: new Date(),
   *     actualDuration: 1500 // 25 minutes in seconds
   *   });
   *   await repository.update(completed);
   * }
   * ```
   */
  update(session: TimeSession): Promise<TimeSession>;

  /**
   * Finds a time session by its unique ID.
   *
   * Used for fetching session details when the ID is known, such as from a URL parameter
   * or after creating/updating a session.
   *
   * @param id - The unique identifier of the time session
   * @returns Promise resolving to the session if found, null otherwise
   *
   * @example
   * ```typescript
   * const session = await repository.findById('session-123');
   * if (session) {
   *   console.log(`Found ${session.type} session: ${session.duration} minutes`);
   * } else {
   *   console.log('Session not found');
   * }
   * ```
   */
  findById(id: string): Promise<TimeSession | null>;

  /**
   * Finds the currently active session for a user (unfinished session).
   *
   * Used to determine if a user has a timer running. Returns the most recent session
   * that doesn't have a finishedAt timestamp. Should be called when opening the timer
   * UI to check if there's an active session to resume or display.
   *
   * @param userId - The user ID to find the active session for
   * @returns Promise resolving to the active session if found, null otherwise
   *
   * @example
   * ```typescript
   * const activeSession = await repository.findActiveSession('user-123');
   * if (activeSession) {
   *   console.log(`Active ${activeSession.type} session found`);
   *   // Resume session in timer UI
   *   timerUI.resumeSession(activeSession);
   * } else {
   *   console.log('No active session');
   *   // Show "Start Timer" button
   * }
   * ```
   */
  findActiveSession(userId: string): Promise<TimeSession | null>;

  /**
   * Finds all time sessions associated with a specific task.
   *
   * Used for displaying the time history for a task, showing all work sessions
   * and breaks that were tracked for that task.
   *
   * @param taskId - The task ID to find sessions for
   * @returns Promise resolving to an array of sessions for the task (empty array if none found)
   *
   * @example
   * ```typescript
   * const sessions = await repository.findByTaskId('task-456');
   * console.log(`Task has ${sessions.length} time sessions`);
   *
   * // Calculate total time spent on task
   * const totalSeconds = sessions
   *   .filter(s => s.finishedAt)
   *   .reduce((sum, s) => sum + (s.actualDuration || 0), 0);
   * console.log(`Total time: ${Math.floor(totalSeconds / 60)} minutes`);
   * ```
   */
  findByTaskId(taskId: string): Promise<TimeSession[]>;

  /**
   * Finds all time sessions for a user.
   *
   * Used for displaying the user's complete time tracking history, typically in a
   * time log or activity view. Returns all sessions ordered by start date descending.
   *
   * @param userId - The user ID to find sessions for
   * @returns Promise resolving to an array of all sessions for the user (empty array if none found)
   *
   * @example
   * ```typescript
   * const sessions = await repository.findByUserId('user-123');
   * console.log(`User has ${sessions.length} total sessions`);
   *
   * // Group by date
   * const byDate = sessions.reduce((acc, session) => {
   *   const date = session.startedAt.toISOString().split('T')[0];
   *   (acc[date] ||= []).push(session);
   *   return acc;
   * }, {} as Record<string, TimeSession[]>);
   * ```
   */
  findByUserId(userId: string): Promise<TimeSession[]>;

  /**
   * Finds time sessions for a user within a specific date range.
   *
   * Used for analytics, reports, and time tracking views that focus on a specific
   * period (e.g., "This Week", "Last Month", "Custom Range").
   *
   * @param userId - The user ID to find sessions for
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to an array of sessions within the date range (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get sessions for the current week
   * const now = new Date();
   * const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
   * const endOfWeek = new Date(now.setDate(now.getDate() + 6));
   *
   * const sessions = await repository.findByUserIdAndDateRange(
   *   'user-123',
   *   startOfWeek,
   *   endOfWeek
   * );
   *
   * console.log(`Found ${sessions.length} sessions this week`);
   * ```
   */
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSession[]>;

  /**
   * Finds time sessions with advanced filtering and pagination.
   *
   * Used for time session history views with filters, allowing users to search and
   * browse their time tracking data efficiently. Supports filtering by task, type,
   * date range, and completion status.
   *
   * @param userId - The user ID to find sessions for
   * @param filters - Filter criteria to apply (task, type, date range, completion status)
   * @param pagination - Pagination parameters (page, limit)
   * @returns Promise resolving to paginated sessions with metadata
   *
   * @example
   * ```typescript
   * // Find all completed work sessions from January, paginated
   * const result = await repository.findWithFilters(
   *   'user-123',
   *   {
   *     type: 'WORK',
   *     startDate: new Date('2025-01-01'),
   *     endDate: new Date('2025-01-31'),
   *     completedOnly: true
   *   },
   *   { page: 1, limit: 20 }
   * );
   *
   * console.log(`Page ${result.page} of ${result.totalPages}`);
   * console.log(`Showing ${result.sessions.length} of ${result.total} sessions`);
   * ```
   */
  findWithFilters(
    userId: string,
    filters: SessionFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedSessions>;

  /**
   * Calculates comprehensive time tracking statistics for a user.
   *
   * Used for analytics dashboards, productivity reports, and insights. Provides
   * aggregated metrics about work time, break time, pomodoros completed, pauses,
   * and breakdowns by session type. Can be scoped to a specific date range.
   *
   * @param userId - The user ID to calculate statistics for
   * @param startDate - Optional start date for the statistics period (defaults to all time)
   * @param endDate - Optional end date for the statistics period (defaults to all time)
   * @returns Promise resolving to session statistics with detailed metrics
   *
   * @example
   * ```typescript
   * // Get statistics for the current month
   * const now = new Date();
   * const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   * const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
   *
   * const stats = await repository.getStats('user-123', startOfMonth, endOfMonth);
   *
   * console.log(`Total work time: ${stats.totalMinutesWorked} minutes`);
   * console.log(`Pomodoros completed: ${stats.pomodorosCompleted}`);
   * console.log(`Sessions paused: ${stats.totalPauses} times`);
   * console.log(`Work sessions: ${stats.byType.WORK.count}`);
   * console.log(`Short breaks: ${stats.byType.SHORT_BREAK.count}`);
   * ```
   */
  getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SessionStats>;

  /**
   * Calculates time tracking statistics for a specific task.
   *
   * Used for displaying task-level time metrics, such as in task cards or the
   * task detail view. Shows how many sessions were tracked for the task, total
   * time spent, completion rate, and last activity.
   *
   * @param userId - The user ID (for authorization and scoping)
   * @param taskId - The task ID to calculate statistics for
   * @returns Promise resolving to task time statistics
   *
   * @example
   * ```typescript
   * const stats = await repository.getTaskTimeStats('user-123', 'task-456');
   *
   * console.log(`Sessions: ${stats.totalSessions}`);
   * console.log(`Time spent: ${stats.totalMinutes} minutes`);
   * console.log(`Completed: ${stats.completedSessions}/${stats.totalSessions}`);
   *
   * if (stats.lastSessionAt) {
   *   console.log(`Last activity: ${stats.lastSessionAt.toLocaleString()}`);
   * }
   * ```
   */
  getTaskTimeStats(
    userId: string,
    taskId: string,
  ): Promise<{
    /** Total number of sessions tracked for this task */
    totalSessions: number;

    /** Total minutes spent on this task (sum of all completed sessions) */
    totalMinutes: number;

    /** Number of sessions that were completed (not abandoned) */
    completedSessions: number;

    /** Timestamp of the last session for this task */
    lastSessionAt?: Date;
  }>;

  /**
   * Finds time sessions with associated task and project data.
   *
   * Used for analytics views that need to display session context, such as
   * "Which projects did I work on this week?" or "How did I spend my time today?".
   * Returns sessions with nested task and project information for rich display.
   *
   * @param userId - The user ID to find sessions for
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to sessions with task and project data
   *
   * @example
   * ```typescript
   * // Get this week's sessions with project context
   * const sessions = await repository.findByUserIdWithTaskAndProject(
   *   'user-123',
   *   startOfWeek,
   *   endOfWeek
   * );
   *
   * // Group by project
   * const byProject = sessions.reduce((acc, session) => {
   *   const projectName = session.task?.project?.name || 'No Project';
   *   (acc[projectName] ||= []).push(session);
   *   return acc;
   * }, {} as Record<string, typeof sessions>);
   *
   * Object.entries(byProject).forEach(([project, projectSessions]) => {
   *   const totalMinutes = projectSessions.reduce((sum, s) =>
   *     sum + (s.duration || 0), 0
   *   );
   *   console.log(`${project}: ${Math.floor(totalMinutes / 60)} hours`);
   * });
   * ```
   */
  findByUserIdWithTaskAndProject(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      /** Unique identifier of the session */
      id: string;

      /** When the session started */
      startedAt: Date;

      /** Planned duration in seconds (null for continuous timer) */
      duration: number | null;

      /** Associated task with project information */
      task: {
        /** Task ID */
        id: string;

        /** Project information (null if task has no project) */
        project: {
          /** Project name */
          name: string;
        } | null;
      } | null;
    }>
  >;

  /**
   * Counts completed time sessions for a user with optional filters.
   *
   * Used for gamification features where users earn achievements based on
   * completed pomodoros, total sessions, etc. Supports filtering by session type.
   *
   * @param userId - The user ID to count sessions for
   * @param type - Optional session type filter (e.g., 'WORK', 'SHORT_BREAK', 'LONG_BREAK')
   * @returns Promise resolving to the count of completed sessions
   *
   * @example
   * ```typescript
   * // Count all completed pomodoros (WORK sessions)
   * const pomodoroCount = await repository.countCompletedSessions('user-123', 'WORK');
   * console.log(`User has completed ${pomodoroCount} pomodoros`);
   *
   * // Count all completed sessions regardless of type
   * const totalSessions = await repository.countCompletedSessions('user-123');
   * console.log(`User has completed ${totalSessions} sessions total`);
   * ```
   */
  countCompletedSessions(
    userId: string,
    type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
  ): Promise<number>;
}
