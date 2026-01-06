import { UseCase } from "../../shared/use-case";
import { Attachment } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for retrieving attachments by task.
 */
export interface GetAttachmentsByTaskInput {
  /**
   * The ID of the task to retrieve attachments for.
   */
  taskId: string;
}

/**
 * Use case for retrieving all attachments for a specific task.
 *
 * This use case handles fetching the complete list of file attachments
 * for a task, which is essential for displaying task resources in the UI.
 *
 * ## Business Rules
 *
 * - Returns all attachments for the specified task
 * - Attachments are ordered by upload date (newest first)
 * - Returns an empty array if no attachments exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentsByTaskUseCase(attachmentRepository);
 *
 * const attachments = await useCase.execute({
 *   taskId: 'task-123'
 * });
 *
 * console.log(`Found ${attachments.length} attachments`);
 * attachments.forEach(attachment => {
 *   console.log(`${attachment.originalName} (${attachment.getFileSizeInMB().toFixed(2)} MB)`);
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
 * - Task has no attachments
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
export class GetAttachmentsByTaskUseCase
  implements UseCase<GetAttachmentsByTaskInput, Attachment[]>
{
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the get attachments by task use case.
   *
   * Retrieves all attachments for the specified task, ordered by
   * upload date (newest first).
   *
   * @param input - The input containing the task ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of attachments (empty if none found)
   * @throws {Error} If task ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const attachments = await useCase.execute({
   *   taskId: 'task-123'
   * });
   *
   * // Display attachments in UI
   * return (
   *   <AttachmentList attachments={attachments} />
   * );
   * ```
   */
  async execute(
    input: GetAttachmentsByTaskInput,
    _loggedUser?: unknown,
  ): Promise<Attachment[]> {
    // Validate task ID
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }

    // Retrieve attachments for the task
    const attachments = await this.attachmentRepository.findByTaskId(
      input.taskId,
    );

    return attachments;
  }
}
