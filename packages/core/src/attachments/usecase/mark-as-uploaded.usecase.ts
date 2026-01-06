import { UseCase } from "../../shared/use-case";
import { Attachment } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for marking an attachment as uploaded.
 */
export interface MarkAsUploadedInput {
  /**
   * The ID of the attachment to mark as uploaded.
   */
  attachmentId: string;
}

/**
 * Use case for marking an attachment as successfully uploaded.
 *
 * This use case handles updating an attachment's status after the file
 * has been successfully stored. This is typically called after the
 * upload process completes to record the upload timestamp.
 *
 * ## Business Rules
 *
 * - The attachment must exist
 * - The isUploaded flag is set to true
 * - The uploadedAt timestamp is recorded
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsUploadedUseCase(attachmentRepository);
 *
 * // After successful file upload
 * await storageService.upload(file);
 * const attachment = await useCase.execute({
 *   attachmentId: 'attachment-123'
 * });
 *
 * console.log(`Attachment ${attachment.id} marked as uploaded`);
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
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
export class MarkAsUploadedUseCase implements UseCase<MarkAsUploadedInput, Attachment> {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the mark as uploaded use case.
   *
   * Marks an attachment as successfully uploaded by setting the
   * isUploaded flag to true and recording the upload timestamp.
   *
   * @param input - The input containing the attachment ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated attachment
   * @throws {Error} If attachment ID is invalid or attachment not found
   *
   * @example
   * ```typescript
   * // After successful upload
   * const attachment = await useCase.execute({
   *   attachmentId: 'attachment-123'
   * });
   * console.log(attachment.isUploaded); // true
   * console.log(attachment.uploadedAt); // Date object
   * ```
   */
  async execute(
    input: MarkAsUploadedInput,
    _loggedUser?: unknown,
  ): Promise<Attachment> {
    // Validate attachment ID
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }

    // Find the existing attachment
    const existingAttachment = await this.attachmentRepository.findById(
      input.attachmentId,
    );

    if (!existingAttachment) {
      throw new Error("Attachment not found");
    }

    // Mark as uploaded
    const updatedAttachment = existingAttachment.markAsUploaded();

    // Persist the update
    await this.attachmentRepository.update(updatedAttachment);

    return updatedAttachment;
  }
}
