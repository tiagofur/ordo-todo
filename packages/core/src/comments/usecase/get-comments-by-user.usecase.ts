import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for retrieving comments by user.
 */
export interface GetCommentsByUserInput {
  /**
   * The ID of the user to retrieve comments for.
   */
  userId: string;
}

/**
 * Use case for retrieving all comments created by a specific user.
 *
 * This use case handles fetching all comments authored by a user,
 * which is useful for displaying user activity feeds or comment history.
 *
 * ## Business Rules
 *
 * - Returns all comments created by the specified user
 * - Comments are ordered by creation time (most recent first typically)
 * - Returns an empty array if the user has no comments
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetCommentsByUserUseCase(commentRepository);
 *
 * const comments = await useCase.execute({
 *   userId: 'user-456'
 * });
 *
 * console.log(`User has posted ${comments.length} comments`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - User has no comments
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class GetCommentsByUserUseCase
  implements UseCase<GetCommentsByUserInput, Comment[]>
{
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the get comments by user use case.
   *
   * Retrieves all comments created by the specified user.
   *
   * @param input - The input containing the user ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of comments (empty if none found)
   * @throws {Error} If user ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const comments = await useCase.execute({
   *   userId: 'user-456'
   * });
   *
   * // Display user's comment history
   * return (
   *   <UserCommentHistory comments={comments} />
   * );
   * ```
   */
  async execute(
    input: GetCommentsByUserInput,
    _loggedUser?: unknown,
  ): Promise<Comment[]> {
    // Validate user ID
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Retrieve comments by the user
    const comments = await this.commentRepository.findByUserId(
      input.userId,
    );

    return comments;
  }
}
