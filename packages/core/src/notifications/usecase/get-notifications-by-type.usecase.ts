import { UseCase } from "../../shared/use-case";
import { Notification, NotificationType } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for getting notifications by type.
 *
 * The user ID and type are required.
 */
export interface GetNotificationsByTypeInput {
  /**
   * The ID of the user to get notifications for.
   */
  userId: string;

  /**
   * The notification type to filter by.
   */
  type: NotificationType;
}

/**
 * Use case for getting notifications of a specific type for a user.
 *
 * This use case retrieves all notifications of a specific type
 * for a user, useful for filtering and grouping notifications.
 *
 * ## Business Rules
 *
 * - Only returns notifications belonging to the user
 * - Only returns notifications of the specified type
 * - Results are ordered by creation time (newest first)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetNotificationsByTypeUseCase(notificationRepository);
 *
 * const notifications = await useCase.execute({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED
 * });
 *
 * console.log(`Found ${notifications.length} task assignment notifications`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Type is missing
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class GetNotificationsByTypeUseCase
  implements UseCase<GetNotificationsByTypeInput, Notification[]>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the get notifications by type use case.
   *
   * Retrieves all notifications of the specified type for the user.
   *
   * @param input - The get notifications by type input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of notifications of the specified type
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notifications = await useCase.execute({
   *   userId: 'user-123',
   *   type: NotificationType.COMMENT_ADDED
   * });
   *
   * notifications.forEach(n => {
   *   console.log(`${n.title}: ${n.message}`);
   * });
   * ```
   */
  async execute(
    input: GetNotificationsByTypeInput,
    _loggedUser?: unknown,
  ): Promise<Notification[]> {
    // Validate required fields
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!input.type) {
      throw new Error("Notification type is required");
    }

    // Get notifications by type
    const notifications = await this.notificationRepository.findByType(
      input.userId.trim(),
      input.type,
    );

    return notifications;
  }
}
