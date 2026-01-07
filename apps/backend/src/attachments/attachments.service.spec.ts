import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Attachment } from '@ordo-todo/core';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../database/prisma.service';
import type { AttachmentRepository } from '@ordo-todo/core';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let attachmentRepository: jest.Mocked<AttachmentRepository>;
  let prisma: any;

  // Mock attachment entity
  const mockAttachment = new Attachment({
    id: 'attachment-123',
    taskId: 'task-123',
    userId: 'user-123',
    fileName: 'stored-document.pdf',
    originalName: 'document.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    storagePath: '/uploads/stored-document.pdf',
    isUploaded: true,
    uploadedAt: new Date('2025-01-01'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  });

  // Mock user
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
  };

  // Mock task
  const mockTask = {
    id: 'task-123',
    ownerId: 'user-123',
  };

  beforeEach(async () => {
    const mockUserFindUnique = jest.fn();
    const mockTaskFindUnique = jest.fn();
    const mockAttachmentFindMany = jest.fn();
    const mockAttachmentFindFirst = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        {
          provide: 'AttachmentRepository',
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findByTaskId: jest.fn(),
            findByUserId: jest.fn(),
            findByMimeType: jest.fn(),
            delete: jest.fn(),
            countByTaskId: jest.fn(),
            getTotalSizeByTaskId: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: mockUserFindUnique,
            },
            task: {
              findUnique: mockTaskFindUnique,
            },
            attachment: {
              findMany: mockAttachmentFindMany,
              findFirst: mockAttachmentFindFirst,
            },
          },
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    attachmentRepository = module.get('AttachmentRepository');
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockUserFindUnique.mockResolvedValue(mockUser);
    mockTaskFindUnique.mockResolvedValue(mockTask);
  });

  describe('create', () => {
    it('should create an attachment and return with uploader details', async () => {
      const createAttachmentDto: CreateAttachmentDto = {
        taskId: 'task-123',
        filename: 'document.pdf',
        url: '/uploads/stored-document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
      };

      attachmentRepository.create.mockResolvedValue(mockAttachment);

      const result = await service.create(createAttachmentDto, 'user-123');

      expect(attachmentRepository.create).toHaveBeenCalledWith(
        expect.any(Attachment),
      );
      expect(result).toMatchObject({
        taskId: 'task-123',
        filename: 'document.pdf',
        url: '/uploads/stored-document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedById: 'user-123',
        uploadedBy: { id: 'user-123', name: 'Test User' },
      });
      expect(result.id).toBeDefined();
      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should handle missing uploader gracefully', async () => {
      const createAttachmentDto: CreateAttachmentDto = {
        taskId: 'task-123',
        filename: 'document.pdf',
        url: '/uploads/stored-document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
      };

      attachmentRepository.create.mockResolvedValue(mockAttachment);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.create(createAttachmentDto, 'user-123');

      expect(result.uploadedBy).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return an attachment with uploader and task details', async () => {
      attachmentRepository.findById.mockResolvedValue(mockAttachment);

      const result = (await service.findOne('attachment-123')) as any;

      expect(attachmentRepository.findById).toHaveBeenCalledWith(
        'attachment-123',
      );
      expect(result.task).toBeDefined();
      expect(result.uploadedBy).toEqual({
        id: 'user-123',
        name: 'Test User',
      });
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update attachment when user is uploader', async () => {
      const updateAttachmentDto: CreateAttachmentDto = {
        taskId: 'task-123',
        filename: 'updated-document.pdf',
        url: '/uploads/updated-document.pdf',
        mimeType: 'application/pdf',
        filesize: 2048000,
      };

      attachmentRepository.findById.mockResolvedValue(mockAttachment);
      attachmentRepository.update.mockResolvedValue(mockAttachment);

      const result = await service.update(
        'attachment-123',
        updateAttachmentDto,
        'user-123',
      );

      expect(attachmentRepository.update).toHaveBeenCalled();
      expect(result.filename).toBe('updated-document.pdf');
    });

    it('should update attachment when user is task owner', async () => {
      const updateAttachmentDto: CreateAttachmentDto = {
        taskId: 'task-123',
        filename: 'updated-document.pdf',
        url: '/uploads/updated-document.pdf',
        mimeType: 'application/pdf',
        filesize: 2048000,
      };

      const differentUserAttachment = new Attachment({
        ...mockAttachment.props,
        userId: 'user-456',
      });

      attachmentRepository.findById.mockResolvedValue(differentUserAttachment);
      attachmentRepository.update.mockResolvedValue(mockAttachment);

      const result = await service.update(
        'attachment-123',
        updateAttachmentDto,
        'user-123', // Task owner
      );

      expect(attachmentRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', {} as CreateAttachmentDto, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const differentUserAttachment = new Attachment({
        ...mockAttachment.props,
        userId: 'user-456',
      });

      const differentOwnerTask = {
        id: 'task-123',
        ownerId: 'user-789',
      };

      attachmentRepository.findById.mockResolvedValue(differentUserAttachment);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(
        differentOwnerTask,
      );

      await expect(
        service.update('attachment-123', {} as CreateAttachmentDto, 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete attachment when user is uploader', async () => {
      attachmentRepository.findById.mockResolvedValue(mockAttachment);
      attachmentRepository.delete.mockResolvedValue(undefined);

      // Mock unlink for file deletion
      const unlinkSpy = jest
        .spyOn(require('fs/promises'), 'unlink')
        .mockResolvedValue(undefined);

      const result = await service.remove('attachment-123', 'user-123');

      expect(attachmentRepository.delete).toHaveBeenCalledWith(
        'attachment-123',
      );
      expect(result).toEqual({ success: true });

      unlinkSpy.mockRestore();
    });

    it('should throw NotFoundException when attachment not found', async () => {
      attachmentRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const differentUserAttachment = new Attachment({
        ...mockAttachment.props,
        userId: 'user-456',
      });

      const differentOwnerTask = {
        id: 'task-123',
        ownerId: 'user-789',
      };

      attachmentRepository.findById.mockResolvedValue(differentUserAttachment);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(
        differentOwnerTask,
      );

      await expect(
        service.remove('attachment-123', 'user-999'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByTask', () => {
    it('should return attachments with uploader details', async () => {
      const mockAttachments = [
        mockAttachment,
        new Attachment({
          ...mockAttachment.props,
          id: 'attachment-456',
          originalName: 'image.jpg',
          mimeType: 'image/jpeg',
        }),
      ];

      attachmentRepository.findByTaskId.mockResolvedValue(mockAttachments);

      const result = await service.findByTask('task-123');

      expect(attachmentRepository.findByTaskId).toHaveBeenCalledWith(
        'task-123',
      );
      expect(result).toHaveLength(2);
      expect(result[0].uploadedBy).toEqual({
        id: 'user-123',
        name: 'Test User',
      });
    });

    it('should return empty array when no attachments found', async () => {
      attachmentRepository.findByTaskId.mockResolvedValue([]);

      const result = await service.findByTask('task-123');

      expect(result).toEqual([]);
    });
  });

  describe('findByProject', () => {
    it('should return attachments for project with uploader and task details', async () => {
      const dbAttachments = [
        {
          id: 'attachment-123',
          taskId: 'task-123',
          filename: 'document.pdf',
          url: '/uploads/document.pdf',
          mimeType: 'application/pdf',
          filesize: 1024000,
          uploadedById: 'user-123',
          uploadedAt: new Date('2025-01-01'),
          uploadedBy: { id: 'user-123', name: 'Test User' },
          task: { id: 'task-123', title: 'Test Task' },
        },
      ];

      (prisma.attachment.findMany as jest.Mock).mockResolvedValue(
        dbAttachments,
      );

      const result = await service.findByProject('project-123');

      expect(prisma.attachment.findMany).toHaveBeenCalledWith({
        where: {
          task: {
            projectId: 'project-123',
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
      expect(result).toHaveLength(1);
    });
  });

  describe('findByUser', () => {
    it('should return attachments uploaded by user', async () => {
      const mockAttachments = [
        mockAttachment,
        new Attachment({
          ...mockAttachment.props,
          id: 'attachment-456',
          taskId: 'task-456',
        }),
      ];

      attachmentRepository.findByUserId.mockResolvedValue(mockAttachments);

      const result = await service.findByUser('user-123');

      expect(attachmentRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('deletePhysicalFile', () => {
    it('should delete physical file successfully', async () => {
      const unlinkSpy = jest
        .spyOn(require('fs/promises'), 'unlink')
        .mockResolvedValue(undefined);

      await service.deletePhysicalFile('/uploads/document.pdf');

      expect(unlinkSpy).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
      );

      unlinkSpy.mockRestore();
    });

    it('should handle file deletion errors gracefully', async () => {
      jest
        .spyOn(require('fs/promises'), 'unlink')
        .mockRejectedValue(new Error('File not found'));

      // Should not throw
      await expect(
        service.deletePhysicalFile('/uploads/non-existent.pdf'),
      ).resolves.not.toThrow();
    });
  });

  describe('cleanOrphanedFiles', () => {
    it('should delete orphaned files', async () => {
      jest
        .spyOn(require('fs/promises'), 'readdir')
        .mockResolvedValue(['file1.pdf', 'file2.jpg'] as any);

      (prisma.attachment.findFirst as jest.Mock).mockResolvedValue(null);
      jest.spyOn(require('fs/promises'), 'unlink').mockResolvedValue(undefined);

      const result = await service.cleanOrphanedFiles();

      expect(result.deleted).toBe(2);
    });
  });
});
