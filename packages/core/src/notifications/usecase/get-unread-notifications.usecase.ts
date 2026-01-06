import { UseCase } from "../../shared/use-case";
import { Notification } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for getting unread notifications.
 *
 * The user ID is required, and limit is optional for pagination.
 */
export interface GetUnreadNotificationsInput {
  /**
   * The ID of the user to get unread notifications for.
   */
  userId: string;

  /**
   * Optional limit on the number of notifications to return.
   * If not specified, returns all unread notifications.
   */
  limit?: number;
}

/**
 * Use case for getting unread notifications for a user.
 *
 * This use case retrieves all unread notifications for a user,
 * ordered by creation time (newest first). High-priority
 * notifications are returned first.
 *
 * ## Business Rules
 *
 * - Only returns notifications belonging to the user
 * - Only returns unread notifications
 * - High-priority notifications (TASK_ASSIGNED, MENTIONED, DUE_DATE_APPROACHING) come first
 * - Results are ordered by creation time (newest first within each priority level)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetUnreadNotificationsUseCase(notificationRepository);
 *
 * const notifications = await useCase.execute({
 *   userId: 'user-123',
 *   limit: 20
 * });
 *
 * console.log(`Found ${notifications.length} unread notifications`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class GetUnreadNotificationsUseCase
  implements UseCase<GetUnreadNotificationsInput, Notification[]>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the get unread notifications use case.
   *
   * Retrieves all unread notifications for the user, ordered by
   * priority and creation time.
   *
   * @param input - The get unread notifications input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of unread notifications
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notifications = await useCase.execute({
   *   userId: 'user-123'
   * });
   *
   * notifications.forEach(n => {
   *   console.log(`${n.type}: ${n.title}`);
   * });
   * ```
   */
  async execute(
    input: GetUnreadNotificationsInput,
    _loggedUser?: unknown,
  ): Promise<Notification[]> {
    // Validate required fields
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    const userId = input.userId.trim();

    // Get all unread notifications
    const unreadNotifications =
      await this.notificationRepository.findUnreadByUserId(userId);

    // Sort by priority (high first) then by creation time (newest first)
    const sorted = unreadNotifications.sort((a, b) => {
      // High priority first
      const aHighPriority = a.isHighPriority();
      const bHighPriority = b.isHighPriority();

      if (aHighPriority && !bHighPriority) return -1;
      if (!aHighPriority && bHighPriority) return 1;

      // Same priority, sort by creation time (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Apply limit if specified (including 0 to return empty)
    if (input.limit !== undefined) {
      if (input.limit <= 0) {
        return [];
      }
      return sorted.slice(0, input.limit);
    }

    return sorted;
  }
}
