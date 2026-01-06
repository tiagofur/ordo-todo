import { Test, TestingModule } from '@nestjs/testing';
import { PrismaAttachmentRepository } from './prisma-attachment.repository';
import { PrismaService } from '../database/prisma.service';
import { Attachment } from '@ordo-todo/core';
import { Attachment as PrismaAttachment } from '@prisma/client';

describe('PrismaAttachmentRepository', () => {
  let repository: PrismaAttachmentRepository;

  const mockPrismaService = {
    attachment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAttachmentRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaAttachmentRepository>(
      PrismaAttachmentRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new attachment', async () => {
      const attachment = Attachment.create({
        taskId: 'task-123',
        userId: 'user-456',
        fileName: 'unique-id-document.pdf',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        storagePath: '/uploads/unique-id-document.pdf',
      });

      const prismaAttachment: PrismaAttachment = {
        id: attachment.id as string,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'unique-id-document.pdf',
        url: '/uploads/unique-id-document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: new Date(),
      };

      mockPrismaService.attachment.create.mockResolvedValue(prismaAttachment);

      const result = await repository.create(attachment);

      expect(mockPrismaService.attachment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: attachment.id as string,
          taskId: 'task-123',
          uploadedById: 'user-456',
          filename: 'unique-id-document.pdf',
          url: '/uploads/unique-id-document.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
        }),
      });
      expect(result).toBeInstanceOf(Attachment);
      expect(result.id).toBe(attachment.id);
      expect(result.fileName).toBe('unique-id-document.pdf');
    });

    it('should create attachment with uploadedAt timestamp', async () => {
      const attachment = Attachment.create({
        taskId: 'task-123',
        userId: 'user-456',
        fileName: 'image.jpg',
        originalName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 512000,
        storagePath: '/uploads/image.jpg',
      });

      const uploadedAt = new Date('2024-01-01T12:00:00Z');
      const uploaded = attachment.markAsUploaded();

      const prismaAttachment: PrismaAttachment = {
        id: uploaded.id as string,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'image.jpg',
        url: '/uploads/image.jpg',
        mimeType: 'image/jpeg',
        filesize: 512000,
        uploadedAt,
      };

      mockPrismaService.attachment.create.mockResolvedValue(prismaAttachment);

      const result = await repository.create(uploaded);

      expect(result.isUploaded).toBe(true);
      expect(result.uploadedAt).toEqual(uploadedAt);
    });
  });

  describe('update', () => {
    it('should update an existing attachment', async () => {
      const attachment = Attachment.create({
        taskId: 'task-123',
        userId: 'user-456',
        fileName: 'document.pdf',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        storagePath: '/uploads/document.pdf',
      });

      const uploaded = attachment.markAsUploaded();

      const prismaAttachment: PrismaAttachment = {
        id: uploaded.id as string,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'document.pdf',
        url: '/uploads/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: uploaded.uploadedAt as Date,
      };

      mockPrismaService.attachment.update.mockResolvedValue(prismaAttachment);

      const result = await repository.update(uploaded);

      expect(mockPrismaService.attachment.update).toHaveBeenCalledWith({
        where: { id: uploaded.id },
        data: expect.objectContaining({
          uploadedAt: uploaded.uploadedAt,
        }),
      });
      expect(result.isUploaded).toBe(true);
      expect(result.uploadedAt).toBeDefined();
    });

    it('should update attachment fields', async () => {
      const attachment = Attachment.create({
        taskId: 'task-123',
        userId: 'user-456',
        fileName: 'old-name.pdf',
        originalName: 'old-name.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        storagePath: '/uploads/old-name.pdf',
      });

      const updated = attachment.clone({
        fileName: 'new-name.pdf',
        storagePath: '/uploads/new-name.pdf',
      });

      const prismaAttachment: PrismaAttachment = {
        id: updated.id as string,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'new-name.pdf',
        url: '/uploads/new-name.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: updated.uploadedAt ?? null,
      };

      mockPrismaService.attachment.update.mockResolvedValue(prismaAttachment);

      const result = await repository.update(updated);

      expect(mockPrismaService.attachment.update).toHaveBeenCalledWith({
        where: { id: updated.id },
        data: expect.objectContaining({
          filename: 'new-name.pdf',
          url: '/uploads/new-name.pdf',
        }),
      });
      expect(result.fileName).toBe('new-name.pdf');
      expect(result.storagePath).toBe('/uploads/new-name.pdf');
    });
  });

  describe('findById', () => {
    it('should find an attachment by ID', async () => {
      const attachmentId = 'attachment-123';

      const prismaAttachment: PrismaAttachment = {
        id: attachmentId,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'document.pdf',
        url: '/uploads/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: new Date('2024-01-01T12:00:00Z'),
      };

      mockPrismaService.attachment.findUnique.mockResolvedValue(
        prismaAttachment,
      );

      const result = await repository.findById(attachmentId);

      expect(mockPrismaService.attachment.findUnique).toHaveBeenCalledWith({
        where: { id: attachmentId },
      });
      expect(result).toBeInstanceOf(Attachment);
      expect(result?.id).toBe(attachmentId);
      expect(result?.fileName).toBe('document.pdf');
      expect(result?.originalName).toBe('document.pdf');
    });

    it('should return null when attachment not found', async () => {
      const attachmentId = 'nonexistent-attachment';

      mockPrismaService.attachment.findUnique.mockResolvedValue(null);

      const result = await repository.findById(attachmentId);

      expect(mockPrismaService.attachment.findUnique).toHaveBeenCalledWith({
        where: { id: attachmentId },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByTaskId', () => {
    it('should find all attachments for a task', async () => {
      const taskId = 'task-123';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId,
          uploadedById: 'user-1',
          filename: 'document1.pdf',
          url: '/uploads/document1.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'attachment-2',
          taskId,
          uploadedById: 'user-2',
          filename: 'image.jpg',
          url: '/uploads/image.jpg',
          mimeType: 'image/jpeg',
          filesize: 512000,
          uploadedAt: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.findByTaskId(taskId);

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: { taskId },
        orderBy: { uploadedAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('attachment-1');
      expect(result[1].id).toBe('attachment-2');
    });

    it('should return empty array when no attachments found', async () => {
      const taskId = 'empty-task';

      mockPrismaService.attachment.findMany.mockResolvedValue([]);

      const result = await repository.findByTaskId(taskId);

      expect(result).toEqual([]);
    });

    it('should order attachments by uploadedAt descending', async () => {
      const taskId = 'task-123';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId,
          uploadedById: 'user-1',
          filename: 'old.pdf',
          url: '/uploads/old.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'attachment-2',
          taskId,
          uploadedById: 'user-2',
          filename: 'new.pdf',
          url: '/uploads/new.pdf',
          mimeType: 'application/pdf',
          filesize: 512000,
          uploadedAt: new Date('2024-01-01T12:00:00Z'),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.findByTaskId(taskId);

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: { taskId },
        orderBy: { uploadedAt: 'desc' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should find all attachments by a user', async () => {
      const userId = 'user-456';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId: 'task-1',
          uploadedById: userId,
          filename: 'document1.pdf',
          url: '/uploads/document1.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'attachment-2',
          taskId: 'task-2',
          uploadedById: userId,
          filename: 'image.jpg',
          url: '/uploads/image.jpg',
          mimeType: 'image/jpeg',
          filesize: 512000,
          uploadedAt: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.findByUserId(userId);

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: { uploadedById: userId },
        orderBy: { uploadedAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(userId);
      expect(result[1].userId).toBe(userId);
    });

    it('should return empty array when user has no attachments', async () => {
      const userId = 'user-without-attachments';

      mockPrismaService.attachment.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findByMimeType', () => {
    it('should find all attachments with a specific MIME type', async () => {
      const mimeType = 'application/pdf';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId: 'task-1',
          uploadedById: 'user-1',
          filename: 'document1.pdf',
          url: '/uploads/document1.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'attachment-2',
          taskId: 'task-2',
          uploadedById: 'user-2',
          filename: 'document2.pdf',
          url: '/uploads/document2.pdf',
          mimeType: 'application/pdf',
          filesize: 512000,
          uploadedAt: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.findByMimeType(mimeType);

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: { mimeType },
        orderBy: { uploadedAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].mimeType).toBe('application/pdf');
      expect(result[1].mimeType).toBe('application/pdf');
    });

    it('should find image attachments by MIME type', async () => {
      const mimeType = 'image/jpeg';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId: 'task-1',
          uploadedById: 'user-1',
          filename: 'photo1.jpg',
          url: '/uploads/photo1.jpg',
          mimeType: 'image/jpeg',
          filesize: 2048000,
          uploadedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.findByMimeType(mimeType);

      expect(result).toHaveLength(1);
      expect(result[0].isImage()).toBe(true);
    });

    it('should return empty array when no attachments match MIME type', async () => {
      const mimeType = 'video/mp4';

      mockPrismaService.attachment.findMany.mockResolvedValue([]);

      const result = await repository.findByMimeType(mimeType);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an attachment', async () => {
      const attachmentId = 'attachment-123';

      mockPrismaService.attachment.delete.mockResolvedValue({
        id: attachmentId,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'document.pdf',
        url: '/uploads/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: new Date('2024-01-01T12:00:00Z'),
      });

      await repository.delete(attachmentId);

      expect(mockPrismaService.attachment.delete).toHaveBeenCalledWith({
        where: { id: attachmentId },
      });
    });
  });

  describe('countByTaskId', () => {
    it('should count attachments for a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.attachment.count.mockResolvedValue(3);

      const result = await repository.countByTaskId(taskId);

      expect(mockPrismaService.attachment.count).toHaveBeenCalledWith({
        where: { taskId },
      });
      expect(result).toBe(3);
    });

    it('should return 0 for task with no attachments', async () => {
      const taskId = 'empty-task';

      mockPrismaService.attachment.count.mockResolvedValue(0);

      const result = await repository.countByTaskId(taskId);

      expect(result).toBe(0);
    });
  });

  describe('getTotalSizeByTaskId', () => {
    it('should calculate total size of all attachments for a task', async () => {
      const taskId = 'task-123';

      const prismaAttachments: PrismaAttachment[] = [
        {
          id: 'attachment-1',
          taskId,
          uploadedById: 'user-1',
          filename: 'document1.pdf',
          url: '/uploads/document1.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedAt: new Date(),
        },
        {
          id: 'attachment-2',
          taskId,
          uploadedById: 'user-2',
          filename: 'image.jpg',
          url: '/uploads/image.jpg',
          mimeType: 'image/jpeg',
          filesize: 512000,
          uploadedAt: new Date(),
        },
      ];

      mockPrismaService.attachment.findMany.mockResolvedValue(
        prismaAttachments,
      );

      const result = await repository.getTotalSizeByTaskId(taskId);

      expect(mockPrismaService.attachment.findMany).toHaveBeenCalledWith({
        where: { taskId },
        select: { filesize: true },
      });
      expect(result).toBe(1536000); // 1024000 + 512000
    });

    it('should return 0 for task with no attachments', async () => {
      const taskId = 'empty-task';

      mockPrismaService.attachment.findMany.mockResolvedValue([]);

      const result = await repository.getTotalSizeByTaskId(taskId);

      expect(result).toBe(0);
    });
  });

  describe('toDomain mapping', () => {
    it('should correctly map Prisma Attachment to domain Attachment', async () => {
      const attachmentId = 'attachment-123';

      const prismaAttachment: PrismaAttachment = {
        id: attachmentId,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'stored-name.pdf',
        url: '/uploads/stored-name.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: new Date('2024-01-01T12:00:00Z'),
      };

      mockPrismaService.attachment.findUnique.mockResolvedValue(
        prismaAttachment,
      );

      const result = await repository.findById(attachmentId);

      expect(result).toBeInstanceOf(Attachment);
      expect(result?.id).toBe(attachmentId);
      expect(result?.taskId).toBe('task-123');
      expect(result?.userId).toBe('user-456'); // Maps from uploadedById
      expect(result?.fileName).toBe('stored-name.pdf'); // Maps from filename
      expect(result?.originalName).toBe('stored-name.pdf'); // Same as filename
      expect(result?.storagePath).toBe('/uploads/stored-name.pdf'); // Maps from url
      expect(result?.mimeType).toBe('application/pdf');
      expect(result?.size).toBe(1024000); // Maps from filesize
      expect(result?.isUploaded).toBe(true); // Computed from uploadedAt
    });

    it('should handle attachment with null uploadedAt', async () => {
      const attachmentId = 'attachment-pending';

      const prismaAttachment: PrismaAttachment = {
        id: attachmentId,
        taskId: 'task-123',
        uploadedById: 'user-456',
        filename: 'pending.pdf',
        url: '/uploads/pending.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedAt: null as unknown as Date,
      };

      mockPrismaService.attachment.findUnique.mockResolvedValue(
        prismaAttachment,
      );

      const result = await repository.findById(attachmentId);

      expect(result?.isUploaded).toBe(false);
    });
  });
});
