import { Entity, EntityProps, EntityMode } from "../../shared/entity";
import { COMMENT_LIMITS } from "../../shared/constants/limits.constants";

/**
 * Properties for creating a Comment entity.
 *
 * Comments represent user discussions on tasks, supporting threaded
 * replies and user mentions for collaboration.
 *
 * @example
 * ```typescript
 * const comment = new Comment({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Please review this task',
 *   mentions: ['user-789']
 * });
 * ```
 */
export interface CommentProps extends EntityProps {
  /**
   * The ID of the task this comment belongs to.
   * Required - every comment must be associated with a task.
   */
  taskId: string;

  /**
   * The ID of the user who wrote this comment.
   * Required - every comment must have an author.
   */
  userId: string;

  /**
   * The comment text content.
   * Required - must be between 1 and 2000 characters.
   */
  content: string;

  /**
   * Optional parent comment ID for threaded replies.
   * If present, this comment is a reply to another comment.
   */
  parentCommentId?: string | null;

  /**
   * Array of user IDs mentioned in this comment.
   * Mentions trigger notifications for the mentioned users.
   */
  mentions?: string[];

  /**
   * Whether this comment has been edited.
   * Automatically set to true when edit() is called.
   */
  isEdited?: boolean;

  /**
   * Timestamp when the comment was last edited.
   * Automatically updated when edit() is called.
   */
  editedAt?: Date;

  /**
   * Timestamp when the comment was created.
   * Defaults to current time if not provided.
   */
  createdAt?: Date;

  /**
   * Timestamp when the comment was last updated.
   * Defaults to current time if not provided.
   */
  updatedAt?: Date;
}

/**
 * Represents a comment on a task.
 *
 * Comments enable team collaboration by allowing discussions
 * directly on tasks. They support threaded replies and user mentions.
 *
 * ## Business Rules
 *
 * - Content must be between 1 and 2000 characters
 * - Every comment must belong to a task
 * - Every comment must have an author
 * - Mentions are stored as an array of user IDs
 * - Comments are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Comment instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new comment
 * const comment = Comment.create({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Let me handle this'
 * });
 *
 * // Edit the content
 * const edited = comment.edit('Updated: I will handle this tomorrow');
 *
 * // Add a mention
 * const withMention = edited.addMention('user-789');
 *
 * // Check if user is mentioned
 * if (withMention.hasMention('user-789')) {
 *   // Send notification
 * }
 *
 * // Remove a mention
 * const final = withMention.removeMention('user-789');
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | COMMENT_LIMITS}
 */
export class Comment extends Entity<CommentProps> {
  constructor(props: CommentProps, mode: EntityMode = "valid") {
    super({
      ...props,
      mentions: props.mentions ?? [],
      isEdited: props.isEdited ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, mode);

    // Validate content if not in draft mode
    if (this.mode === "valid") {
      this.validateContent(props.content);
      this.validateTaskId(props.taskId);
      this.validateUserId(props.userId);
      this.validateMentions(props.mentions);
    }
  }

  /**
   * Creates a new comment with defaults applied.
   *
   * Factory method for creating comments without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Comment properties (id, timestamps auto-generated)
   * @returns A new Comment instance
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Great work!'
   * });
   * ```
   */
  static create(
    props: Omit<CommentProps, "id" | "isEdited" | "editedAt" | "createdAt" | "updatedAt">
  ): Comment {
    return new Comment({
      ...props,
      mentions: props.mentions ?? [],
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters for commonly accessed properties
  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get content(): string {
    return this.props.content;
  }

  get mentions(): string[] {
    return this.props.mentions ?? [];
  }

  get parentCommentId(): string | null | undefined {
    return this.props.parentCommentId;
  }

  get isEdited(): boolean {
    return this.props.isEdited ?? false;
  }

  get editedAt(): Date | undefined {
    return this.props.editedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  /**
   * Updates the comment content.
   *
   * Creates a new comment with updated content, marking it as edited.
   * The edit timestamp is automatically recorded.
   *
   * @param newContent - The new comment content (1-2000 characters)
   * @returns A new Comment instance with updated content
   * @throws {Error} If content is invalid
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Original text'
   * });
   *
   * const edited = comment.edit('Corrected text');
   * console.log(edited.isEdited); // true
   * console.log(edited.editedAt); // Date object
   * ```
   */
  edit(newContent: string): Comment {
    const trimmed = newContent.trim();
    this.validateContent(trimmed);

    return this.clone({
      content: trimmed,
      isEdited: true,
      editedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Adds a user mention to the comment.
   *
   * If the user is already mentioned, this returns the comment unchanged.
   * Mentions trigger notifications for the mentioned users.
   *
   * @param userId - The ID of the user to mention
   * @returns A new Comment instance with the mention added
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: '@user-789 please review'
   * });
   *
   * const withMention = comment.addMention('user-789');
   * console.log(withMention.mentions); // ['user-789']
   * ```
   */
  addMention(userId: string): Comment {
    if (!userId || userId.trim().length === 0) {
      throw new Error("User ID for mention cannot be empty");
    }

    const currentMentions = this.props.mentions ?? [];
    if (currentMentions.includes(userId)) {
      return this; // Already mentioned, return unchanged
    }

    return this.clone({
      mentions: [...currentMentions, userId],
      updatedAt: new Date(),
    });
  }

  /**
   * Removes a user mention from the comment.
   *
   * If the user is not mentioned, this returns the comment unchanged.
   *
   * @param userId - The ID of the user to unmention
   * @returns A new Comment instance with the mention removed
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Review',
   *   mentions: ['user-789', 'user-abc']
   * });
   *
   * const withoutMention = comment.removeMention('user-789');
   * console.log(withoutMention.mentions); // ['user-abc']
   * ```
   */
  removeMention(userId: string): Comment {
    const currentMentions = this.props.mentions ?? [];
    if (!currentMentions.includes(userId)) {
      return this; // Not mentioned, return unchanged
    }

    return this.clone({
      mentions: currentMentions.filter((id) => id !== userId),
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if a user is mentioned in this comment.
   *
   * Useful for determining if a notification should be sent.
   *
   * @param userId - The ID of the user to check
   * @returns true if the user is mentioned, false otherwise
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: '@user-789 please review',
   *   mentions: ['user-789']
   * });
   *
   * if (comment.hasMention('user-789')) {
   *   sendNotification('user-789', 'You were mentioned');
   * }
   * ```
   */
  hasMention(userId: string): boolean {
    return this.mentions.includes(userId);
  }

  /**
   * Checks if this comment is a reply to another comment.
   *
   * @returns true if this comment has a parent, false otherwise
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'I agree',
   *   parentCommentId: 'comment-123'
   * });
   *
   * console.log(comment.isReply()); // true
   * ```
   */
  isReply(): boolean {
    return this.props.parentCommentId !== null &&
           this.props.parentCommentId !== undefined &&
           this.props.parentCommentId.length > 0;
  }

  /**
   * Gets the number of users mentioned in this comment.
   *
   * @returns The count of unique mentioned users
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Team please review',
   *   mentions: ['user-789', 'user-abc', 'user-def']
   * });
   *
   * console.log(comment.mentionCount); // 3
   * ```
   */
  get mentionCount(): number {
    return this.mentions.length;
  }

  /**
   * Validates the comment content.
   *
   * @private
   * @param content - The content to validate
   * @throws {Error} If content is invalid
   */
  private validateContent(content: string): void {
    if (!content || typeof content !== "string") {
      throw new Error("Comment content is required");
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new Error("Comment content cannot be empty");
    }

    if (trimmed.length < COMMENT_LIMITS.CONTENT_MIN_LENGTH) {
      throw new Error(
        `Comment content must be at least ${COMMENT_LIMITS.CONTENT_MIN_LENGTH} character(s)`
      );
    }

    if (trimmed.length > COMMENT_LIMITS.CONTENT_MAX_LENGTH) {
      throw new Error(
        `Comment content cannot exceed ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Validates the task ID.
   *
   * @private
   * @param taskId - The task ID to validate
   * @throws {Error} If task ID is invalid
   */
  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
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
   * Validates the mentions array.
   *
   * @private
   * @param mentions - The mentions array to validate
   * @throws {Error} If mentions are invalid
   */
  private validateMentions(mentions?: string[]): void {
    if (mentions === undefined || mentions === null) {
      return; // Optional, valid to be undefined
    }

    if (!Array.isArray(mentions)) {
      throw new Error("Mentions must be an array");
    }

    for (const mention of mentions) {
      if (typeof mention !== "string" || mention.trim().length === 0) {
        throw new Error("Each mention must be a non-empty string");
      }
    }
  }

  /**
   * Creates a draft version of this comment.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Comment instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = comment.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft(): this {
    return this.clone(this.props, "draft");
  }

  /**
   * Converts this comment to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Comment instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Comment({ content: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if content is empty
   * ```
   */
  asValid(): this {
    return this.clone(this.props, "valid");
  }
}
