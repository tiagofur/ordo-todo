import { UseCase } from "../../shared/use-case";
import { Notification } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for marking a notification as read.
 *
 * Both fields are required to ensure the user owns the notification.
 */
export interface MarkAsReadInput {
  /**
   * The ID of the notification to mark as read.
   */
  notificationId: string;

  /**
   * The ID of the user who owns the notification.
   * Used to verify ownership before marking as read.
   */
  userId: string;
}

/**
 * Use case for marking a notification as read.
 *
 * This use case handles marking a specific notification as read,
 * which updates the isRead flag and sets the readAt timestamp.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - If already read, returns the notification unchanged (idempotent)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsReadUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log(`Notification marked as read at: ${notification.readAt}`);
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
export class MarkAsReadUseCase
  implements UseCase<MarkAsReadInput, Notification>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the mark as read use case.
   *
   * Finds the notification, verifies ownership, and marks it as read.
   *
   * @param input - The mark as read input data
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
   * console.log(notification.isRead); // true
   * ```
   */
  async execute(
    input: MarkAsReadInput,
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
      throw new Error("You do not have permission to mark this notification as read");
    }

    // Mark as read (idempotent - no-op if already read)
    const updated = notification.markAsRead();

    // Persist the update
    await this.notificationRepository.update(updated);

    return updated;
  }
}
