import { Injectable } from '@nestjs/common';
import { Attachment, AttachmentRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { Attachment as PrismaAttachment } from '@prisma/client';

/**
 * Prisma implementation of the AttachmentRepository interface.
 *
 * This repository bridges the domain layer (Attachment entity from @ordo-todo/core)
 * with the data access layer (PrismaAttachment from Prisma).
 *
 * ## Field Mapping
 *
 * The domain entity uses different field names than the Prisma schema.
 * This repository handles the translation between these conventions.
 *
 * | Domain (Attachment) | Prisma (Attachment) |
 * |---------------------|---------------------|
 * | userId              | uploadedById        |
 * | fileName            | filename            |
 * | originalName        | (mapped from filename) |
 * | storagePath         | url                 |
 * | mimeType            | mimeType            |
 * | size                | filesize            |
 * | isUploaded          | (computed: uploadedAt != null) |
 * | uploadedAt          | uploadedAt          |
 *
 * ## Usage
 *
 * ```typescript
 * // In AttachmentsService or use cases
 * const attachment = await attachmentRepository.create(attachmentEntity);
 * const found = await attachmentRepository.findById(attachmentId);
 * const taskAttachments = await attachmentRepository.findByTaskId(taskId);
 * ```
 */
@Injectable()
export class PrismaAttachmentRepository implements AttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attachment: Attachment): Promise<Attachment> {
    const prismaAttachment = await this.prisma.attachment.create({
      data: {
        id: attachment.id as string,
        taskId: attachment.taskId,
        uploadedById: attachment.userId,
        filename: attachment.fileName,
        url: attachment.storagePath,
        mimeType: attachment.mimeType,
        filesize: attachment.size,
        uploadedAt: attachment.uploadedAt ?? new Date(),
      },
    });

    return this.toDomain(prismaAttachment);
  }

  async update(attachment: Attachment): Promise<Attachment> {
    const prismaAttachment = await this.prisma.attachment.update({
      where: { id: attachment.id as string },
      data: {
        taskId: attachment.taskId,
        uploadedById: attachment.userId,
        filename: attachment.fileName,
        url: attachment.storagePath,
        mimeType: attachment.mimeType,
        filesize: attachment.size,
        uploadedAt: attachment.uploadedAt ?? new Date(),
      },
    });

    return this.toDomain(prismaAttachment);
  }

  async findById(id: string): Promise<Attachment | null> {
    const prismaAttachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    return prismaAttachment ? this.toDomain(prismaAttachment) : null;
  }

  async findByTaskId(taskId: string): Promise<Attachment[]> {
    const prismaAttachments = await this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { uploadedAt: 'desc' },
    });

    return prismaAttachments.map((a) => this.toDomain(a));
  }

  async findByUserId(userId: string): Promise<Attachment[]> {
    const prismaAttachments = await this.prisma.attachment.findMany({
      where: { uploadedById: userId },
      orderBy: { uploadedAt: 'desc' },
    });

    return prismaAttachments.map((a) => this.toDomain(a));
  }

  async findByMimeType(mimeType: string): Promise<Attachment[]> {
    const prismaAttachments = await this.prisma.attachment.findMany({
      where: { mimeType },
      orderBy: { uploadedAt: 'desc' },
    });

    return prismaAttachments.map((a) => this.toDomain(a));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: { id },
    });
  }

  async countByTaskId(taskId: string): Promise<number> {
    return this.prisma.attachment.count({
      where: { taskId },
    });
  }

  async getTotalSizeByTaskId(taskId: string): Promise<number> {
    const attachments = await this.prisma.attachment.findMany({
      where: { taskId },
      select: { filesize: true },
    });

    return attachments.reduce((total, a) => total + a.filesize, 0);
  }

  /**
   * Converts a PrismaAttachment to a domain Attachment entity.
   *
   * Handles field name mapping and computes derived properties.
   *
   * Note: If uploadedById is null (user was deleted), we use a placeholder
   * user ID. In production, you may want to handle this case differently.
   *
   * @param prismaAttachment - The Prisma model to convert
   * @returns A domain Attachment entity
   */
  private toDomain(prismaAttachment: PrismaAttachment): Attachment {
    // Handle case where user was deleted (uploadedById is null)
    const userId =
      prismaAttachment.uploadedById ?? '00000000-0000-0000-0000-000000000000';

    return new Attachment({
      id: prismaAttachment.id,
      taskId: prismaAttachment.taskId,
      userId,
      fileName: prismaAttachment.filename,
      originalName: prismaAttachment.filename,
      mimeType: prismaAttachment.mimeType,
      size: prismaAttachment.filesize,
      storagePath: prismaAttachment.url,
      isUploaded: prismaAttachment.uploadedAt !== null,
      uploadedAt: prismaAttachment.uploadedAt,
      createdAt: prismaAttachment.uploadedAt,
      updatedAt: prismaAttachment.uploadedAt,
    });
  }
}
