import { UseCase } from "../../shared/use-case";
import { Attachment } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for retrieving attachments by user.
 */
export interface GetAttachmentsByUserInput {
  /**
   * The ID of the user to retrieve attachments for.
   */
  userId: string;
}

/**
 * Use case for retrieving all attachments uploaded by a specific user.
 *
 * This use case handles fetching a user's complete upload history,
 * which is useful for activity feeds and user profile pages.
 *
 * ## Business Rules
 *
 * - Returns all attachments uploaded by the specified user
 * - Attachments are ordered by upload date (newest first)
 * - Returns an empty array if user has no attachments
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentsByUserUseCase(attachmentRepository);
 *
 * const attachments = await useCase.execute({
 *   userId: 'user-456'
 * });
 *
 * console.log(`User has uploaded ${attachments.length} files`);
 * const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
 * console.log(`Total storage used: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - User has not uploaded any attachments
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
export class GetAttachmentsByUserUseCase
  implements UseCase<GetAttachmentsByUserInput, Attachment[]>
{
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the get attachments by user use case.
   *
   * Retrieves all attachments uploaded by the specified user.
   *
   * @param input - The input containing the user ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of attachments (empty if none found)
   * @throws {Error} If user ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const attachments = await useCase.execute({
   *   userId: 'user-456'
   * });
   *
   * // Display in user profile
   * return (
   *   <UserUploads attachments={attachments} />
   * );
   * ```
   */
  async execute(
    input: GetAttachmentsByUserInput,
    _loggedUser?: unknown,
  ): Promise<Attachment[]> {
    // Validate user ID
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Retrieve attachments uploaded by the user
    const attachments = await this.attachmentRepository.findByUserId(
      input.userId,
    );

    return attachments;
  }
}
