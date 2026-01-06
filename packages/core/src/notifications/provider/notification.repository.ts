import { Notification } from "../model/notification.entity";
import { NotificationType } from "../model/notification.entity";

/**
 * Repository interface for Notification entity persistence operations.
 *
 * This interface defines the contract for Notification data access, providing CRUD
 * operations plus specialized methods for managing user notifications, filtering
 * by read status, type, and bulk operations. Notifications keep users informed
 * about relevant events in their workspace.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaNotificationRepository implements NotificationRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(notification: Notification): Promise<Notification> {
 *     const data = await this.prisma.notification.create({
 *       data: {
 *         id: notification.id,
 *         userId: notification.userId,
 *         type: notification.type,
 *         title: notification.title,
 *         message: notification.message,
 *         resourceId: notification.resourceId,
 *         resourceType: notification.resourceType,
 *         metadata: notification.metadata,
 *         isRead: notification.isRead,
 *         readAt: notification.readAt,
 *         createdAt: notification.createdAt,
 *         updatedAt: notification.updatedAt,
 *       }
 *     });
 *     return new Notification(data);
 *   }
 *
 *   async findByUserId(userId: string): Promise<Notification[]> {
 *     const notifications = await this.prisma.notification.findMany({
 *       where: { userId },
 *       orderBy: { createdAt: 'desc' }
 *     });
 *     return notifications.map(n => new Notification(n));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 */
export interface NotificationRepository {
  /**
   * Creates a new notification in the repository.
   *
   * Used when a new notification needs to be sent to a user. The notification
   * should have all required fields populated before calling this method.
   *
   * @param notification - The notification entity to create (must be valid)
   * @returns Promise resolving to the created notification with any database-generated fields populated
   * @throws {Error} If notification validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const notification = Notification.create({
   *   userId: 'user-123',
   *   type: NotificationType.TASK_ASSIGNED,
   *   title: 'New task assigned',
   *   message: 'You have been assigned to "Complete documentation"'
   * });
   *
   * const created = await repository.create(notification);
   * console.log(`Notification created with ID: ${created.id}`);
   * ```
   */
  create(notification: Notification): Promise<Notification>;

  /**
   * Updates an existing notification in the repository.
   *
   * Used when a notification's state changes, such as marking as read/unread.
   * The notification entity should already exist and be valid before calling this method.
   *
   * @param notification - The notification entity with updated fields
   * @returns Promise resolving to the updated notification
   * @throws {Error} If the notification doesn't exist or validation fails
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('notif-123');
   * if (existing) {
   *   const updated = existing.markAsRead();
   *   await repository.update(updated);
   * }
   * ```
   */
  update(notification: Notification): Promise<Notification>;

  /**
   * Finds a notification by its unique ID.
   *
   * Used for fetching notification details when the ID is known, such as from
   * a URL parameter or after creating/updating a notification.
   *
   * @param id - The unique identifier of the notification
   * @returns Promise resolving to the notification if found, null otherwise
   *
   * @example
   * ```typescript
   * const notification = await repository.findById('notif-123');
   * if (notification) {
   *   console.log(`Found notification: ${notification.title}`);
   * } else {
   *   console.log('Notification not found');
   * }
   * ```
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Finds all notifications for a specific user.
   *
   * Used for displaying the notification list for a user.
   * Returns notifications ordered by creation time (newest first).
   *
   * @param userId - The user ID to find notifications for
   * @returns Promise resolving to an array of notifications (empty array if none found)
   *
   * @example
   * ```typescript
   * const notifications = await repository.findByUserId('user-123');
   * console.log(`Found ${notifications.length} notifications`);
   *
   * // Render notification list
   * notifications.forEach(notification => {
   *   console.log(`${notification.type}: ${notification.title}`);
   * });
   * ```
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Finds all unread notifications for a specific user.
   *
   * Used for displaying the unread notification count and list.
   * Notifications are ordered by creation time (newest first).
   *
   * @param userId - The user ID to find unread notifications for
   * @returns Promise resolving to an array of unread notifications (empty array if none found)
   *
   * @example
   * ```typescript
   * const unreadNotifications = await repository.findUnreadByUserId('user-456');
   * console.log(`User has ${unreadNotifications.length} unread notifications`);
   *
   * // Show unread badge
   * if (unreadNotifications.length > 0) {
   *   showBadge(unreadNotifications.length);
   * }
   * ```
   */
  findUnreadByUserId(userId: string): Promise<Notification[]>;

  /**
   * Finds all read notifications for a specific user.
   *
   * Used for displaying the read notification history.
   * Notifications are ordered by creation time (newest first).
   *
   * @param userId - The user ID to find read notifications for
   * @returns Promise resolving to an array of read notifications (empty array if none found)
   *
   * @example
   * ```typescript
   * const readNotifications = await repository.findReadByUserId('user-789');
   * console.log(`User has read ${readNotifications.length} notifications`);
   * ```
   */
  findReadByUserId(userId: string): Promise<Notification[]>;

  /**
   * Finds all notifications of a specific type for a user.
   *
   * Used for filtering notifications by type/category.
   *
   * @param userId - The user ID to find notifications for
   * @param type - The notification type to filter by
   * @returns Promise resolving to an array of notifications of the specified type
   *
   * @example
   * ```typescript
   * const taskNotifications = await repository.findByType(
   *   'user-123',
   *   NotificationType.TASK_ASSIGNED
   * );
   * console.log(`Found ${taskNotifications.length} task assignment notifications`);
   * ```
   */
  findByType(userId: string, type: NotificationType): Promise<Notification[]>;

  /**
   * Finds all notifications of a specific priority level for a user.
   *
   * Used for displaying high-priority notifications separately.
   * High priority types include: TASK_ASSIGNED, MENTIONED, DUE_DATE_APPROACHING.
   *
   * @param userId - The user ID to find notifications for
   * @param priority - The priority level filter ('high' or 'low')
   * @returns Promise resolving to an array of notifications matching the priority
   *
   * @example
   * ```typescript
   * const importantNotifications = await repository.findByPriority('user-123', 'high');
   * // Display with special styling
   * ```
   */
  findByPriority(userId: string, priority: "high" | "low"): Promise<Notification[]>;

  /**
   * Deletes a notification from the repository.
   *
   * WARNING: This permanently deletes the notification and cannot be undone.
   *
   * @param id - The unique identifier of the notification to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {Error} If the notification doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('notif-123');
   * console.log('Notification deleted permanently');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Marks all notifications as read for a specific user.
   *
   * Used for bulk "mark all as read" functionality.
   * More efficient than updating each notification individually.
   *
   * @param userId - The user ID to mark all notifications as read for
   * @returns Promise resolving when the bulk update is complete
   *
   * @example
   * ```typescript
   * await repository.markAllAsRead('user-123');
   * console.log('All notifications marked as read');
   * ```
   */
  markAllAsRead(userId: string): Promise<void>;

  /**
   * Counts the total number of unread notifications for a specific user.
   *
   * Useful for displaying notification badges and counts.
   * More efficient than fetching all unread notifications.
   *
   * @param userId - The user ID to count unread notifications for
   * @returns Promise resolving to the count of unread notifications
   *
   * @example
   * ```typescript
   * const count = await repository.countUnreadByUserId('user-123');
   * console.log(`User has ${count} unread notifications`);
   *
   * // Display badge
   * if (count > 0) {
   *   showBadge(count);
   * }
   * ```
   */
  countUnreadByUserId(userId: string): Promise<number>;

  /**
   * Deletes all expired notifications from the repository.
   *
   * Used for periodic cleanup of old notifications.
   * Currently returns 0 as notifications don't have expiration.
   * This method is provided for future extensibility.
   *
   * @returns Promise resolving to the number of notifications deleted
   *
   * @example
   * ```typescript
   * // Run daily cleanup job
   * const deleted = await repository.deleteExpired();
   * console.log(`Cleaned up ${deleted} expired notifications`);
   * ```
   */
  deleteExpired(): Promise<number>;

  /**
   * Deletes notifications older than a specified number of days.
   *
   * Used for periodic cleanup of old, read notifications.
   *
   * @param days - The number of days (notifications older than this will be deleted)
   * @returns Promise resolving to the number of notifications deleted
   *
   * @example
   * ```typescript
   * // Delete notifications older than 30 days
   * const deleted = await repository.deleteOlderThan(30);
   * console.log(`Deleted ${deleted} old notifications`);
   * ```
   */
  deleteOlderThan(days: number): Promise<number>;
}
