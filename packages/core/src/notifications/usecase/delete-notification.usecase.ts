import { UseCase } from "../../shared/use-case";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for deleting a notification.
 *
 * Both fields are required to ensure the user owns the notification.
 */
export interface DeleteNotificationInput {
  /**
   * The ID of the notification to delete.
   */
  notificationId: string;

  /**
   * The ID of the user who owns the notification.
   * Used to verify ownership before deletion.
   */
  userId: string;
}

/**
 * Use case for deleting a notification.
 *
 * This use case handles permanent deletion of a notification,
 * after verifying that the user owns it.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - Deletion is permanent and cannot be undone
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteNotificationUseCase(notificationRepository);
 *
 * await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log('Notification deleted');
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
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class DeleteNotificationUseCase implements UseCase<DeleteNotificationInput, void> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the delete notification use case.
   *
   * Finds the notification, verifies ownership, and deletes it permanently.
   *
   * @param input - The delete notification input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving when the deletion is complete
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   * ```
   */
  async execute(
    input: DeleteNotificationInput,
    _loggedUser?: unknown,
  ): Promise<void> {
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
      throw new Error("You do not have permission to delete this notification");
    }

    // Delete the notification
    await this.notificationRepository.delete(input.notificationId.trim());
  }
}
