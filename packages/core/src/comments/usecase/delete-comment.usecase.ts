import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for deleting a comment.
 */
export interface DeleteCommentInput {
  /**
   * The ID of the comment to delete.
   */
  commentId: string;

  /**
   * The ID of the user attempting to delete the comment.
   * Must be the original author of the comment.
   */
  userId: string;
}

/**
 * Use case for deleting a comment.
 *
 * This use case handles the permanent deletion of comments by their authors.
 * Once deleted, a comment cannot be recovered.
 *
 * ## Business Rules
 *
 * - Only the comment author can delete their own comment
 * - Deletion is permanent (consider soft delete for undo functionality)
 * - All replies to the comment should also be handled (application-specific)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteCommentUseCase(commentRepository);
 *
 * await useCase.execute({
 *   commentId: 'comment-123',
 *   userId: 'user-456'
 * });
 *
 * console.log('Comment deleted');
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID is missing or invalid
 * - Comment doesn't exist
 * - User is not the comment author
 *
 * ## Threaded Comments
 *
 * For threaded comments, consider whether deleting a parent comment
 * should also delete its replies. This is application-specific logic
 * that may be implemented in the repository or a separate use case.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class DeleteCommentUseCase implements UseCase<DeleteCommentInput, void> {
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the delete comment use case.
   *
   * Permanently deletes a comment if the user is the author.
   *
   * @param input - The delete input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise that resolves when the comment is deleted
   * @throws {Error} If validation fails or user is not the author
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   commentId: 'comment-123',
   *   userId: 'user-456'
   * });
   * ```
   */
  async execute(
    input: DeleteCommentInput,
    _loggedUser?: unknown,
  ): Promise<void> {
    // Validate required fields
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Find the existing comment
    const existingComment = await this.commentRepository.findById(
      input.commentId,
    );

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // Verify ownership - only the author can delete
    if (existingComment.userId !== input.userId) {
      throw new Error("You can only delete your own comments");
    }

    // Permanently delete the comment
    await this.commentRepository.delete(input.commentId);
  }
}
