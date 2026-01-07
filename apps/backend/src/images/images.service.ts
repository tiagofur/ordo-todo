import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { ImageSpecs, ProcessedImage as DomainProcessedImage } from '@ordo-todo/core';

/**
 * Image processing service for avatar uploads and image optimization
 *
 * Refactored to use domain layer (ImageSpecs, ProcessedImage)
 * Handles validation, resizing, and optimization of user-uploaded images.
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

  private readonly UPLOAD_DIR = 'uploads/avatars';

  constructor(private config: ConfigService) {
    // Ensure upload directory exists
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.ensureUploadDirectory();
  }

  /**
   * Validate and optimize avatar image using domain specifications
   *
   * Performs the following operations:
   * 1. Validates file size using ImageSpecs
   * 2. Validates file format (images only)
   * 3. Validates dimensions using ImageSpecs
   * 4. Resizes to target size from ImageSpecs
   * 5. Converts to target format/quality from ImageSpecs
   *
   * @param file - Uploaded file from Multer
   * @returns Processed image value object
   * @throws {BadRequestException} If validation fails
   */
  async processAvatar(file: Express.Multer.File): Promise<DomainProcessedImage> {
    this.logger.log(
      `Processing avatar: ${file.originalname} (${file.size} bytes)`,
    );

    // Use domain specs for avatar processing
    const specs = ImageSpecs.forAvatar();

    // Validate file size using domain specs
    if (!specs.isValidFileSize(file.size)) {
      throw new BadRequestException(
        `File too large. Maximum size is ${specs.getMaxFileSizeInMB()}MB`,
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

      // Validate dimensions using domain specs
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      if (!specs.isValidDimensions(width, height)) {
        throw new BadRequestException(
          `Image too large. Maximum dimensions are ${specs.maxDimensions}x${specs.maxDimensions}px`,
        );
      }

      // Resize and optimize using specs from domain
      image = image
        .resize(specs.targetSize!, specs.targetSize!, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: specs.quality!,
          progressive: true, // Better for web
        });

      const buffer = await image.toBuffer({ resolveWithObject: true });

      this.logger.log(
        `Avatar processed: ${file.originalname} → ${buffer.info.width}x${buffer.info.height} (${buffer.info.size} bytes)`,
      );

      // Return domain ProcessedImage value object
      return new DomainProcessedImage({
        buffer: buffer.data,
        width: buffer.info.width,
        height: buffer.info.height,
        format: specs.format!,
        size: buffer.info.size,
        originalName: file.originalname,
      });
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
   * Uses domain specs for validation logic.
   *
   * @param file - File to validate
   * @returns Promise that resolves if valid, rejects if invalid
   */
  async validateImage(file: Express.Multer.File): Promise<void> {
    const specs = ImageSpecs.forAvatar();

    if (!specs.isValidFileSize(file.size)) {
      throw new BadRequestException(
        `File too large. Maximum size is ${specs.getMaxFileSizeInMB()}MB`,
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
        !specs.isValidDimensions(metadata.width, metadata.height)
      ) {
        throw new BadRequestException(
          `Invalid image dimensions. Maximum is ${specs.maxDimensions}x${specs.maxDimensions}px`,
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
