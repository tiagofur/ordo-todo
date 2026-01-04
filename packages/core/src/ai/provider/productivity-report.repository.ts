import { ProductivityReport, ReportScope } from "../model/productivity-report.entity";

/**
 * Repository interface for ProductivityReport entity persistence operations.
 *
 * This interface defines the contract for AI-generated productivity report data access,
 * providing methods for saving, retrieving, and querying reports by user, task, project,
 * or scope. Reports contain insights, recommendations, and productivity analysis.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaProductivityReportRepository implements ProductivityReportRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(report: ProductivityReport): Promise<ProductivityReport> {
 *     const data = await this.prisma.productivityReport.create({
 *       data: {
 *         id: report.id,
 *         userId: report.userId,
 *         scope: report.scope,
 *         taskId: report.taskId,
 *         projectId: report.projectId,
 *         insights: report.insights,
 *         recommendations: report.recommendations,
 *         metrics: report.metrics,
 *         generatedAt: report.generatedAt
 *       }
 *     });
 *     return new ProductivityReport(data);
 *   }
 *
 *   async findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null> {
 *     const data = await this.prisma.productivityReport.findFirst({
 *       where: { userId, scope },
 *       orderBy: { generatedAt: 'desc' }
 *     });
 *     return data ? new ProductivityReport(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/productivity-report.entity.ts | ProductivityReport entity}
 */
export interface ProductivityReportRepository {
  /**
   * Saves a new productivity report.
   *
   * Used when AI generates a new productivity report for a user, task, or project.
   * Creates a new report record with insights, recommendations, and metrics.
   *
   * @param report - The productivity report entity to save (must be valid)
   * @returns Promise resolving to the saved report with any database-generated fields populated
   * @throws {Error} If report validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const report = new ProductivityReport({
   *   userId: 'user-123',
   *   scope: 'TASK',
   *   taskId: 'task-456',
   *   insights: [
   *     'Strong focus maintained throughout the task',
   *     'Completed 25% faster than average'
   *   ],
   *   recommendations: [
   *     'Consider scheduling similar tasks in the morning',
   *     'Take regular breaks to maintain productivity'
   *   ],
   *   metrics: {
   *     focusScore: 0.92,
   *     timeSpent: 120,
   *     completionRate: 1.0
   *   },
   *   generatedAt: new Date()
   * });
   *
   * const saved = await repository.save(report);
   * console.log(`Productivity report saved with ID: ${saved.id}`);
   * ```
   */
  save(report: ProductivityReport): Promise<ProductivityReport>;

  /**
   * Finds a productivity report by its unique ID.
   *
   * Used for retrieving a specific report when the ID is known, such as from a URL parameter
   * or after creating a report.
   *
   * @param id - The unique identifier of the productivity report
   * @returns Promise resolving to the report if found, null otherwise
   *
   * @example
   * ```typescript
   * const report = await repository.findById('report-abc-123');
   * if (report) {
   *   console.log(`Report for ${report.scope}: ${report.taskId || report.projectId || 'overall'}`);
   *   console.log(`Generated at: ${report.generatedAt}`);
   *   report.insights.forEach(insight => console.log(`- ${insight}`));
   * } else {
   *   console.log('Report not found');
   * }
   * ```
   */
  findById(id: string): Promise<ProductivityReport | null>;

  /**
   * Finds all productivity reports for a user.
   *
   * Used for displaying a user's report history, such as in a reports list view.
   * Supports optional filtering by scope and pagination.
   *
   * @param userId - The user ID to find reports for
   * @param options - Optional filtering and pagination parameters
   * @returns Promise resolving to an array of productivity reports (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get all task-level reports, paginated
   * const reports = await repository.findByUserId('user-123', {
   *   scope: 'TASK',
   *   limit: 20,
   *   offset: 0
   * });
   *
   * console.log(`Found ${reports.length} task reports`);
   * reports.forEach(report => {
   *   console.log(`${report.taskId}: ${report.insights.length} insights`);
   * });
   * ```
   */
  findByUserId(userId: string, options?: {
    /** Filter reports by scope (TASK, PROJECT, WORKSPACE, DAILY, WEEKLY) */
    scope?: ReportScope;

    /** Maximum number of reports to return */
    limit?: number;

    /** Number of reports to skip (for pagination) */
    offset?: number;
  }): Promise<ProductivityReport[]>;

  /**
   * Finds all productivity reports for a specific task.
   *
   * Used for displaying AI analysis and insights for a particular task.
   * Returns reports ordered by generation date (newest first).
   *
   * @param taskId - The task ID to find reports for
   * @returns Promise resolving to an array of task reports (empty array if none found)
   *
   * @example
   * ```typescript
   * const reports = await repository.findByTaskId('task-456');
   * console.log(`Task has ${reports.length} AI reports`);
   *
   * // Display latest insights
   * if (reports.length > 0) {
   *   const latest = reports[0];
   *   console.log('Latest Insights:');
   *   latest.insights.forEach(insight => console.log(`• ${insight}`));
   *   console.log('\nRecommendations:');
   *   latest.recommendations.forEach(rec => console.log(`• ${rec}`));
   * }
   * ```
   */
  findByTaskId(taskId: string): Promise<ProductivityReport[]>;

  /**
   * Finds all productivity reports for a specific project.
   *
   * Used for displaying AI analysis and insights for a particular project.
   * Returns reports ordered by generation date (newest first).
   *
   * @param projectId - The project ID to find reports for
   * @returns Promise resolving to an array of project reports (empty array if none found)
   *
   * @example
   * ```typescript
   * const reports = await repository.findByProjectId('proj-789');
   * console.log(`Project has ${reports.length} AI reports`);
   *
   * // Aggregate insights across all reports
   * const allInsights = reports.flatMap(r => r.insights);
   * console.log(`Total insights: ${allInsights.length}`);
   * ```
   */
  findByProjectId(projectId: string): Promise<ProductivityReport[]>;

  /**
   * Finds the latest productivity report for a specific scope.
   *
   * Used for displaying the most recent AI analysis for a given scope level
   * (e.g., latest daily report, latest task report).
   *
   * @param userId - The user ID to find the report for
   * @param scope - The report scope to filter by (DAILY, WEEKLY, TASK, PROJECT, etc.)
   * @returns Promise resolving to the latest report if found, null otherwise
   *
   * @example
   * ```typescript
   * // Get the latest daily report
   * const dailyReport = await repository.findLatestByScope('user-123', 'DAILY');
   * if (dailyReport) {
   *   console.log(`Latest daily report from ${dailyReport.generatedAt}`);
   *   console.log(`Focus score: ${(dailyReport.metrics.focusScore * 100).toFixed(0)}%`);
   *   dailyReport.recommendations.forEach(rec => console.log(`• ${rec}`));
   * }
   *
   * // Get the latest task report
   * const taskReport = await repository.findLatestByScope('user-123', 'TASK');
   * if (taskReport) {
   *   console.log(`Latest task analysis for ${taskReport.taskId}`);
   * }
   * ```
   */
  findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null>;

  /**
   * Deletes a productivity report.
   *
   * Used when removing old or unwanted reports. Typically used for cleanup
   * or when a user deletes a task/project (cascade delete).
   *
   * @param id - The unique identifier of the report to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the report doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('report-abc-123');
   * console.log('Productivity report deleted');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Counts the total number of productivity reports for a user.
   *
   * Used for displaying report counts, pagination calculations, or analytics.
   * Can be filtered by scope to count specific report types.
   *
   * @param userId - The user ID to count reports for
   * @param scope - Optional scope filter to count only specific report types
   * @returns Promise resolving to the total count of reports
   *
   * @example
   * ```typescript
   * // Count all reports
   * const totalReports = await repository.countByUserId('user-123');
   * console.log(`User has ${totalReports} total reports`);
   *
   * // Count only daily reports
   * const dailyReports = await repository.countByUserId('user-123', 'DAILY');
   * console.log(`User has ${dailyReports} daily reports`);
   *
   * // Calculate pages for pagination (20 per page)
   * const totalPages = Math.ceil(totalReports / 20);
   * console.log(`Total pages: ${totalPages}`);
   * ```
   */
  countByUserId(userId: string, scope?: ReportScope): Promise<number>;
}
