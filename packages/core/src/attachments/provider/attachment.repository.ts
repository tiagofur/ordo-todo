import { Attachment } from "../model/attachment.entity";

/**
 * Repository interface for Attachment entity persistence operations.
 *
 * This interface defines the contract for Attachment data access, providing CRUD
 * operations plus specialized methods for managing task attachments and storage metrics.
 * Attachments enable users to associate files with tasks for reference and collaboration.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAttachmentRepository implements AttachmentRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(attachment: Attachment): Promise<Attachment> {
 *     const data = await this.prisma.attachment.create({
 *       data: {
 *         id: attachment.id,
 *         taskId: attachment.taskId,
 *         uploadedById: attachment.userId,
 *         filename: attachment.fileName,
 *         url: attachment.storagePath,
 *         mimeType: attachment.mimeType,
 *         filesize: attachment.size,
 *         uploadedAt: attachment.uploadedAt,
 *       }
 *     });
 *     return new Attachment({
 *       ...data,
 *       userId: data.uploadedById,
 *       originalName: data.filename,
 *       storagePath: data.url,
 *     });
 *   }
 *
 *   async findByTaskId(taskId: string): Promise<Attachment[]> {
 *     const attachments = await this.prisma.attachment.findMany({
 *       where: { taskId },
 *       orderBy: { uploadedAt: 'desc' }
 *     });
 *     return attachments.map(a => new Attachment({
 *       ...a,
 *       userId: a.uploadedById,
 *       originalName: a.filename,
 *       storagePath: a.url,
 *     }));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 */
export interface AttachmentRepository {
  /**
   * Creates a new attachment in the repository.
   *
   * Used when a user uploads a file to a task. The attachment
   * should have all required fields populated before calling this method.
   *
   * @param attachment - The attachment entity to create (must be valid)
   * @returns Promise resolving to the created attachment with any database-generated fields populated
   * @throws {Error} If attachment validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   fileName: 'unique-id-document.pdf',
   *   originalName: 'document.pdf',
   *   mimeType: 'application/pdf',
   *   size: 1024000,
   *   storagePath: '/uploads/unique-id-document.pdf'
   * });
   *
   * const created = await repository.create(attachment);
   * console.log(`Attachment created with ID: ${created.id}`);
   * ```
   */
  create(attachment: Attachment): Promise<Attachment>;

  /**
   * Updates an existing attachment in the repository.
   *
   * Used when updating attachment metadata, such as marking
   * an attachment as uploaded after file storage completes.
   *
   * @param attachment - The attachment entity with updated fields
   * @returns Promise resolving to the updated attachment
   * @throws {Error} If the attachment doesn't exist or validation fails
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('attachment-123');
   * if (existing) {
   *   const uploaded = existing.markAsUploaded();
   *   await repository.update(uploaded);
   * }
   * ```
   */
  update(attachment: Attachment): Promise<Attachment>;

  /**
   * Finds an attachment by its unique ID.
   *
   * Used for fetching attachment details when the ID is known, such as from
   * a URL parameter or after creating/updating an attachment.
   *
   * @param id - The unique identifier of the attachment
   * @returns Promise resolving to the attachment if found, null otherwise
   *
   * @example
   * ```typescript
   * const attachment = await repository.findById('attachment-123');
   * if (attachment) {
   *   console.log(`Found attachment: ${attachment.originalName}`);
   * } else {
   *   console.log('Attachment not found');
   * }
   * ```
   */
  findById(id: string): Promise<Attachment | null>;

  /**
   * Finds all attachments for a specific task.
   *
   * Used for displaying the list of files attached to a task.
   * Returns attachments ordered by upload date (newest first).
   *
   * @param taskId - The task ID to find attachments for
   * @returns Promise resolving to an array of attachments (empty array if none found)
   *
   * @example
   * ```typescript
   * const attachments = await repository.findByTaskId('task-123');
   * console.log(`Found ${attachments.length} attachments`);
   *
   * // Render attachment list
   * attachments.forEach(attachment => {
   *   console.log(`${attachment.originalName} (${attachment.getFileSizeInMB().toFixed(2)} MB)`);
   * });
   * ```
   */
  findByTaskId(taskId: string): Promise<Attachment[]>;

  /**
   * Finds all attachments uploaded by a specific user.
   *
   * Used for displaying a user's upload history or activity feed.
   *
   * @param userId - The user ID to find attachments for
   * @returns Promise resolving to an array of attachments (empty array if none found)
   *
   * @example
   * ```typescript
   * const userAttachments = await repository.findByUserId('user-456');
   * console.log(`User has uploaded ${userAttachments.length} files`);
   * ```
   */
  findByUserId(userId: string): Promise<Attachment[]>;

  /**
   * Finds all attachments with a specific MIME type.
   *
   * Used for filtering attachments by file type, such as
   * showing only images or only documents.
   *
   * @param mimeType - The MIME type to filter by (e.g., "image/jpeg", "application/pdf")
   * @returns Promise resolving to an array of matching attachments
   *
   * @example
   * ```typescript
   * const images = await repository.findByMimeType('image/jpeg');
   * console.log(`Found ${images.length} JPEG images`);
   * ```
   */
  findByMimeType(mimeType: string): Promise<Attachment[]>;

  /**
   * Deletes an attachment from the repository.
   *
   * WARNING: This permanently deletes the attachment record from the database.
   * The actual file in storage should be deleted separately (typically in the service layer).
   *
   * @param id - The unique identifier of the attachment to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {Error} If the attachment doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('attachment-123');
   * console.log('Attachment record deleted');
   * // Note: Physical file deletion should be handled separately
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Counts the total number of attachments for a specific task.
   *
   * Useful for displaying attachment counts in task lists and badges,
   * and for enforcing limits on attachments per task.
   *
   * @param taskId - The task ID to count attachments for
   * @returns Promise resolving to the count of attachments
   *
   * @example
   * ```typescript
   * const count = await repository.countByTaskId('task-123');
   * console.log(`Task has ${count} attachments`);
   * ```
   */
  countByTaskId(taskId: string): Promise<number>;

  /**
   * Gets the total file size for all attachments on a specific task.
   *
   * Useful for enforcing storage limits and displaying
   * storage usage statistics.
   *
   * @param taskId - The task ID to calculate total size for
   * @returns Promise resolving to the total size in bytes
   *
   * @example
   * ```typescript
   * const totalBytes = await repository.getTotalSizeByTaskId('task-123');
   * const totalMB = totalBytes / (1024 * 1024);
   * console.log(`Task attachments use ${totalMB.toFixed(2)} MB`);
   * ```
   */
  getTotalSizeByTaskId(taskId: string): Promise<number>;
}
