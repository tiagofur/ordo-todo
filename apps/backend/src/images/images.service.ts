import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * ProcessedImage result interface
 *
 * @example
 * ```typescript
 * const processed: ProcessedImage = {
 *   buffer: Buffer.from('...'),
 *   width: 256,
 *   height: 256,
 *   format: 'jpeg',
 *   size: 12345,
 * };
 * ```
 */
export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Image processing service for avatar uploads and image optimization
 *
 * Handles validation, resizing, and optimization of user-uploaded images.
 * Supports JPEG, PNG, WEBP formats with automatic conversion to JPEG for avatars.
 *
 * @example
 * ```typescript
 * const processed = await imagesService.processAvatar(file);
 * await imagesService.saveAvatar(processed.buffer, 'user-123');
 * ```
 */
@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  // Configuration
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_DIMENSIONS = 4000; // 4000x4000px
  private readonly AVATAR_SIZE = 256; // 256x256px
  private readonly AVATAR_QUALITY = 85; // JPEG quality
  private readonly UPLOAD_DIR = 'uploads/avatars';

  constructor(private config: ConfigService) {
    // Ensure upload directory exists
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.ensureUploadDirectory();
  }

  /**
   * Validate and optimize avatar image
   *
   * Performs the following operations:
   * 1. Validates file size (max 5MB)
   * 2. Validates file format (images only)
   * 3. Validates dimensions (max 4000x4000px)
   * 4. Resizes to 256x256px
   * 5. Converts to JPEG with 85% quality
   *
   * @param file - Uploaded file from Multer
   * @returns Processed image buffer
   * @throws {BadRequestException} If validation fails
   *
   * @example
   * ```typescript
   * @Post('avatar')
   * @UseInterceptors(FileInterceptor('avatar'))
   * async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
   *   const processed = await this.imagesService.processAvatar(file);
   *   // Save processed.buffer
   * }
   * ```
   */
  async processAvatar(file: Express.Multer.File): Promise<ProcessedImage> {
    this.logger.log(
      `Processing avatar: ${file.originalname} (${file.size} bytes)`,
    );

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Validate format
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Only image files are allowed (JPEG, PNG, WEBP)',
      );
    }

    try {
      let image = sharp(file.buffer);

      // Get metadata
      const metadata = await image.metadata();

      // Validate dimensions
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      if (width > this.MAX_DIMENSIONS || height > this.MAX_DIMENSIONS) {
        throw new BadRequestException(
          `Image too large. Maximum dimensions are ${this.MAX_DIMENSIONS}x${this.MAX_DIMENSIONS}px`,
        );
      }

      // Resize and optimize for avatar
      image = image
        .resize(this.AVATAR_SIZE, this.AVATAR_SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: this.AVATAR_QUALITY,
          progressive: true, // Better for web
        });

      const buffer = await image.toBuffer({ resolveWithObject: true });

      this.logger.log(
        `Avatar processed: ${file.originalname} → ${buffer.info.width}x${buffer.info.height} (${buffer.info.size} bytes)`,
      );

      return {
        buffer: buffer.data,
        width: buffer.info.width,
        height: buffer.info.height,
        format: 'jpeg',
        size: buffer.info.size,
      };
    } catch (error) {
      this.logger.error('Failed to process avatar', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to process image. Please ensure it is a valid image file.',
      );
    }
  }

  /**
   * Save processed avatar to filesystem
   *
   * @param buffer - Processed image buffer
   * @param userId - User ID for filename
   * @returns Relative URL to saved avatar
   *
   * @example
   * ```typescript
   * const url = await this.imagesService.saveAvatar(buffer, 'user-123');
   * // Returns: '/uploads/avatars/user-123-1234567890.jpg'
   * ```
   */
  async saveAvatar(buffer: Buffer, userId: string): Promise<string> {
    const filename = `avatar-${userId}-${Date.now()}.jpg`;
    const uploadPath = join(process.cwd(), this.UPLOAD_DIR);
    const fullPath = join(uploadPath, filename);

    // Ensure directory exists
    await mkdir(uploadPath, { recursive: true });

    // Save file
    await this.writeImage(fullPath, buffer);

    const url = `/${this.UPLOAD_DIR}/${filename}`;
    this.logger.log(`Avatar saved: ${url}`);

    return url;
  }

  /**
   * Delete avatar image from filesystem
   *
   * @param imageUrl - URL of the avatar to delete
   * @returns Promise that resolves when deleted
   *
   * @example
   * ```typescript
   * await this.imagesService.deleteAvatar('/uploads/avatars/user-123-1234567890.jpg');
   * ```
   */
  async deleteAvatar(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      return;
    }

    try {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      if (!filename) {
        this.logger.warn(`Invalid avatar URL: ${imageUrl}`);
        return;
      }

      const fullPath = join(process.cwd(), this.UPLOAD_DIR, filename);
      await unlink(fullPath);

      this.logger.log(`Avatar deleted: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete avatar: ${imageUrl}`, error);
      // Don't throw - deletion failure is not critical
    }
  }

  /**
   * Validate image without processing
   *
   * Use this when you need to validate an image but don't need to process it yet.
   *
   * @param file - File to validate
   * @returns Promise that resolves if valid, rejects if invalid
   *
   * @example
   * ```typescript
   * try {
   *   await this.imagesService.validateImage(file);
   *   // Image is valid
   * } catch (error) {
   *   // Image is invalid
   * }
   * ```
   */
  async validateImage(file: Express.Multer.File): Promise<void> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    try {
      const metadata = await sharp(file.buffer).metadata();

      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width > this.MAX_DIMENSIONS ||
        metadata.height > this.MAX_DIMENSIONS
      ) {
        throw new BadRequestException(
          `Invalid image dimensions. Maximum is ${this.MAX_DIMENSIONS}x${this.MAX_DIMENSIONS}px`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Invalid image file');
    }
  }

  /**
   * Ensure upload directory exists
   *
   * @private
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      const uploadPath = join(process.cwd(), this.UPLOAD_DIR);
      await mkdir(uploadPath, { recursive: true });
      this.logger.log(`Upload directory ready: ${uploadPath}`);
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  /**
   * Write image buffer to disk with error handling
   *
   * @private
   * @param path - Full path to save file
   * @param buffer - Image buffer to save
   */
  private async writeImage(path: string, buffer: Buffer): Promise<void> {
    try {
      await this.writeImageInternal(path, buffer);
    } catch (error) {
      this.logger.error(`Failed to write image to ${path}`, error);
      throw new BadRequestException('Failed to save image');
    }
  }

  /**
   * Internal method to write image buffer
   *
   * @private
   * @param path - File path
   * @param buffer - Image buffer
   */
  private async writeImageInternal(
    path: string,
    buffer: Buffer,
  ): Promise<void> {
    // Dynamic import to avoid top-level require
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { writeFile } = await Promise.resolve().then(() =>
      require('fs/promises'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await writeFile(path, buffer);
  }
}
