import { UseCase } from "../../shared/use-case";
import { Comment } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for retrieving comments by task.
 */
export interface GetCommentsByTaskInput {
  /**
   * The ID of the task to retrieve comments for.
   */
  taskId: string;
}

/**
 * Use case for retrieving all comments for a specific task.
 *
 * This use case handles fetching the complete comment thread for a task,
 * which is essential for displaying task discussions in the UI.
 *
 * ## Business Rules
 *
 * - Returns all comments for the specified task
 * - Comments are ordered chronologically (oldest first)
 * - Includes both top-level comments and threaded replies
 * - Returns an empty array if no comments exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetCommentsByTaskUseCase(commentRepository);
 *
 * const comments = await useCase.execute({
 *   taskId: 'task-123'
 * });
 *
 * console.log(`Found ${comments.length} comments`);
 * comments.forEach(comment => {
 *   console.log(`${comment.userId}: ${comment.content}`);
 * });
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - Task has no comments
 * - Task doesn't exist (application-specific - may throw instead)
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class GetCommentsByTaskUseCase
  implements UseCase<GetCommentsByTaskInput, Comment[]>
{
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the get comments by task use case.
   *
   * Retrieves all comments for the specified task, ordered chronologically.
   *
   * @param input - The input containing the task ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of comments (empty if none found)
   * @throws {Error} If task ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const comments = await useCase.execute({
   *   taskId: 'task-123'
 * });
   *
   * // Display comments in UI
   * return (
   *   <CommentThread comments={comments} />
   * );
   * ```
   */
  async execute(
    input: GetCommentsByTaskInput,
    _loggedUser?: unknown,
  ): Promise<Comment[]> {
    // Validate task ID
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }

    // Retrieve comments for the task
    const comments = await this.commentRepository.findByTaskId(
      input.taskId,
    );

    return comments;
  }
}
