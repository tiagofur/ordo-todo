import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createAttachmentDto: CreateAttachmentDto, userId: string) {
    const attachment = await this.prisma.attachment.create({
      data: {
        filename: createAttachmentDto.filename,
        url: createAttachmentDto.url,
        mimeType: createAttachmentDto.mimeType,
        filesize: createAttachmentDto.filesize,
        taskId: createAttachmentDto.taskId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return attachment;
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async update(
    id: string,
    updateAttachmentDto: CreateAttachmentDto,
    userId: string,
  ) {
    // Verify ownership
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      select: {
        uploadedById: true,
        task: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (
      attachment.uploadedById !== userId &&
      attachment.task.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You can only update your own attachments or attachments on your tasks',
      );
    }

    const updated = await this.prisma.attachment.update({
      where: { id },
      data: {
        filename: updateAttachmentDto.filename,
        url: updateAttachmentDto.url,
        mimeType: updateAttachmentDto.mimeType,
        filesize: updateAttachmentDto.filesize,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (
      attachment.uploadedById !== userId &&
      attachment.task.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You can only delete your own attachments or attachments on your tasks',
      );
    }

    await this.prisma.attachment.delete({
      where: { id },
    });

    await this.deletePhysicalFile(attachment.url);

    return { success: true };
  }

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

  async cleanOrphanedFiles(): Promise<{ deleted: number; errors: number }> {
    const { readdir } = await import('fs/promises');
    const uploadsDir = join(process.cwd(), 'uploads');

    let deleted = 0;
    let errors = 0;

    try {
      const files = await readdir(uploadsDir);

      for (const file of files) {
        const url = `/uploads/${file}`;

        const attachment = await this.prisma.attachment.findFirst({
          where: { url },
        });

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

  async findByTask(taskId: string) {
    const attachments = await this.prisma.attachment.findMany({
      where: { taskId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
    return attachments;
  }

  async findByProject(projectId: string) {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        task: {
          projectId: projectId,
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
    return attachments;
  }
}
