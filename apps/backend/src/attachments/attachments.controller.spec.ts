import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

describe('AttachmentsController', () => {
    let controller: AttachmentsController;
    let attachmentsService: jest.Mocked<AttachmentsService>;

    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

    beforeEach(async () => {
        const mockAttachmentsService = {
            create: jest.fn(),
            findByTask: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
            getDownloadUrl: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AttachmentsController],
            providers: [
                { provide: AttachmentsService, useValue: mockAttachmentsService },
            ],
        }).compile();

        controller = module.get<AttachmentsController>(AttachmentsController);
        attachmentsService = module.get<AttachmentsService>(AttachmentsService) as jest.Mocked<AttachmentsService>;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('upload', () => {
        it('should upload file and create attachment', async () => {
            const mockFile = {
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                size: 1024,
                buffer: Buffer.from('test'),
            } as Express.Multer.File;
            const taskId = 'task-123';
            const mockAttachment = {
                id: 'att-123',
                taskId,
                filename: 'test.pdf',
                url: 'https://storage.com/test.pdf',
            };

            attachmentsService.create.mockResolvedValue(mockAttachment as any);

            const result = await controller.upload(taskId, mockFile, mockUser);

            expect(attachmentsService.create).toHaveBeenCalledWith(taskId, mockFile, mockUser.id);
            expect(result).toEqual(mockAttachment);
        });
    });

    describe('findByTask', () => {
        it('should return attachments for task', async () => {
            const mockAttachments = [
                { id: 'att-1', filename: 'doc.pdf' },
                { id: 'att-2', filename: 'image.png' },
            ];
            attachmentsService.findByTask.mockResolvedValue(mockAttachments as any);

            const result = await controller.findByTask('task-123', mockUser);

            expect(attachmentsService.findByTask).toHaveBeenCalledWith('task-123', mockUser.id);
            expect(result).toEqual(mockAttachments);
        });
    });

    describe('findOne', () => {
        it('should return attachment by id', async () => {
            const mockAttachment = { id: 'att-123', filename: 'test.pdf' };
            attachmentsService.findById.mockResolvedValue(mockAttachment as any);

            const result = await controller.findOne('att-123', mockUser);

            expect(attachmentsService.findById).toHaveBeenCalledWith('att-123', mockUser.id);
            expect(result).toEqual(mockAttachment);
        });
    });

    describe('remove', () => {
        it('should delete attachment', async () => {
            attachmentsService.delete.mockResolvedValue(undefined);

            await controller.remove('att-123', mockUser);

            expect(attachmentsService.delete).toHaveBeenCalledWith('att-123', mockUser.id);
        });
    });

    describe('download', () => {
        it('should return download URL', async () => {
            const mockUrl = 'https://storage.com/signed-url';
            attachmentsService.getDownloadUrl.mockResolvedValue(mockUrl);

            const result = await controller.download('att-123', mockUser);

            expect(attachmentsService.getDownloadUrl).toHaveBeenCalledWith('att-123', mockUser.id);
            expect(result).toEqual({ url: mockUrl });
        });
    });
});
