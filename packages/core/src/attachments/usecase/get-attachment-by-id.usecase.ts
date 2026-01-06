import { UseCase } from "../../shared/use-case";
import { Attachment } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for retrieving an attachment by ID.
 */
export interface GetAttachmentByIdInput {
  /**
   * The ID of the attachment to retrieve.
   */
  attachmentId: string;
}

/**
 * Use case for retrieving a single attachment by its ID.
 *
 * This use case handles fetching attachment details when the ID is known,
 * such as from a URL parameter or after list filtering.
 *
 * ## Business Rules
 *
 * - Returns the attachment if found
 * - Throws an error if attachment doesn't exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentByIdUseCase(attachmentRepository);
 *
 * const attachment = await useCase.execute({
 *   attachmentId: 'attachment-123'
 * });
 *
 * console.log(`Found: ${attachment.originalName}`);
 * console.log(`Size: ${attachment.getFileSizeInMB().toFixed(2)} MB`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Attachment ID is missing or invalid
 * - Attachment doesn't exist
 * - Repository operation fails
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../link provider/attachment.repository.ts | AttachmentRepository}
 */
export class GetAttachmentByIdUseCase
  implements UseCase<GetAttachmentByIdInput, Attachment>
{
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the get attachment by ID use case.
   *
   * Retrieves a single attachment by its unique identifier.
   *
   * @param input - The input containing the attachment ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the attachment
   * @throws {Error} If attachment ID is invalid or attachment not found
   *
   * @example
   * ```typescript
   * const attachment = await useCase.execute({
   *   attachmentId: 'attachment-123'
   * });
   *
   * // Display attachment details
   * return (
   *   <AttachmentDetails attachment={attachment} />
   * );
   * ```
   */
  async execute(
    input: GetAttachmentByIdInput,
    _loggedUser?: unknown,
  ): Promise<Attachment> {
    // Validate attachment ID
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }

    // Retrieve the attachment
    const attachment = await this.attachmentRepository.findById(
      input.attachmentId,
    );

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    return attachment;
  }
}
