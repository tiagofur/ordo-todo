import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for adding a mention to a comment.
 */
export interface AddMentionInput {
  /**
   * The ID of the comment to add the mention to.
   */
  commentId: string;

  /**
   * The ID of the user to mention.
   * This user will receive a notification about the mention.
   */
  userIdToMention: string;
}

/**
 * Use case for adding a user mention to an existing comment.
 *
 * This use case handles adding user mentions to comments, which triggers
 * notifications for the mentioned users. Mentions enable direct communication
 * within task comments.
 *
 * ## Business Rules
 *
 * - The comment must exist
 * - The user to mention must be a valid user ID
 * - Duplicate mentions are ignored (idempotent operation)
 * - Adding a mention updates the comment's updatedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new AddMentionUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userIdToMention: 'user-789'
 * });
 *
 * console.log(`User mentioned. Total mentions: ${updated.mentionCount}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID to mention is missing or invalid
 * - Comment doesn't exist
 * - Repository operation fails
 *
 * ## Idempotency
 *
 * This operation is idempotent - adding a mention for a user who is
 * already mentioned will return the comment unchanged without error.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class AddMentionUseCase implements UseCase<AddMentionInput, Comment> {
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the add mention use case.
   *
   * Adds a user mention to the specified comment. If the user is already
   * mentioned, the comment is returned unchanged.
   *
   * @param input - The input containing comment ID and user ID to mention
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or comment doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userIdToMention: 'user-789'
   * });
   *
   * // Trigger notification for mentioned user
   * if (updated.hasMention('user-789')) {
   *   await sendMentionNotification('user-789', updated.id);
   * }
   * ```
   */
  async execute(
    input: AddMentionInput,
    _loggedUser?: unknown,
  ): Promise<Comment> {
    // Validate required fields
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }

    if (
      !input.userIdToMention ||
      input.userIdToMention.trim().length === 0
    ) {
      throw new Error("User ID to mention is required");
    }

    // Find the existing comment
    const existingComment = await this.commentRepository.findById(
      input.commentId,
    );

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // Add the mention using the entity's addMention method
    const updatedComment = existingComment.addMention(input.userIdToMention);

    // Only persist if actually changed (entity handles idempotency)
    await this.commentRepository.update(updatedComment);

    return updatedComment;
  }
}
