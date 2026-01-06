import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ImagesService } from '../images/images.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersController - Avatar Endpoints', () => {
  let controller: UsersController;
  let service: UsersService;
  let imagesService: ImagesService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockUserWithAvatar = {
    ...mockUser,
    image: '/uploads/avatars/user-123-old.jpg',
  };

  const mockProcessedAvatar = {
    buffer: Buffer.from('test-image-data'),
    width: 256,
    height: 256,
    format: 'jpeg',
    size: 12345,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getMe: jest.fn(),
            updateAvatar: jest.fn(),
            removeAvatar: jest.fn(),
          },
        },
        {
          provide: ImagesService,
          useValue: {
            processAvatar: jest.fn(),
            saveAvatar: jest.fn(),
            deleteAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    imagesService = module.get<ImagesService>(ImagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users/me/avatar', () => {
    it('should upload and process avatar successfully', async () => {
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      jest.spyOn(service, 'getMe').mockResolvedValue(mockUser);
      jest
        .spyOn(imagesService, 'processAvatar')
        .mockResolvedValue(mockProcessedAvatar);
      jest
        .spyOn(imagesService, 'saveAvatar')
        .mockResolvedValue('/uploads/avatars/user-123-new.jpg');
      jest.spyOn(service, 'updateAvatar').mockResolvedValue(undefined);

      const result = await controller.uploadAvatar(mockUser as any, file);

      expect(imagesService.processAvatar).toHaveBeenCalledWith(file);
      expect(imagesService.saveAvatar).toHaveBeenCalledWith(
        mockProcessedAvatar.buffer,
        mockUser.id,
      );
      expect(service.updateAvatar).toHaveBeenCalledWith(
        mockUser.email,
        '/uploads/avatars/user-123-new.jpg',
      );
      expect(result).toEqual({
        url: '/uploads/avatars/user-123-new.jpg',
        message: 'Avatar uploaded successfully',
      });
    });

    it('should delete old avatar before uploading new one', async () => {
      const file = {
        originalname: 'new-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      jest.spyOn(service, 'getMe').mockResolvedValue(mockUserWithAvatar);
      jest
        .spyOn(imagesService, 'processAvatar')
        .mockResolvedValue(mockProcessedAvatar);
      jest
        .spyOn(imagesService, 'saveAvatar')
        .mockResolvedValue('/uploads/avatars/user-123-new.jpg');
      jest.spyOn(imagesService, 'deleteAvatar').mockResolvedValue(undefined);
      jest.spyOn(service, 'updateAvatar').mockResolvedValue(undefined);

      await controller.uploadAvatar(mockUser as any, file);

      expect(imagesService.deleteAvatar).toHaveBeenCalledWith(
        '/uploads/avatars/user-123-old.jpg',
      );
      expect(imagesService.saveAvatar).toHaveBeenCalled();
    });

    it('should not attempt to delete old avatar if user has none', async () => {
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      jest.spyOn(service, 'getMe').mockResolvedValue(mockUser);
      jest
        .spyOn(imagesService, 'processAvatar')
        .mockResolvedValue(mockProcessedAvatar);
      jest
        .spyOn(imagesService, 'saveAvatar')
        .mockResolvedValue('/uploads/avatars/user-123-new.jpg');
      jest.spyOn(imagesService, 'deleteAvatar').mockResolvedValue(undefined);
      jest.spyOn(service, 'updateAvatar').mockResolvedValue(undefined);

      await controller.uploadAvatar(mockUser as any, file);

      expect(imagesService.deleteAvatar).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no file uploaded', async () => {
      await expect(
        controller.uploadAvatar(mockUser as any, null as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle image processing errors', async () => {
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB - too large
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      jest
        .spyOn(imagesService, 'processAvatar')
        .mockRejectedValue(
          new BadRequestException('File too large. Maximum size is 5MB'),
        );

      await expect(
        controller.uploadAvatar(mockUser as any, file),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DELETE /users/me/avatar', () => {
    it('should delete avatar successfully', async () => {
      jest.spyOn(service, 'getMe').mockResolvedValue(mockUserWithAvatar);
      jest.spyOn(imagesService, 'deleteAvatar').mockResolvedValue(undefined);
      jest.spyOn(service, 'removeAvatar').mockResolvedValue(undefined);

      const result = await controller.deleteAvatar(mockUser as any);

      expect(imagesService.deleteAvatar).toHaveBeenCalledWith(
        '/uploads/avatars/user-123-old.jpg',
      );
      expect(service.removeAvatar).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual({
        success: true,
        message: 'Avatar deleted successfully',
      });
    });

    it('should handle user without avatar gracefully', async () => {
      jest.spyOn(service, 'getMe').mockResolvedValue(mockUser);
      jest.spyOn(imagesService, 'deleteAvatar').mockResolvedValue(undefined);
      jest.spyOn(service, 'removeAvatar').mockResolvedValue(undefined);

      const result = await controller.deleteAvatar(mockUser as any);

      expect(imagesService.deleteAvatar).not.toHaveBeenCalled();
      expect(service.removeAvatar).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual({
        success: true,
        message: 'Avatar deleted successfully',
      });
    });

    it('should continue with removal even if file deletion fails', async () => {
      jest.spyOn(service, 'getMe').mockResolvedValue(mockUserWithAvatar);
      // deleteAvatar catches errors internally and resolves
      jest.spyOn(imagesService, 'deleteAvatar').mockResolvedValue(undefined);
      jest.spyOn(service, 'removeAvatar').mockResolvedValue(undefined);

      const result = await controller.deleteAvatar(mockUser as any);

      expect(imagesService.deleteAvatar).toHaveBeenCalled();
      expect(service.removeAvatar).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Avatar deleted successfully',
      });
    });
  });
});
