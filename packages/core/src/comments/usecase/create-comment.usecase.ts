import { UseCase } from "../../shared/use-case";
import { Comment, CommentProps } from "../model/comment.entity";
import { CommentRepository } from "../provider/comment.repository";

/**
 * Input for creating a new comment.
 *
 * All fields are required unless marked optional.
 */
export interface CreateCommentInput {
  /**
   * The ID of the task to comment on.
   * The task must exist for the comment to be created.
   */
  taskId: string;

  /**
   * The ID of the user creating the comment.
   * This user will be the author of the comment.
   */
  userId: string;

  /**
   * The comment content.
   * Must be between 1 and 2000 characters.
   */
  content: string;

  /**
   * Optional parent comment ID for threaded replies.
   * If provided, this comment will be a reply to another comment.
   */
  parentCommentId?: string | null;

  /**
   * Optional array of user IDs to mention in the comment.
   * Mentioned users will receive notifications.
   */
  mentions?: string[];
}

/**
 * Use case for creating a new comment on a task.
 *
 * This use case handles the creation of comments, which enable
 * team collaboration by allowing discussions directly on tasks.
 * Comments can be standalone or replies to other comments (threaded).
 *
 * ## Business Rules
 *
 * - The task must exist (checked via repository)
 * - Content must be between 1 and 2000 characters
 * - User ID and task ID are required
 * - Mentions are optional but must be valid user IDs if provided
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateCommentUseCase(commentRepository);
 *
 * const comment = await useCase.execute({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Let me handle this task',
 *   mentions: ['user-789']
 * });
 *
 * console.log(`Comment created: ${comment.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - User ID is missing or invalid
 * - Content is empty or too long
 * - Repository operations fail
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
export class CreateCommentUseCase
  implements UseCase<CreateCommentInput, Comment>
{
  constructor(private readonly commentRepository: CommentRepository) {}

  /**
   * Executes the create comment use case.
   *
   * Creates a new comment on the specified task with the provided content.
   * The comment is validated before being persisted.
   *
   * @param input - The comment creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created comment
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const comment = await useCase.execute({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Great work on this task!'
   * });
   * ```
   */
  async execute(
    input: CreateCommentInput,
    _loggedUser?: unknown,
  ): Promise<Comment> {
    // Validate required fields
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!input.content || input.content.trim().length === 0) {
      throw new Error("Comment content is required");
    }

    // Create the comment entity (validates content via entity constructor)
    const comment = Comment.create({
      taskId: input.taskId,
      userId: input.userId,
      content: input.content.trim(),
      parentCommentId: input.parentCommentId ?? null,
      mentions: input.mentions ?? [],
    });

    // Persist the comment
    await this.commentRepository.create(comment);

    return comment;
  }
}
