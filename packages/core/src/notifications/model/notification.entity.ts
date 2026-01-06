import { Entity, EntityProps, EntityMode } from "../../shared/entity";
import { NOTIFICATION_LIMITS } from "../../shared/constants/limits.constants";

/**
 * Notification type enum.
 *
 * Represents the category or reason for the notification.
 * These types determine how notifications are displayed and grouped.
 *
 * @example
 * ```typescript
 * const type = NotificationType.TASK_ASSIGNED;
 * ```
 */
export enum NotificationType {
  /** User was assigned to a task */
  TASK_ASSIGNED = "TASK_ASSIGNED",
  /** New comment added to a task */
  COMMENT_ADDED = "COMMENT_ADDED",
  /** User was mentioned in a comment */
  MENTIONED = "MENTIONED",
  /** Task due date is approaching */
  DUE_DATE_APPROACHING = "DUE_DATE_APPROACHING",
  /** User received a workspace invitation */
  INVITATION_RECEIVED = "INVITATION_RECEIVED",
  /** System-generated notification */
  SYSTEM = "SYSTEM",
  /** Task was completed */
  TASK_COMPLETED = "TASK_COMPLETED",
  /** Task status changed */
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  /** User was added to a workspace */
  WORKSPACE_ADDED = "WORKSPACE_ADDED",
  /** Project status changed */
  PROJECT_UPDATED = "PROJECT_UPDATED",
}

/**
 * Resource type enum.
 *
 * Represents the entity type that the notification refers to.
 * Used for polymorphic associations and navigation.
 */
export enum ResourceType {
  /** Notification refers to a task */
  TASK = "TASK",
  /** Notification refers to a project */
  PROJECT = "PROJECT",
  /** Notification refers to a workspace */
  WORKSPACE = "WORKSPACE",
  /** Notification refers to a comment */
  COMMENT = "COMMENT",
}

/**
 * Properties for creating a Notification entity.
 *
 * Notifications represent messages sent to users about relevant events
 * in their workspace, such as task assignments, mentions, and due dates.
 *
 * @example
 * ```typescript
 * const notification = new Notification({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK
 * });
 * ```
 */
export interface NotificationProps extends EntityProps {
  /**
   * The ID of the user who will receive this notification.
   * Required - every notification must have a recipient.
   */
  userId: string;

  /**
   * The type/category of this notification.
   * Required - determines how the notification is displayed.
   */
  type: NotificationType;

  /**
   * The notification title/headline.
   * Required - must be between 1 and 200 characters.
   */
  title: string;

  /**
   * Optional detailed message.
   * If provided, must be between 1 and 1000 characters.
   */
  message?: string | null;

  /**
   * Optional ID of the related resource (task, project, etc.).
   * Used for navigation and deep linking.
   */
  resourceId?: string | null;

  /**
   * Optional type of the related resource.
   * Used with resourceId for polymorphic associations.
   */
  resourceType?: ResourceType | null;

  /**
   * Optional metadata for navigation (e.g., workspaceId, projectId).
   * Stored as JSON in the database.
   */
  metadata?: Record<string, unknown> | null;

  /**
   * Whether the notification has been read by the user.
   * Defaults to false for new notifications.
   */
  isRead?: boolean;

  /**
   * Timestamp when the notification was marked as read.
   * Null if the notification is unread.
   */
  readAt?: Date | null;

  /**
   * Timestamp when the notification was created.
   * Defaults to current time if not provided.
   */
  createdAt?: Date;

  /**
   * Timestamp when the notification was last updated.
   * Defaults to current time if not provided.
   */
  updatedAt?: Date;
}

/**
 * Represents a notification for a user.
 *
 * Notifications keep users informed about relevant events in their workspace,
 * such as task assignments, mentions, comments, and approaching due dates.
 *
 * ## Business Rules
 *
 * - Title must be between 1 and 200 characters
 * - Message (if provided) must be between 1 and 1000 characters
 * - Every notification must have a recipient (userId)
 * - Every notification must have a type
 * - Notifications are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Notification instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new notification
 * const notification = Notification.create({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK,
 *   metadata: { workspaceId: 'ws-789' }
 * });
 *
 * // Mark as read
 * const read = notification.markAsRead();
 * console.log(read.isRead); // true
 * console.log(read.readAt); // Date object
 *
 * // Check if high priority
 * if (notification.isOlderThan(7 * 24 * 60 * 60 * 1000)) {
 *   console.log('This notification is more than a week old');
 * }
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | NOTIFICATION_LIMITS}
 */
export class Notification extends Entity<NotificationProps> {
  constructor(props: NotificationProps, mode: EntityMode = "valid") {
    super({
      ...props,
      isRead: props.isRead ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, mode);

    // Validate all properties if not in draft mode
    if (this.mode === "valid") {
      this.validateUserId(props.userId);
      this.validateType(props.type);
      this.validateTitle(props.title);
      this.validateMessage(props.message);
      this.validateResourceType(props.resourceType);
      this.validateMetadata(props.metadata);
      this.validateResourceId(props.resourceId);
    }
  }

  /**
   * Creates a new notification with defaults applied.
   *
   * Factory method for creating notifications without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Notification properties (id, timestamps auto-generated)
   * @returns A new Notification instance
   *
   * @example
   * ```typescript
   * const notification = Notification.create({
   *   userId: 'user-123',
   *   type: NotificationType.TASK_ASSIGNED,
   *   title: 'New task assigned',
   *   message: 'You have been assigned to a new task'
   * });
   * ```
   */
  static create(
    props: Omit<NotificationProps, "id" | "isRead" | "readAt" | "createdAt" | "updatedAt">
  ): Notification {
    return new Notification({
      ...props,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters for commonly accessed properties
  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string | null | undefined {
    return this.props.message;
  }

  get resourceId(): string | null | undefined {
    return this.props.resourceId;
  }

  get resourceType(): ResourceType | null | undefined {
    return this.props.resourceType;
  }

  get metadata(): Record<string, unknown> | null | undefined {
    return this.props.metadata;
  }

  get isRead(): boolean {
    return this.props.isRead ?? false;
  }

  get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  /**
   * Marks the notification as read.
   *
   * Sets the isRead flag to true and records the read timestamp.
   * If already read, returns the same notification (idempotent).
   *
   * @returns A new Notification instance marked as read
   *
   * @example
   * ```typescript
   * const notification = Notification.create({ ... });
   * const read = notification.markAsRead();
   * console.log(read.isRead); // true
   * console.log(read.readAt); // Date object
   * ```
   */
  markAsRead(): Notification {
    if (this.props.isRead === true) {
      return this; // Already read, return unchanged
    }

    return this.clone({
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Marks the notification as unread.
   *
   * Sets the isRead flag to false and clears the read timestamp.
   * If already unread, returns the same notification (idempotent).
   *
   * @returns A new Notification instance marked as unread
   *
   * @example
   * ```typescript
   * const readNotification = notification.markAsRead();
   * const unread = readNotification.markAsUnread();
   * console.log(unread.isRead); // false
   * console.log(unread.readAt); // null
   * ```
   */
  markAsUnread(): Notification {
    if (this.props.isRead === false) {
      return this; // Already unread, return unchanged
    }

    return this.clone({
      isRead: false,
      readAt: null,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if the notification is expired.
   *
   * Currently returns false as notifications don't have an expiration
   * timestamp in the base schema. This method is provided for future
   * extensibility.
   *
   * @returns true if the notification is expired, false otherwise
   *
   * @example
   * ```typescript
   * if (!notification.isExpired()) {
   *   // Display the notification
   * }
   * ```
   */
  isExpired(): boolean {
    // Notifications don't currently have expiration
    // This method is provided for future extensibility
    return false;
  }

  /**
   * Checks if the notification is high priority.
   *
   * High priority notifications include task assignments, mentions,
   * and due date approaching. These should be displayed more prominently.
   *
   * @returns true if the notification is high priority, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isHighPriority()) {
   *   // Show with special styling or sound
   * }
   * ```
   */
  isHighPriority(): boolean {
    const highPriorityTypes = [
      NotificationType.TASK_ASSIGNED,
      NotificationType.MENTIONED,
      NotificationType.DUE_DATE_APPROACHING,
    ];
    return highPriorityTypes.includes(this.props.type);
  }

  /**
   * Checks if the notification has an associated resource.
   *
   * Notifications with resources can provide deep links to the
   * relevant task, project, or other entity.
   *
   * @returns true if the notification has a resourceId, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isActionable()) {
   *   // Show "View" button that links to the resource
   * }
   * ```
   */
  isActionable(): boolean {
    return this.props.resourceId !== null &&
           this.props.resourceId !== undefined &&
           this.props.resourceId.length > 0;
  }

  /**
   * Gets the age of the notification in milliseconds.
   *
   * @returns The age in milliseconds since creation
   *
   * @example
   * ```typescript
   * const ageInMinutes = notification.getAge() / 60000;
   * console.log(`Notification is ${ageInMinutes} minutes old`);
   * ```
   */
  getAge(): number {
    return Date.now() - this.props.createdAt!.getTime();
  }

  /**
   * Checks if the notification is older than a specified time.
   *
   * Useful for filtering out stale notifications or applying
   * different display rules based on age.
   *
   * @param ms - The age threshold in milliseconds
   * @returns true if the notification is older than the threshold, false otherwise
   *
   * @example
   * ```typescript
   * // Check if notification is more than a day old
   * if (notification.isOlderThan(24 * 60 * 60 * 1000)) {
   *   console.log('This notification is old');
   * }
   * ```
   */
  isOlderThan(ms: number): boolean {
    return this.getAge() > ms;
  }

  /**
   * Gets the metadata value for a specific key.
   *
   * @param key - The metadata key to retrieve
   * @param defaultValue - The default value if the key doesn't exist
   * @returns The metadata value or the default
   *
   * @example
   * ```typescript
   * const workspaceId = notification.getMetadata('workspaceId', '');
   * const projectId = notification.getMetadata<string>('projectId');
   * ```
   */
  getMetadata<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const metadata = this.props.metadata;
    if (metadata && typeof metadata === "object" && key in metadata) {
      return metadata[key] as T;
    }
    return defaultValue;
  }

  /**
   * Checks if this is a task-related notification.
   *
   * @returns true if the notification refers to a task, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isTaskNotification()) {
   *   console.log('Navigate to task:', notification.resourceId);
   * }
   * ```
   */
  isTaskNotification(): boolean {
    return this.props.resourceType === ResourceType.TASK;
  }

  /**
   * Checks if this is a project-related notification.
   *
   * @returns true if the notification refers to a project, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isProjectNotification()) {
   *   console.log('Navigate to project:', notification.resourceId);
   * }
   * ```
   */
  isProjectNotification(): boolean {
    return this.props.resourceType === ResourceType.PROJECT;
  }

  /**
   * Checks if this is a workspace-related notification.
   *
   * @returns true if the notification refers to a workspace, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isWorkspaceNotification()) {
   *   console.log('Navigate to workspace:', notification.resourceId);
   * }
   * ```
   */
  isWorkspaceNotification(): boolean {
    return this.props.resourceType === ResourceType.WORKSPACE;
  }

  /**
   * Validates the user ID.
   *
   * @private
   * @param userId - The user ID to validate
   * @throws {Error} If user ID is invalid
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
  }

  /**
   * Validates the notification type.
   *
   * @private
   * @param type - The notification type to validate
   * @throws {Error} If type is invalid
   */
  private validateType(type: NotificationType): void {
    if (!type || typeof type !== "string") {
      throw new Error("Notification type is required");
    }

    const validTypes = Object.values(NotificationType);
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid notification type. Must be one of: ${validTypes.join(", ")}`
      );
    }
  }

  /**
   * Validates the notification title.
   *
   * @private
   * @param title - The title to validate
   * @throws {Error} If title is invalid
   */
  private validateTitle(title: string): void {
    if (!title || typeof title !== "string") {
      throw new Error("Notification title is required");
    }

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new Error("Notification title cannot be empty");
    }

    if (trimmed.length < NOTIFICATION_LIMITS.TITLE_MIN_LENGTH) {
      throw new Error(
        `Notification title must be at least ${NOTIFICATION_LIMITS.TITLE_MIN_LENGTH} character(s)`
      );
    }

    if (trimmed.length > NOTIFICATION_LIMITS.TITLE_MAX_LENGTH) {
      throw new Error(
        `Notification title cannot exceed ${NOTIFICATION_LIMITS.TITLE_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Validates the notification message.
   *
   * @private
   * @param message - The message to validate (optional)
   * @throws {Error} If message is invalid
   */
  private validateMessage(message?: string | null): void {
    if (message === undefined || message === null || message === "") {
      return; // Message is optional
    }

    if (typeof message !== "string") {
      throw new Error("Notification message must be a string");
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return; // Empty message is treated as no message
    }

    if (trimmed.length > NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH) {
      throw new Error(
        `Notification message cannot exceed ${NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Validates the resource type.
   *
   * @private
   * @param resourceType - The resource type to validate (optional)
   * @throws {Error} If resource type is invalid
   */
  private validateResourceType(resourceType?: ResourceType | null): void {
    if (resourceType === undefined || resourceType === null) {
      return; // Optional
    }

    const validTypes = Object.values(ResourceType);
    if (!validTypes.includes(resourceType)) {
      throw new Error(
        `Invalid resource type. Must be one of: ${validTypes.join(", ")}`
      );
    }
  }

  /**
   * Validates the resource ID.
   *
   * @private
   * @param resourceId - The resource ID to validate (optional)
   * @throws {Error} If resource ID is invalid
   */
  private validateResourceId(resourceId?: string | null): void {
    if (resourceId === undefined || resourceId === null || resourceId === "") {
      return; // Optional
    }

    if (typeof resourceId !== "string") {
      throw new Error("Resource ID must be a string");
    }

    if (resourceId.trim().length === 0) {
      return; // Empty is treated as no resource
    }
  }

  /**
   * Validates the metadata object.
   *
   * @private
   * @param metadata - The metadata to validate (optional)
   * @throws {Error} If metadata is invalid
   */
  private validateMetadata(metadata?: Record<string, unknown> | null): void {
    if (metadata === undefined || metadata === null) {
      return; // Optional
    }

    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("Notification metadata must be an object");
    }
  }

  /**
   * Creates a draft version of this notification.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Notification instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = notification.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft(): this {
    return this.clone(this.props, "draft");
  }

  /**
   * Converts this notification to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Notification instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Notification({ title: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if title is empty
   * ```
   */
  asValid(): this {
    return this.clone(this.props, "valid");
  }
}
