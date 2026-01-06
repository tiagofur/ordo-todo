import { UseCase } from "../../shared/use-case";
import { Attachment } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for deleting an attachment.
 */
export interface DeleteAttachmentInput {
  /**
   * The ID of the attachment to delete.
   */
  attachmentId: string;

  /**
   * The ID of the user attempting to delete the attachment.
   * Must be the original uploader of the attachment.
   */
  userId: string;
}

/**
 * Use case for deleting an attachment.
 *
 * This use case handles the deletion of attachment records by their uploaders.
 * Note: Physical file deletion should be handled separately in the service layer
 * as it's a cross-cutting concern (storage provider specifics).
 *
 * ## Business Rules
 *
 * - Only the attachment uploader can delete their own attachment
 * - Deletion of the database record is permanent
 * - Physical file deletion is handled separately (service layer concern)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteAttachmentUseCase(attachmentRepository);
 *
 * await useCase.execute({
 *   attachmentId: 'attachment-123',
 *   userId: 'user-456'
 * });
 *
 * // Delete physical file separately
 * await storageService.deleteFile(filePath);
 *
 * console.log('Attachment deleted');
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Attachment ID is missing or invalid
 * - User ID is missing or invalid
 * - Attachment doesn't exist
 * - User is not the attachment uploader
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
export class DeleteAttachmentUseCase implements UseCase<DeleteAttachmentInput, void> {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the delete attachment use case.
   *
   * Permanently deletes the attachment record if the user is the uploader.
   * Physical file deletion should be handled separately.
   *
   * @param input - The delete input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise that resolves when the attachment record is deleted
   * @throws {Error} If validation fails or user is not the uploader
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   attachmentId: 'attachment-123',
   *   userId: 'user-456'
   * });
   * // Note: Remember to delete the physical file separately
   * ```
   */
  async execute(
    input: DeleteAttachmentInput,
    _loggedUser?: unknown,
  ): Promise<void> {
    // Validate required fields
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // Find the existing attachment
    const existingAttachment = await this.attachmentRepository.findById(
      input.attachmentId,
    );

    if (!existingAttachment) {
      throw new Error("Attachment not found");
    }

    // Verify ownership - only the uploader can delete
    if (existingAttachment.userId !== input.userId) {
      throw new Error("You can only delete your own attachments");
    }

    // Permanently delete the attachment record
    await this.attachmentRepository.delete(input.attachmentId);
  }
}
