import { WorkspaceAuditLog } from "../model/workspace-audit-log.entity";

/**
 * Repository interface for WorkspaceAuditLog entity persistence operations.
 *
 * This interface defines the contract for workspace audit trail data access, providing
 * methods for recording and querying workspace activity logs. Audit logs track important
 * events such as membership changes, permission updates, invitations, and settings modifications.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceAuditLogRepository implements WorkspaceAuditLogRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog> {
 *     const data = await this.prisma.workspaceAuditLog.create({
 *       data: {
 *         id: log.id,
 *         workspaceId: log.workspaceId,
 *         action: log.action,
 *         actorId: log.actorId,
 *         targetId: log.targetId,
 *         targetType: log.targetType,
 *         metadata: log.metadata,
 *         createdAt: log.createdAt
 *       }
 *     });
 *     return new WorkspaceAuditLog(data);
 *   }
 *
 *   async findByWorkspaceId(
 *     workspaceId: string,
 *     limit = 50,
 *     offset = 0
 *   ): Promise<WorkspaceAuditLog[]> {
 *     const logs = await this.prisma.workspaceAuditLog.findMany({
 *       where: { workspaceId },
 *       orderBy: { createdAt: 'desc' },
 *       take: limit,
 *       skip: offset
 *     });
 *     return logs.map(l => new WorkspaceAuditLog(l));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-audit-log.entity.ts | WorkspaceAuditLog entity}
 */
export interface WorkspaceAuditLogRepository {
  /**
   * Creates a new audit log entry.
   *
   * Used for recording important workspace events and actions, such as member additions,
   * role changes, permission updates, invitation acceptance/rejection, and settings changes.
   * Each log entry captures who did what, when, and to what target.
   *
   * @param log - The audit log entry to create (must be valid)
   * @returns Promise resolving to the created audit log entry
   * @throws {Error} If log validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const log = new WorkspaceAuditLog({
   *   workspaceId: 'workspace-123',
   *   action: 'MEMBER_ADDED',
   *   actorId: 'user-456',
   *   targetId: 'user-789',
   *   targetType: 'USER',
   *   metadata: {
   *     role: 'MEMBER',
   *     invitedBy: 'user-456'
   *   }
   * });
   *
   * const created = await repository.create(log);
   * console.log(`Audit log created: ${created.action} by ${created.actorId}`);
   * ```
   */
  create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog>;

  /**
   * Retrieves audit logs for a specific workspace.
   *
   * Used for displaying workspace activity history, such as in an "Activity Log" or
   * "Audit Trail" view. Returns logs ordered by most recent first. Supports pagination
   * for handling large numbers of log entries.
   *
   * @param workspaceId - The workspace ID to fetch audit logs for
   * @param limit - Maximum number of log entries to return (default: 50)
   * @param offset - Number of entries to skip for pagination (default: 0)
   * @returns Promise resolving to an array of audit log entries (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get the 50 most recent log entries
   * const recentLogs = await repository.findByWorkspaceId('workspace-123');
   * console.log(`Found ${recentLogs.length} recent activity logs`);
   *
   * // Get paginated logs
   * const page1 = await repository.findByWorkspaceId('workspace-123', 20, 0);
   * const page2 = await repository.findByWorkspaceId('workspace-123', 20, 20);
   *
   * // Display activity timeline
   * recentLogs.forEach(log => {
   *   const timestamp = log.createdAt.toLocaleString();
   *   console.log(`[${timestamp}] ${log.action} on ${log.targetType} ${log.targetId}`);
   * });
   * ```
   */
  findByWorkspaceId(
    workspaceId: string,
    limit?: number,
    offset?: number
  ): Promise<WorkspaceAuditLog[]>;

  /**
   * Counts the total number of audit log entries for a workspace.
   *
   * Used for displaying activity statistics, calculating pagination,
   * or showing metrics like "X activities this month".
   *
   * @param workspaceId - The workspace ID to count audit logs for
   * @returns Promise resolving to the total count of audit log entries
   *
   * @example
   * ```typescript
   * const totalCount = await repository.countByWorkspaceId('workspace-123');
   * console.log(`Total activity log entries: ${totalCount}`);
   *
   * // Calculate pagination
   * const pageSize = 20;
   * const totalPages = Math.ceil(totalCount / pageSize);
   * console.log(`Total pages: ${totalPages}`);
   *
   * // Show activity summary
   * console.log(`Workspace has ${totalCount} recorded activities`);
   * ```
   */
  countByWorkspaceId(workspaceId: string): Promise<number>;
}
