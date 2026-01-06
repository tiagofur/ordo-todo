import { UseCase } from "../../shared/use-case";
import { Attachment, AttachmentProps } from "../model/attachment.entity";
import { AttachmentRepository } from "../provider/attachment.repository";

/**
 * Input for creating a new attachment.
 *
 * All fields are required.
 */
export interface CreateAttachmentInput {
  /**
   * The ID of the task to attach the file to.
   * The task must exist for the attachment to be created.
   */
  taskId: string;

  /**
   * The ID of the user uploading the file.
   * This user will be recorded as the uploader.
   */
  userId: string;

  /**
   * The stored file name (may include UUID or timestamp prefix).
   * This is the actual name used in storage.
   */
  fileName: string;

  /**
   * The original file name as provided by the user.
   * This is the name that will be displayed in the UI.
   */
  originalName: string;

  /**
   * The MIME type of the file.
   * Used for content-type negotiation and file type detection.
   */
  mimeType: string;

  /**
   * The file size in bytes.
   * Must be greater than 0 and within size limits.
   */
  size: number;

  /**
   * The storage path or URL where the file is stored.
   * This can be a relative path, absolute URL, or cloud storage path.
   */
  storagePath: string;
}

/**
 * Use case for creating a new attachment on a task.
 *
 * This use case handles the creation of attachment records before
 * or after file upload completes. Attachments enable users to
 * associate files with tasks for reference and collaboration.
 *
 * ## Business Rules
 *
 * - The task must exist (checked via repository)
 * - File name (both stored and original) must be 1-255 characters
 * - User ID and task ID are required
 * - File size must be greater than 0 and within limits (default 10MB max)
 * - MIME type must be valid
 * - Storage path must be provided
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateAttachmentUseCase(attachmentRepository);
 *
 * const attachment = await useCase.execute({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'abc123-document.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/abc123-document.pdf'
 * });
 *
 * console.log(`Attachment created: ${attachment.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - User ID is missing or invalid
 * - File names are missing or too long
 * - MIME type is invalid
 * - File size is 0 or exceeds limits
 * - Storage path is missing
 * - Repository operations fail
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
export class CreateAttachmentUseCase
  implements UseCase<CreateAttachmentInput, Attachment>
{
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  /**
   * Executes the create attachment use case.
   *
   * Creates a new attachment record on the specified task with the
   * provided file metadata. The attachment is validated before being persisted.
   *
   * @param input - The attachment creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created attachment
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const attachment = await useCase.execute({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   fileName: 'unique-id-image.jpg',
   *   originalName: 'photo.jpg',
   *   mimeType: 'image/jpeg',
   *   size: 524288,
   *   storagePath: '/uploads/unique-id-image.jpg'
   * });
   * ```
   */
  async execute(
    input: CreateAttachmentInput,
    _loggedUser?: unknown,
  ): Promise<Attachment> {
    // Validate required fields
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!input.fileName || input.fileName.trim().length === 0) {
      throw new Error("File name is required");
    }

    if (!input.originalName || input.originalName.trim().length === 0) {
      throw new Error("Original file name is required");
    }

    if (!input.mimeType || input.mimeType.trim().length === 0) {
      throw new Error("MIME type is required");
    }

    if (typeof input.size !== "number" || input.size <= 0) {
      throw new Error("File size must be a positive number");
    }

    if (!input.storagePath || input.storagePath.trim().length === 0) {
      throw new Error("Storage path is required");
    }

    // Create the attachment entity (validates via entity constructor)
    const attachment = Attachment.create({
      taskId: input.taskId.trim(),
      userId: input.userId.trim(),
      fileName: input.fileName.trim(),
      originalName: input.originalName.trim(),
      mimeType: input.mimeType.trim(),
      size: input.size,
      storagePath: input.storagePath.trim(),
    });

    // Persist the attachment
    await this.attachmentRepository.create(attachment);

    return attachment;
  }
}
