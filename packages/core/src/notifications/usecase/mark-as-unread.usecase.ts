import { UseCase } from "../../shared/use-case";
import { Notification } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for marking a notification as unread.
 *
 * Both fields are required to ensure the user owns the notification.
 */
export interface MarkAsUnreadInput {
  /**
   * The ID of the notification to mark as unread.
   */
  notificationId: string;

  /**
   * The ID of the user who owns the notification.
   * Used to verify ownership before marking as unread.
   */
  userId: string;
}

/**
 * Use case for marking a notification as unread.
 *
 * This use case handles marking a specific notification as unread,
 * which updates the isRead flag to false and clears the readAt timestamp.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - If already unread, returns the notification unchanged (idempotent)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsUnreadUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log(`Notification marked as unread`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Notification doesn't exist
 * - User doesn't own the notification
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class MarkAsUnreadUseCase
  implements UseCase<MarkAsUnreadInput, Notification>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the mark as unread use case.
   *
   * Finds the notification, verifies ownership, and marks it as unread.
   *
   * @param input - The mark as unread input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated notification
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   * console.log(notification.isRead); // false
   * ```
   */
  async execute(
    input: MarkAsUnreadInput,
    _loggedUser?: unknown,
  ): Promise<Notification> {
    // Validate required fields
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error("Notification ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Find the notification
    const notification = await this.notificationRepository.findById(
      input.notificationId.trim(),
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Verify ownership
    if (notification.userId !== input.userId.trim()) {
      throw new Error("You do not have permission to mark this notification as unread");
    }

    // Mark as unread (idempotent - no-op if already unread)
    const updated = notification.markAsUnread();

    // Persist the update
    await this.notificationRepository.update(updated);

    return updated;
  }
}
