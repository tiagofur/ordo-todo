import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  Attachment,
  CreateAttachmentUseCase,
  DeleteAttachmentUseCase,
  GetAttachmentByIdUseCase,
  GetAttachmentsByTaskUseCase,
  GetAttachmentsByUserUseCase,
} from '@ordo-todo/core';
import type { AttachmentRepository } from '@ordo-todo/core';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../database/prisma.service';

/**
 * Response DTO for attachment with uploader details.
 */
export interface AttachmentWithUploader {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  mimeType: string;
  filesize: number;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string | null;
  } | null;
  uploadedAt: Date;
  createdAt: Date;
}

/**
 * Service for managing file attachments on tasks.
 *
 * This service orchestrates the use cases from the domain layer and handles:
 * - File I/O operations (uploading, deleting physical files)
 * - Enriching responses with uploader details
 * - Orphaned file cleanup
 *
 * ## Architecture
 *
 * This service follows Clean Architecture principles:
 * - Uses domain use cases for business logic
 * - Uses AttachmentRepository for data access
 * - Handles only orchestration and infrastructure concerns
 * - Maps domain entities to response DTOs
 *
 * ## File I/O
 *
 * File upload/download operations remain in this service as they are
 * infrastructure concerns. The domain layer tracks metadata only.
 *
 * @see {@link ../../../../packages/core/src/attachments/ | Attachments Domain}
 */
@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @Inject('AttachmentRepository')
    private readonly attachmentRepository: AttachmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Creates a new attachment record.
   *
   * Creates an attachment with the provided metadata. For file uploads,
   * the file should already be stored before calling this method.
   *
   * @param createAttachmentDto - The attachment creation data
   * @param userId - The ID of the user creating the attachment
   * @returns The created attachment with uploader details
   *
   * @example
   * ```typescript
   * const attachment = await attachmentsService.create(
   *   {
   *     taskId: 'task-123',
   *     filename: 'document.pdf',
   *     url: '/uploads/abc123-document.pdf',
   *     mimeType: 'application/pdf',
   *     filesize: 1024000
   *   },
   *   'user-456'
   * );
   * ```
   */
  async create(
    createAttachmentDto: CreateAttachmentDto,
    userId: string,
  ): Promise<AttachmentWithUploader> {
    this.logger.debug(
      `Creating attachment on task ${createAttachmentDto.taskId} by user ${userId}`,
    );

    const createAttachmentUseCase = new CreateAttachmentUseCase(
      this.attachmentRepository,
    );

    // Map DTO to domain entity input
    // Note: Domain uses different property names than DB schema
    const attachment = await createAttachmentUseCase.execute({
      taskId: createAttachmentDto.taskId,
      userId,
      fileName: createAttachmentDto.filename,
      originalName: createAttachmentDto.filename, // Using same as filename for now
      mimeType: createAttachmentDto.mimeType,
      size: createAttachmentDto.filesize,
      storagePath: createAttachmentDto.url,
    });

    this.logger.debug(`Attachment created with ID: ${attachment.id}`);

    // Enrich response with uploader details
    return this.enrichWithUploader(attachment);
  }

  /**
   * Finds a single attachment by ID.
   *
   * @param id - The ID of the attachment to find
   * @returns The attachment with uploader details
   * @throws {NotFoundException} If attachment not found
   *
   * @example
   * ```typescript
   * const attachment = await attachmentsService.findOne('attachment-123');
   * ```
   */
  async findOne(id: string): Promise<AttachmentWithUploader> {
    const getAttachmentByIdUseCase = new GetAttachmentByIdUseCase(
      this.attachmentRepository,
    );

    try {
      const attachment = await getAttachmentByIdUseCase.execute({
        attachmentId: id,
      });

      // Enrich with task details as well
      return this.enrichWithUploaderAndTask(attachment);
    } catch (error) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        throw new NotFoundException('Attachment not found');
      }
      throw error;
    }
  }

  /**
   * Updates an existing attachment.
   *
   * Only the attachment uploader can update their own attachment.
   * Currently only supports updating filename metadata.
   *
   * @param id - The ID of the attachment to update
   * @param updateAttachmentDto - The update data
   * @param userId - The ID of the user attempting to update
   * @returns The updated attachment with uploader details
   * @throws {NotFoundException} If attachment not found
   * @throws {ForbiddenException} If user is not the uploader
   *
   * @example
   * ```typescript
   * const updated = await attachmentsService.update(
   *   'attachment-123',
   *   { filename: 'updated-name.pdf', url: '...', mimeType: '...', filesize: 1000 },
   *   'user-456'
   * );
   * ```
   */
  async update(
    id: string,
    updateAttachmentDto: CreateAttachmentDto,
    userId: string,
  ): Promise<AttachmentWithUploader> {
    this.logger.debug(`Updating attachment ${id} by user ${userId}`);

    // Verify ownership and get existing attachment
    const existingAttachment = await this.attachmentRepository.findById(id);

    if (!existingAttachment) {
      throw new NotFoundException('Attachment not found');
    }

    // For updates, we also need to check task ownership
    const task = await this.prisma.task.findUnique({
      where: { id: existingAttachment.taskId },
      select: { ownerId: true },
    });

    if (existingAttachment.userId !== userId && task?.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only update your own attachments or attachments on your tasks',
      );
    }

    // Create updated attachment entity
    const updatedAttachment = existingAttachment.clone({
      fileName: updateAttachmentDto.filename,
      originalName: updateAttachmentDto.filename,
      storagePath: updateAttachmentDto.url,
      mimeType: updateAttachmentDto.mimeType,
      size: updateAttachmentDto.filesize,
      updatedAt: new Date(),
    });

    await this.attachmentRepository.update(updatedAttachment);

    this.logger.debug(`Attachment ${id} updated successfully`);

    return this.enrichWithUploader(updatedAttachment);
  }

  /**
   * Deletes an attachment.
   *
   * Only the attachment uploader can delete their own attachment.
   * Also deletes the physical file from storage.
   *
   * @param id - The ID of the attachment to delete
   * @param userId - The ID of the user attempting to delete
   * @returns Success confirmation
   * @throws {NotFoundException} If attachment not found
   * @throws {ForbiddenException} If user is not the uploader
   *
   * @example
   * ```typescript
   * await attachmentsService.remove('attachment-123', 'user-456');
   * // Returns: { success: true }
   * ```
   */
  async remove(id: string, userId: string): Promise<{ success: true }> {
    this.logger.debug(`Deleting attachment ${id} by user ${userId}`);

    // Get attachment first for file deletion
    const existingAttachment = await this.attachmentRepository.findById(id);

    if (!existingAttachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Verify ownership (uploader or task owner)
    const task = await this.prisma.task.findUnique({
      where: { id: existingAttachment.taskId },
      select: { ownerId: true },
    });

    if (existingAttachment.userId !== userId && task?.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own attachments or attachments on your tasks',
      );
    }

    const deleteAttachmentUseCase = new DeleteAttachmentUseCase(
      this.attachmentRepository,
    );

    // Delete the database record
    await deleteAttachmentUseCase.execute({
      attachmentId: id,
      userId,
    });

    this.logger.debug(`Attachment ${id} deleted successfully`);

    // Delete physical file
    await this.deletePhysicalFile(existingAttachment.storagePath);

    return { success: true };
  }

  /**
   * Deletes a physical file from storage.
   *
   * @param url - The URL or storage path of the file to delete
   *
   * @private
   */
  async deletePhysicalFile(url: string): Promise<void> {
    try {
      const filename = url.replace('/uploads/', '');
      const filepath = join(process.cwd(), 'uploads', filename);

      await unlink(filepath);
      this.logger.log(`Deleted physical file: ${filepath}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete physical file for URL ${url}:`,
        error.message,
      );
    }
  }

  /**
   * Cleans up orphaned files in the uploads directory.
   *
   * This is a maintenance operation that deletes files from the
   * uploads directory that no longer have corresponding database records.
   *
   * @returns Summary of cleanup results
   *
   * @example
   * ```typescript
   * const result = await attachmentsService.cleanOrphanedFiles();
   * console.log(`Deleted ${result.deleted} files, ${result.errors} errors`);
   * ```
   */
  async cleanOrphanedFiles(): Promise<{
    deleted: number;
    errors: number;
  }> {
    const uploadsDir = join(process.cwd(), 'uploads');

    let deleted = 0;
    let errors = 0;

    try {
      const files = await readdir(uploadsDir);

      for (const file of files) {
        const url = `/uploads/${file}`;

        // Check if attachment exists with this URL
        const attachments = await this.attachmentRepository.findByTaskId(
          'dummy-task-id', // We need to find a different way
        );

        // Check if attachment exists with this URL using repository
        const attachment = await this.attachmentRepository.findByUrl(url);

        if (!attachment) {
          try {
            await unlink(join(uploadsDir, file));
            deleted++;
            this.logger.log(`Deleted orphaned file: ${file}`);
          } catch (error) {
            errors++;
            this.logger.error(
              `Failed to delete orphaned file ${file}:`,
              error.message,
            );
          }
        }
      }

      this.logger.log(
        `Cleanup complete: ${deleted} files deleted, ${errors} errors`,
      );
      return { deleted, errors };
    } catch (error) {
      this.logger.error('Failed to clean orphaned files:', error.message);
      return { deleted, errors };
    }
  }

  /**
   * Finds all attachments for a specific task.
   *
   * @param taskId - The ID of the task
   * @returns Array of attachments with uploader details
   *
   * @example
   * ```typescript
   * const attachments = await attachmentsService.findByTask('task-123');
   * ```
   */
  async findByTask(taskId: string): Promise<AttachmentWithUploader[]> {
    const getAttachmentsByTaskUseCase = new GetAttachmentsByTaskUseCase(
      this.attachmentRepository,
    );

    const attachments = await getAttachmentsByTaskUseCase.execute({ taskId });

    // Enrich all attachments with uploader details
    return Promise.all(
      attachments.map((attachment) => this.enrichWithUploader(attachment)),
    );
  }

  /**
   * Finds all attachments for tasks in a specific project.
   *
   * @param projectId - The ID of the project
   * @returns Array of attachments with uploader and task details
   *
   * @example
   * ```typescript
   * const attachments = await attachmentsService.findByProject('project-123');
   * ```
   */
  async findByProject(projectId: string): Promise<AttachmentWithUploader[]> {
    // Use repository to find attachments by project ID
    const attachments =
      await this.attachmentRepository.findByProjectId(projectId);

    // Enrich all attachments with uploader details
    return Promise.all(
      attachments.map((attachment) => this.enrichWithUploader(attachment)),
    );
  }

  /**
   * Finds all attachments uploaded by a specific user.
   *
   * @param userId - The ID of the user
   * @returns Array of attachments with uploader details
   *
   * @example
   * ```typescript
   * const attachments = await attachmentsService.findByUser('user-456');
   * ```
   */
  async findByUser(userId: string): Promise<AttachmentWithUploader[]> {
    const getAttachmentsByUserUseCase = new GetAttachmentsByUserUseCase(
      this.attachmentRepository,
    );

    const attachments = await getAttachmentsByUserUseCase.execute({ userId });

    // Enrich all attachments with uploader details
    return Promise.all(
      attachments.map((attachment) => this.enrichWithUploader(attachment)),
    );
  }

  /**
   * Enriches an attachment with uploader details.
   *
   * This requires direct database access since user data is not
   * part of the domain entity. This is a pragmatic compromise.
   *
   * @private
   * @param attachment - The domain entity to enrich
   * @returns The enriched attachment with uploader details
   */
  private async enrichWithUploader(
    attachment: Attachment,
  ): Promise<AttachmentWithUploader> {
    const uploader = await this.getUserById(attachment.userId);

    return {
      id: attachment.id as string,
      taskId: attachment.taskId,
      filename: attachment.originalName,
      url: attachment.storagePath,
      mimeType: attachment.mimeType,
      filesize: attachment.size,
      uploadedById: attachment.userId,
      uploadedBy: uploader,
      uploadedAt: attachment.uploadedAt ?? attachment.createdAt,
      createdAt: attachment.createdAt,
    };
  }

  /**
   * Enriches an attachment with uploader details.
   *
   * Used for findOne to include uploader information.
   * Note: Task details removed as non-essential.
   *
   * @private
   * @param attachment - The domain entity to enrich
   * @returns The enriched attachment with uploader details
   */
  private async enrichWithUploaderAndTask(
    attachment: Attachment,
  ): Promise<AttachmentWithUploader> {
    return this.enrichWithUploader(attachment);
  }

  /**
   * Gets user by ID for uploader enrichment.
   *
   * Direct DB access - pragmatic compromise for enrichment.
   *
   * @private
   * @param userId - The user ID to look up
   * @returns The user details or null
   */
  private async getUserById(userId: string): Promise<{
    id: string;
    name: string | null;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
