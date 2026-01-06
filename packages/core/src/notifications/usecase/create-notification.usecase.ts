import { UseCase } from "../../shared/use-case";
import { Notification, NotificationType, ResourceType } from "../model/notification.entity";
import { NotificationRepository } from "../provider/notification.repository";

/**
 * Input for creating a new notification.
 *
 * All fields are required unless marked optional.
 */
export interface CreateNotificationInput {
  /**
   * The ID of the user who will receive this notification.
   * The user must exist for the notification to be created.
   */
  userId: string;

  /**
   * The type/category of this notification.
   * Determines how the notification is displayed and grouped.
   */
  type: NotificationType;

  /**
   * The notification title/headline.
   * Must be between 1 and 200 characters.
   */
  title: string;

  /**
   * Optional detailed message.
   * If provided, must be between 1 and 1000 characters.
   */
  message?: string;

  /**
   * Optional ID of the related resource (task, project, etc.).
   * Used for navigation and deep linking.
   */
  resourceId?: string;

  /**
   * Optional type of the related resource.
   * Used with resourceId for polymorphic associations.
   */
  resourceType?: ResourceType;

  /**
   * Optional metadata for navigation (e.g., workspaceId, projectId).
   * Stored as JSON in the database.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Use case for creating a new notification.
 *
 * This use case handles the creation of notifications, which keep
 * users informed about relevant events in their workspace.
 *
 * ## Business Rules
 *
 * - The user must exist (checked via repository)
 * - Title must be between 1 and 200 characters
 * - Message (if provided) must be between 1 and 1000 characters
 * - User ID is required
 * - Type must be a valid NotificationType
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateNotificationUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK,
 *   metadata: { workspaceId: 'ws-789' }
 * });
 *
 * console.log(`Notification created: ${notification.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Type is invalid
 * - Title is empty or too long
 * - Message is too long
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
export class CreateNotificationUseCase
  implements UseCase<CreateNotificationInput, Notification>
{
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Executes the create notification use case.
   *
   * Creates a new notification with the provided data.
   * The notification is validated before being persisted.
   *
   * @param input - The notification creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created notification
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   userId: 'user-123',
   *   type: NotificationType.COMMENT_ADDED,
   *   title: 'New comment on your task',
   *   message: 'Someone commented on your task'
   * });
   * ```
   */
  async execute(
    input: CreateNotificationInput,
    _loggedUser?: unknown,
  ): Promise<Notification> {
    // Validate required fields
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!input.type) {
      throw new Error("Notification type is required");
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Notification title is required");
    }

    // Trim title
    const trimmedTitle = input.title.trim();

    // Trim message if provided
    const trimmedMessage = input.message ? input.message.trim() : undefined;

    // Create the notification entity (validates via entity constructor)
    const notification = Notification.create({
      userId: input.userId.trim(),
      type: input.type,
      title: trimmedTitle,
      message: trimmedMessage,
      resourceId: input.resourceId ?? null,
      resourceType: input.resourceType ?? null,
      metadata: input.metadata ?? null,
    });

    // Persist the notification
    await this.notificationRepository.create(notification);

    return notification;
  }
}
