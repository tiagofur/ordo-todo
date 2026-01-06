import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for removing a mention from a comment.
 */
export interface RemoveMentionInput {
  /**
   * The ID of the comment to remove the mention from.
   */
  commentId: string;

  /**
   * The ID of the user to unmention.
   */
  userIdToUnmention: string;
}

/**
 * Use case for removing a user mention from an existing comment.
 *
 * This use case handles removing user mentions from comments, which may be
 * used when correcting mistakes or when a user requests to be unmentioned.
 *
 * ## Business Rules
 *
 * - The comment must exist
 * - The user ID to unmention must be a valid user ID
 * - Removing a non-existent mention is idempotent (no error)
 * - Removing a mention updates the comment's updatedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new RemoveMentionUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userIdToUnmention: 'user-789'
 * });
 *
 * console.log(`User unmentioned. Remaining mentions: ${updated.mentionCount}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID to unmention is missing or invalid
 * - Comment doesn't exist
 * - Repository operation fails
 *
 * ## Idempotency
 *
 * This operation is idempotent - removing a mention for a user who is
 * not mentioned will return the comment unchanged without error.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class RemoveMentionUseCase implements UseCase<RemoveMentionInput, Comment> {
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the remove mention use case.
   *
   * Removes a user mention from the specified comment. If the user is not
   * mentioned, the comment is returned unchanged.
   *
   * @param input - The input containing comment ID and user ID to unmention
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or comment doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userIdToUnmention: 'user-789'
   * });
   *
   * // Check if mention was removed
   * if (!updated.hasMention('user-789')) {
   *   console.log('User successfully unmentioned');
   * }
   * ```
   */
  async execute(
    input: RemoveMentionInput,
    _loggedUser?: unknown,
  ): Promise<Comment> {
    // Validate required fields
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }

    if (
      !input.userIdToUnmention ||
      input.userIdToUnmention.trim().length === 0
    ) {
      throw new Error("User ID to unmention is required");
    }

    // Find the existing comment
    const existingComment = await this.commentRepository.findById(
      input.commentId,
    );

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // Remove the mention using the entity's removeMention method
    const updatedComment = existingComment.removeMention(
      input.userIdToUnmention,
    );

    // Only persist if actually changed (entity handles idempotency)
    await this.commentRepository.update(updatedComment);

    return updatedComment;
  }
}
