import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

describe('AttachmentsController', () => {
  let controller: AttachmentsController;
  let attachmentsService: jest.Mocked<AttachmentsService>;

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
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentsController],
      providers: [
        { provide: AttachmentsService, useValue: mockAttachmentsService },
      ],
    }).compile();

    controller = module.get<AttachmentsController>(AttachmentsController);
    attachmentsService = module.get<AttachmentsService>(
      AttachmentsService,
    ) as jest.Mocked<AttachmentsService>;
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
      const taskId = 'task-123';
      const mockAttachment = {
        id: 'att-123',
        taskId,
        filename: 'test.pdf',
        url: '/uploads/task-123-123456789-test.pdf',
        mimeType: 'application/pdf',
        filesize: 1024,
      };

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
});
