import { UseCase } from "../../shared/use-case";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for marking all notifications as read.
 *
 * Only the user ID is required to mark all of their notifications as read.
 */
export interface MarkAllAsReadInput {
  /**
   * The ID of the user whose notifications should be marked as read.
   */
  userId: string;
}

/**
 * Output for marking all notifications as read.
 *
 * Contains information about how many notifications were marked as read.
 */
export interface MarkAllAsReadOutput {
  /**
   * The number of notifications that were marked as read.
   */
  count: number;
}

/**
 * Use case for marking all notifications as read for a user.
 *
 * This use case handles bulk marking all unread notifications as read,
 * which is useful for "mark all as read" functionality.
 *
 * ## Business Rules
 *
 * - Only unread notifications for the user are affected
 * - Returns the count of notifications marked as read
 * - More efficient than updating each notification individually
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAllAsReadUseCase(notificationRepository);
 *
 * const result = await useCase.execute({ userId: 'user-123' });
 *
 * console.log(`Marked ${result.count} notifications as read`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Repository operations fail
 *
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class MarkAllAsReadUseCase
  implements UseCase<MarkAllAsReadInput, MarkAllAsReadOutput>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the mark all as read use case.
   *
   * Marks all unread notifications for the user as read.
   *
   * @param input - The mark all as read input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the count of notifications marked as read
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const result = await useCase.execute({ userId: 'user-123' });
   * console.log(`Marked ${result.count} notifications as read`);
   * ```
   */
  async execute(
    input: MarkAllAsReadInput,
    _loggedUser?: unknown,
  ): Promise<MarkAllAsReadOutput> {
    // Validate required fields
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // First, count unread notifications
    const unreadCount = await this.notificationRepository.countUnreadByUserId(
      input.userId.trim(),
    );

    // Mark all as read via repository bulk operation
    await this.notificationRepository.markAllAsRead(input.userId.trim());

    return {
      count: unreadCount,
    };
  }
}
