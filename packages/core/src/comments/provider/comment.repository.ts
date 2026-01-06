import { Comment } from "../model/comment.entity";

/**
 * Repository interface for Comment entity persistence operations.
 *
 * This interface defines the contract for Comment data access, providing CRUD
 * operations plus specialized methods for managing task comments and threaded replies.
 * Comments enable team collaboration by allowing discussions directly on tasks.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaCommentRepository implements CommentRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(comment: Comment): Promise<Comment> {
 *     const data = await this.prisma.comment.create({
 *       data: {
 *         id: comment.id,
 *         taskId: comment.taskId,
 *         userId: comment.userId,
 *         content: comment.content,
 *         parentCommentId: comment.parentCommentId,
 *         mentions: comment.mentions,
 *         isEdited: comment.isEdited,
 *         editedAt: comment.editedAt,
 *         createdAt: comment.createdAt,
 *         updatedAt: comment.updatedAt,
 *       }
 *     });
 *     return new Comment(data);
 *   }
 *
 *   async findByTaskId(taskId: string): Promise<Comment[]> {
 *     const comments = await this.prisma.comment.findMany({
 *       where: { taskId },
 *       orderBy: { createdAt: 'asc' }
 *     });
 *     return comments.map(comment => new Comment(comment));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 */
export interface CommentRepository {
  /**
   * Creates a new comment in the repository.
   *
   * Used when a user posts a new comment on a task. The comment
   * should have all required fields populated before calling this method.
   *
   * @param comment - The comment entity to create (must be valid)
   * @returns Promise resolving to the created comment with any database-generated fields populated
   * @throws {Error} If comment validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Let me handle this task',
   *   mentions: ['user-789']
   * });
   *
   * const created = await repository.create(comment);
   * console.log(`Comment created with ID: ${created.id}`);
   * ```
   */
  create(comment: Comment): Promise<Comment>;

  /**
   * Updates an existing comment in the repository.
   *
   * Used when a user edits their comment content or adds/removes mentions.
   * The comment entity should already exist and be valid before calling this method.
   *
   * @param comment - The comment entity with updated fields
   * @returns Promise resolving to the updated comment
   * @throws {Error} If the comment doesn't exist or validation fails
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('comment-123');
   * if (existing) {
   *   const updated = existing.edit('Updated text with more details');
   *   await repository.update(updated);
   * }
   * ```
   */
  update(comment: Comment): Promise<Comment>;

  /**
   * Finds a comment by its unique ID.
   *
   * Used for fetching comment details when the ID is known, such as from
   * a URL parameter or after creating/updating a comment.
   *
   * @param id - The unique identifier of the comment
   * @returns Promise resolving to the comment if found, null otherwise
   *
   * @example
   * ```typescript
   * const comment = await repository.findById('comment-123');
   * if (comment) {
   *   console.log(`Found comment: ${comment.content}`);
   * } else {
   *   console.log('Comment not found');
   * }
   * ```
   */
  findById(id: string): Promise<Comment | null>;

  /**
   * Finds all comments for a specific task.
   *
   * Used for displaying the comment thread on a task detail view.
   * Returns comments ordered by creation time (oldest first) for
   * proper conversation flow display.
   *
   * @param taskId - The task ID to find comments for
   * @returns Promise resolving to an array of comments (empty array if none found)
   *
   * @example
   * ```typescript
   * const comments = await repository.findByTaskId('task-123');
   * console.log(`Found ${comments.length} comments`);
   *
   * // Render comment thread
   * comments.forEach(comment => {
   *   console.log(`${comment.userId}: ${comment.content}`);
   * });
   * ```
   */
  findByTaskId(taskId: string): Promise<Comment[]>;

  /**
   * Finds all comments created by a specific user.
   *
   * Used for displaying a user's comment history or activity feed.
   *
   * @param userId - The user ID to find comments for
   * @returns Promise resolving to an array of comments (empty array if none found)
   *
   * @example
   * ```typescript
   * const userComments = await repository.findByUserId('user-456');
   * console.log(`User has posted ${userComments.length} comments`);
   * ```
   */
  findByUserId(userId: string): Promise<Comment[]>;

  /**
   * Finds all replies to a specific comment.
   *
   * Used for displaying threaded replies in a nested comment structure.
   * This enables conversations within conversations on tasks.
   *
   * @param parentCommentId - The parent comment ID to find replies for
   * @returns Promise resolving to an array of reply comments (empty array if none found)
   *
   * @example
   * ```typescript
   * const replies = await repository.findByParentCommentId('comment-123');
   * console.log(`Found ${replies.length} replies`);
   * ```
   */
  findByParentCommentId(parentCommentId: string): Promise<Comment[]>;

  /**
   * Finds comments where a specific user is mentioned.
   *
   * Used for generating notifications and displaying "mentions" feeds.
   * Returns all comments containing the user's ID in the mentions array.
   *
   * @param userId - The user ID to find mentions for
   * @returns Promise resolving to an array of comments where the user is mentioned
   *
   * @example
   * ```typescript
   * const mentions = await repository.findMentionsForUser('user-789');
   * console.log(`User mentioned in ${mentions.length} comments`);
   *
   * // Send notifications
   * mentions.forEach(comment => {
   *   sendNotification(comment.userId, `You were mentioned in a comment on ${comment.taskId}`);
   * });
   * ```
   */
  findMentionsForUser(userId: string): Promise<Comment[]>;

  /**
   * Deletes a comment from the repository.
   *
   * WARNING: This permanently deletes the comment and cannot be undone.
   * For soft delete functionality, consider implementing a separate method.
   *
   * @param id - The unique identifier of the comment to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {Error} If the comment doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('comment-123');
   * console.log('Comment deleted permanently');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Counts the total number of comments for a specific task.
   *
   * Useful for displaying comment counts in task lists and badges.
   *
   * @param taskId - The task ID to count comments for
   * @returns Promise resolving to the count of comments
   *
   * @example
   * ```typescript
   * const count = await repository.countByTaskId('task-123');
   * console.log(`Task has ${count} comments`);
   * ```
   */
  countByTaskId(taskId: string): Promise<number>;

  /**
   * Finds all comments mentioning the user within a specific task.
   *
   * Combines task filtering with mention filtering for targeted notifications.
   *
   * @param taskId - The task ID to filter by
   * @param userId - The user ID to find mentions for
   * @returns Promise resolving to an array of comments where the user is mentioned in the task
   *
   * @example
   * ```typescript
   * const mentions = await repository.findMentionsForUserInTask('task-123', 'user-789');
   * if (mentions.length > 0) {
   *   console.log(`You have ${mentions.length} mentions in this task`);
   * }
   * ```
   */
  findMentionsForUserInTask(taskId: string, userId: string): Promise<Comment[]>;
}
