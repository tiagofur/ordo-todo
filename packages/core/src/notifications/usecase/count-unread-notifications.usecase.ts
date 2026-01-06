import { UseCase } from "../../shared/use-case";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for counting unread notifications.
 *
 * Only the user ID is required to count their unread notifications.
 */
export interface CountUnreadNotificationsInput {
  /**
   * The ID of the user to count unread notifications for.
   */
  userId: string;
}

/**
 * Output for counting unread notifications.
 *
 * Contains the count of unread notifications.
 */
export interface CountUnreadNotificationsOutput {
  /**
   * The number of unread notifications for the user.
   */
  count: number;
}

/**
 * Use case for counting unread notifications for a user.
 *
 * This use case provides the count of unread notifications,
 * useful for displaying notification badges.
 *
 * ## Business Rules
 *
 * - Only counts notifications belonging to the user
 * - Only counts unread notifications
 * - More efficient than fetching all notifications
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CountUnreadNotificationsUseCase(notificationRepository);
 *
 * const result = await useCase.execute({ userId: 'user-123' });
 *
 * console.log(`User has ${result.count} unread notifications`);
 *
 * // Display badge
 * if (result.count > 0) {
 *   showBadge(result.count);
 * }
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
export class CountUnreadNotificationsUseCase
  implements UseCase<CountUnreadNotificationsInput, CountUnreadNotificationsOutput>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the count unread notifications use case.
   *
   * Counts all unread notifications for the user.
   *
   * @param input - The count unread notifications input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the count of unread notifications
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const result = await useCase.execute({ userId: 'user-123' });
   * console.log(`Unread count: ${result.count}`);
   * ```
   */
  async execute(
    input: CountUnreadNotificationsInput,
    _loggedUser?: unknown,
  ): Promise<CountUnreadNotificationsOutput> {
    // Validate required fields
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Count unread notifications
    const count = await this.notificationRepository.countUnreadByUserId(
      input.userId.trim(),
    );

    return {
      count,
    };
  }
}
