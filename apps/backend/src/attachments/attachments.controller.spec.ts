import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { PrismaService } from '../database/prisma.service';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let attachmentsService: jest.Mocked<AttachmentsService>;
  let prismaService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test',
  };

  beforeEach(async () => {
    const mockAttachmentsService = {
      create: jest.fn(),
      findByProject: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockPrismaService = {
      attachment: {
        findUnique: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
      },
      workspaceMember: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentsController],
      providers: [
        { provide: AttachmentsService, useValue: mockAttachmentsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<AttachmentsController>(AttachmentsController);
    attachmentsService = module.get<AttachmentsService>(
      AttachmentsService,
    ) as jest.Mocked<AttachmentsService>;
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file and create attachment', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        filename: 'task-123-123456789-test.pdf',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const taskId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
      const workspaceId = '550e8400-e29b-41d4-a716-446655440002';
      const mockAttachment = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        taskId,
        filename: 'test.pdf',
        url: '/uploads/task-123-123456789-test.pdf',
        mimeType: 'application/pdf',
        filesize: 1024,
      };

      // Mock Prisma calls
      prismaService.task.findUnique.mockResolvedValue({
        id: taskId,
        project: { workspaceId },
      });
      prismaService.workspaceMember.findUnique.mockResolvedValue({
        workspaceId,
        userId: mockUser.id,
      });

      attachmentsService.create.mockResolvedValue(mockAttachment as any);

      const result = await controller.uploadFile(mockFile, taskId, mockUser);

      expect(attachmentsService.create).toHaveBeenCalledWith(
        {
          taskId,
          filename: 'test.pdf',
          url: '/uploads/task-123-123456789-test.pdf',
          mimeType: 'application/pdf',
          filesize: 1024,
        },
        mockUser.id,
      );
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('attachment');
    });
  });

  describe('create', () => {
    it('should create attachment record', async () => {
      const createDto = {
        taskId: 'task-123',
        filename: 'test.pdf',
        url: '/uploads/test.pdf',
        mimeType: 'application/pdf',
        filesize: 1024,
      };
      const mockAttachment = {
        id: 'att-123',
        ...createDto,
      };

      attachmentsService.create.mockResolvedValue(mockAttachment as any);

      const result = await controller.create(createDto, mockUser);

      expect(attachmentsService.create).toHaveBeenCalledWith(
        createDto,
        mockUser.id,
      );
      expect(result).toEqual(mockAttachment);
    });
  });

  describe('findByProject', () => {
    it('should return attachments for project', async () => {
      const mockAttachments = [
        { id: 'att-1', filename: 'doc.pdf' },
        { id: 'att-2', filename: 'image.png' },
      ];
      attachmentsService.findByProject.mockResolvedValue(
        mockAttachments as any,
      );

      const result = await controller.findByProject('project-123');

      expect(attachmentsService.findByProject).toHaveBeenCalledWith(
        'project-123',
      );
      expect(result).toEqual(mockAttachments);
    });
  });

  describe('remove', () => {
    it('should delete attachment', async () => {
      attachmentsService.remove.mockResolvedValue({ success: true } as any);

      const result = await controller.remove('att-123', mockUser);

      expect(attachmentsService.remove).toHaveBeenCalledWith(
        'att-123',
        mockUser.id,
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('findOne', () => {
    it('should return a single attachment by ID', async () => {
      const mockAttachment = {
        id: 'att-123',
        taskId: 'task-123',
        filename: 'document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
        uploadedById: 'user-123',
        uploadedAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      attachmentsService.findOne.mockResolvedValue(mockAttachment as any);

      const result = await controller.findOne('att-123');

      expect(attachmentsService.findOne).toHaveBeenCalledWith('att-123');
      expect(result).toEqual(mockAttachment);
    });

    it('should throw NotFoundException if attachment not found', async () => {
      const { NotFoundException } = require('@nestjs/common');
      attachmentsService.findOne.mockRejectedValue(
        new NotFoundException('Attachment not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update attachment details', async () => {
      const updateDto = {
        taskId: 'task-123',
        filename: 'updated-document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
      };

      const updatedAttachment = {
        id: 'att-123',
        filename: 'updated-document.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
      };

      attachmentsService.update.mockResolvedValue(updatedAttachment as any);

      const result = await controller.update('att-123', updateDto, mockUser);

      expect(attachmentsService.update).toHaveBeenCalledWith(
        'att-123',
        updateDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedAttachment);
    });

    it('should throw ForbiddenException if user is not the uploader', async () => {
      const updateDto = {
        taskId: 'task-123',
        filename: 'updated.pdf',
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        filesize: 1024000,
      };

      const { ForbiddenException } = require('@nestjs/common');
      attachmentsService.update.mockRejectedValue(
        new ForbiddenException('Not the attachment uploader'),
      );

      await expect(
        controller.update('att-123', updateDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
