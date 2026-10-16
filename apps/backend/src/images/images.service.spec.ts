import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';

const mockSharpInstance = {
  metadata: jest.fn(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn(),
};

jest.mock('sharp', () => {
  return jest.fn(() => mockSharpInstance);
});

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
}));

describe('ImagesService', () => {
  let service: ImagesService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSharpInstance.metadata.mockResolvedValue({
      width: 1024,
      height: 768,
    });
    mockSharpInstance.toBuffer.mockResolvedValue({
      data: Buffer.from('processed-image'),
      info: {
        width: 256,
        height: 256,
        size: 5000,
      },
    });

    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('processAvatar', () => {
    it('should process a valid image successfully', async () => {
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;

      const result = await service.processAvatar(file);

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('width', 256);
      expect(result).toHaveProperty('height', 256);
      expect(result).toHaveProperty('format', 'jpeg');
      expect(result).toHaveProperty('size');
    });

    it('should throw BadRequestException for file too large', async () => {
      const file = {
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB - over limit
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      await expect(service.processAvatar(file)).rejects.toThrow(
        new BadRequestException('File too large. Maximum size is 5MB'),
      );
    });

    it('should throw BadRequestException for non-image file', async () => {
      const file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024,
        buffer: Buffer.from('test-pdf'),
      } as Express.Multer.File;

      await expect(service.processAvatar(file)).rejects.toThrow(
        new BadRequestException(
          'Only image files are allowed (JPEG, PNG, WEBP)',
        ),
      );
    });

    it('should throw BadRequestException for image too large', async () => {
      const file = {
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 5000, // Over 4000 limit
        height: 5000,
      });

      await expect(service.processAvatar(file)).rejects.toThrow(
        new BadRequestException(
          'Image too large. Maximum dimensions are 4000x4000px',
        ),
      );
    });
  });

  describe('saveAvatar', () => {
    it('should save avatar and return URL', async () => {
      const buffer = Buffer.from('test-image');
      const userId = 'user-123';

      const result = await service.saveAvatar(buffer, userId);

      expect(result).toMatch(/^\/uploads\/avatars\/avatar-user-123-\d+\.jpg$/);
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create uploads directory if not exists', async () => {
      const buffer = Buffer.from('test-image');
      const userId = 'user-123';

      await service.saveAvatar(buffer, userId);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/avatars'),
        { recursive: true },
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar file', async () => {
      const imageUrl = '/uploads/avatars/user-123-1234567890.jpg';

      await service.deleteAvatar(imageUrl);

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('user-123-1234567890.jpg'),
      );
    });

    it('should handle missing file gracefully', async () => {
      const imageUrl = '/uploads/avatars/user-123-1234567890.jpg';

      (fs.unlink as jest.Mock).mockRejectedValueOnce(
        new Error('File not found'),
      );

      // Should not throw
      await expect(service.deleteAvatar(imageUrl)).resolves.toBeUndefined();
    });

    it('should handle invalid URL gracefully', async () => {
      const invalidUrl = '/invalid/path/';

      // Should not throw and should not attempt to delete
      await expect(service.deleteAvatar(invalidUrl)).resolves.toBeUndefined();
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should handle empty URL gracefully', async () => {
      await expect(service.deleteAvatar('')).resolves.toBeUndefined();
      expect(fs.unlink).not.toHaveBeenCalled();

      await expect(service.deleteAvatar(null as any)).resolves.toBeUndefined();
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('validateImage', () => {
    it('should validate a valid image', async () => {
      const file = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      await expect(service.validateImage(file)).resolves.toBeUndefined();
    });

    it('should throw BadRequestException for oversized file', async () => {
      const file = {
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      await expect(service.validateImage(file)).rejects.toThrow(
        new BadRequestException('File too large. Maximum size is 5MB'),
      );
    });

    it('should throw BadRequestException for non-image', async () => {
      const file = {
        originalname: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test-pdf'),
      } as Express.Multer.File;

      await expect(service.validateImage(file)).rejects.toThrow(
        new BadRequestException('Only image files are allowed'),
      );
    });

    it('should throw BadRequestException for oversized dimensions', async () => {
      const file = {
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 5000,
        height: 5000,
      });

      await expect(service.validateImage(file)).rejects.toThrow(
        new BadRequestException(
          'Invalid image dimensions. Maximum is 4000x4000px',
        ),
      );
    });
  });
});
