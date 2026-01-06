import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for updating an existing comment.
 */
export interface UpdateCommentInput {
  /**
   * The ID of the comment to update.
   */
  commentId: string;

  /**
   * The ID of the user attempting to update the comment.
   * Must be the original author of the comment.
   */
  userId: string;

  /**
   * The new content for the comment.
   * Must be between 1 and 2000 characters.
   */
  newContent: string;
}

/**
 * Use case for updating an existing comment's content.
 *
 * This use case handles the editing of comments by their original authors.
 * When a comment is edited, it is marked as edited with a timestamp.
 *
 * ## Business Rules
 *
 * - Only the comment author can edit their own comment
 * - Content must be between 1 and 2000 characters
 * - The edit is tracked with isEdited flag and editedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new UpdateCommentUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userId: 'user-456',
 *   newContent: 'Updated: I will handle this tomorrow instead'
 * });
 *
 * console.log(updated.isEdited); // true
 * console.log(updated.editedAt); // Date object
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID is missing or invalid
 * - New content is empty or too long
 * - Comment doesn't exist
 * - User is not the comment author
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class UpdateCommentUseCase
  implements UseCase<UpdateCommentInput, Comment>
{
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the update comment use case.
   *
   * Updates the content of an existing comment if the user is the author.
   * The comment is marked as edited with a timestamp.
   *
   * @param input - The update input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or user is not the author
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userId: 'user-456',
   *   newContent: 'Corrected information'
   * });
   * ```
   */
  async execute(
    input: UpdateCommentInput,
    _loggedUser?: unknown,
  ): Promise<Comment> {
    // Validate required fields
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!input.newContent || input.newContent.trim().length === 0) {
      throw new Error("New content is required");
    }

    // Find the existing comment
    const existingComment = await this.commentRepository.findById(
      input.commentId,
    );

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    // Verify ownership - only the author can edit
    if (existingComment.userId !== input.userId) {
      throw new Error("You can only edit your own comments");
    }

    // Update the content using the entity's edit method
    const updatedComment = existingComment.edit(input.newContent.trim());

    // Persist the update
    await this.commentRepository.update(updatedComment);

    return updatedComment;
  }
}
