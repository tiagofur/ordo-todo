import { DailyMetrics } from "../model/daily-metrics.entity";

/**
 * Repository interface for DailyMetrics entity persistence operations.
 *
 * This interface defines the contract for analytics data access, providing methods
 * for saving daily productivity metrics and retrieving them by date ranges. Metrics
 * include tasks completed, time worked, pomodoros completed, and focus scores.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAnalyticsRepository implements AnalyticsRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(metrics: DailyMetrics): Promise<void> {
 *     await this.prisma.dailyMetrics.upsert({
 *       where: {
 *         userId_date: {
 *           userId: metrics.userId,
 *           date: metrics.date
 *         }
 *       },
 *       update: {
 *         tasksCompleted: metrics.tasksCompleted,
 *         minutesWorked: metrics.minutesWorked,
 *         pomodorosCompleted: metrics.pomodorosCompleted,
 *         focusScore: metrics.focusScore
 *       },
 *       create: {
 *         id: metrics.id,
 *         userId: metrics.userId,
 *         date: metrics.date,
 *         tasksCompleted: metrics.tasksCompleted,
 *         minutesWorked: metrics.minutesWorked,
 *         pomodorosCompleted: metrics.pomodorosCompleted,
 *         focusScore: metrics.focusScore,
 *         createdAt: metrics.createdAt
 *       }
 *     });
 *   }
 *
 *   async findByDate(userId: string, date: Date): Promise<DailyMetrics | null> {
 *     const data = await this.prisma.dailyMetrics.findUnique({
 *       where: {
 *         userId_date: {
 *           userId,
 *           date: this.normalizeDate(date)
 *         }
 *       }
 *     });
 *     return data ? new DailyMetrics(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/daily-metrics.entity.ts | DailyMetrics entity}
 */
export interface AnalyticsRepository {
  /**
   * Saves or updates daily metrics for a user.
   *
   * Used to persist daily productivity metrics after a time session is completed
   * or when recalculating metrics for a specific date. If metrics already exist
   * for the user+date combination, they are updated (upsert operation).
   *
   * @param metrics - The daily metrics entity to save (must be valid)
   * @returns Promise resolving when the save is complete
   * @throws {Error} If metrics validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * // After completing a pomodoro session
   * const metrics = new DailyMetrics({
   *   userId: 'user-123',
   *   date: new Date(),
   *   tasksCompleted: 5,
   *   minutesWorked: 125,
   *   pomodorosCompleted: 4,
   *   focusScore: 0.85
   * });
   *
   * await repository.save(metrics);
   * console.log('Daily metrics saved');
   * ```
   */
  save(metrics: DailyMetrics): Promise<void>;

  /**
   * Finds daily metrics for a specific user and date.
   *
   * Used for retrieving metrics for a single day, such as displaying today's
   * productivity summary in the dashboard. Returns null if no metrics exist
   * for that date (e.g., user hasn't tracked any time yet).
   *
   * @param userId - The user ID to find metrics for
   * @param date - The date to find metrics for (time component is ignored)
   * @returns Promise resolving to the daily metrics if found, null otherwise
   *
   * @example
   * ```typescript
   * const metrics = await repository.findByDate('user-123', new Date());
   * if (metrics) {
   *   console.log(`Today's productivity:`);
   *   console.log(`Tasks completed: ${metrics.tasksCompleted}`);
   *   console.log(`Time worked: ${metrics.minutesWorked} minutes`);
   *   console.log(`Pomodoros: ${metrics.pomodorosCompleted}`);
   *   console.log(`Focus score: ${(metrics.focusScore * 100).toFixed(0)}%`);
   * } else {
   *   console.log('No activity recorded today');
   * }
   * ```
   */
  findByDate(userId: string, date: Date): Promise<DailyMetrics | null>;

  /**
   * Retrieves daily metrics for a user within a date range.
   *
   * Used for displaying analytics charts and reports over a period, such as
   * "Last 7 Days", "This Month", or custom date ranges. Returns metrics
   * ordered by date ascending (oldest first).
   *
   * @param userId - The user ID to find metrics for
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to an array of daily metrics (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get metrics for the current week
   * const now = new Date();
   * const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
   * const endOfWeek = new Date(now.setDate(now.getDate() + 6));
   *
   * const metrics = await repository.getRange('user-123', startOfWeek, endOfWeek);
   * console.log(`Found ${metrics.length} days with metrics`);
   *
   * // Calculate weekly averages
   * const avgTasks = metrics.reduce((sum, m) => sum + m.tasksCompleted, 0) / metrics.length;
   * const avgFocus = metrics.reduce((sum, m) => sum + m.focusScore, 0) / metrics.length;
   * console.log(`Average tasks/day: ${avgTasks.toFixed(1)}`);
   * console.log(`Average focus: ${(avgFocus * 100).toFixed(0)}%`);
   *
   * // Render weekly chart
   * metrics.forEach(m => {
   *   console.log(`${m.date.toISOString().split('T')[0]}: ${m.tasksCompleted} tasks, ${(m.focusScore * 100).toFixed(0)}% focus`);
   * });
   * ```
   */
  getRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyMetrics[]>;

  /**
   * Retrieves the most recent daily metrics for a user.
   *
   * Used for dashboard widgets showing "Recent Activity" or "Last 7 Days".
   * Returns metrics ordered by date descending (newest first), limited to
   * the specified number of records.
   *
   * @param userId - The user ID to find metrics for
   * @param limit - Maximum number of recent records to return (e.g., 7 for last week)
   * @returns Promise resolving to an array of recent daily metrics (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get last 7 days of metrics for dashboard
   * const recentMetrics = await repository.getRangeDescending('user-123', 7);
   * console.log(`Showing ${recentMetrics.length} recent days`);
   *
   * // Render activity heatmap or mini chart
   * recentMetrics.forEach(metrics => {
   *   const dayName = metrics.date.toLocaleDateString('en-US', { weekday: 'short' });
   *   const focusPercent = Math.round(metrics.focusScore * 100);
   *   console.log(`${dayName}: ${metrics.tasksCompleted} tasks (${focusPercent}% focus)`);
   * });
   *
   * // Calculate streak (consecutive days with activity)
   * let streak = 0;
   * for (const m of recentMetrics) {
   *   if (m.minutesWorked > 0) streak++;
   *     else break;
   *   }
   *   console.log(`Current streak: ${streak} days`);
   * }
   * ```
   */
  getRangeDescending(userId: string, limit: number): Promise<DailyMetrics[]>;
}
