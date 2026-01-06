import { UseCase } from "../../shared/use-case";
import { Notification } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for getting a notification by ID.
 *
 * Both fields are required to ensure the user owns the notification.
 */
export interface GetNotificationByIdInput {
  /**
   * The ID of the notification to retrieve.
   */
  notificationId: string;

  /**
   * The ID of the user requesting the notification.
   * Used to verify ownership before returning the notification.
   */
  userId: string;
}

/**
 * Use case for getting a specific notification by ID.
 *
 * This use case retrieves a single notification and verifies
 * that the requesting user owns the notification.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - Returns null if notification doesn't exist or user doesn't own it
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetNotificationByIdUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * if (notification) {
 *   console.log(`Found: ${notification.title}`);
 * } else {
 *   console.log('Notification not found');
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Repository operations fail
 *
 * Returns null if the notification doesn't exist or user doesn't own it.
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class GetNotificationByIdUseCase
  implements UseCase<GetNotificationByIdInput, Notification | null>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the get notification by ID use case.
   *
   * Finds the notification and verifies ownership before returning it.
   *
   * @param input - The get notification by ID input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the notification if found and owned by user, null otherwise
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   *
   * if (notification) {
   *   console.log(notification.title);
   * }
   * ```
   */
  async execute(
    input: GetNotificationByIdInput,
    _loggedUser?: unknown,
  ): Promise<Notification | null> {
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

    // Verify ownership
    if (!notification || notification.userId !== input.userId.trim()) {
      return null;
    }

    return notification;
  }
}
