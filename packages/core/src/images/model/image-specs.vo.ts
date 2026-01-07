/**
 * Value Object representing image processing specifications
 *
 * Defines validation rules and processing parameters for images.
 * These specifications are used throughout the image processing pipeline.
 *
 * @example
 * ```typescript
 * const avatarSpecs = ImageSpecs.forAvatar();
 * const customSpecs = new ImageSpecs({
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxDimensions: 5000,
 *   targetSize: 512,
 *   quality: 90,
 *   format: 'jpeg',
 * });
 * ```
 */
export class ImageSpecs {
  readonly maxFileSize: number;
  readonly maxDimensions: number;
  readonly targetSize?: number;
  readonly quality?: number;
  readonly format?: string;

  constructor(props: {
    maxFileSize: number;
    maxDimensions: number;
    targetSize?: number;
    quality?: number;
    format?: string;
  }) {
    this.maxFileSize = props.maxFileSize;
    this.maxDimensions = props.maxDimensions;
    this.targetSize = props.targetSize;
    this.quality = props.quality;
    this.format = props.format;

    this.validate();
  }

  private validate(): void {
    if (this.maxFileSize <= 0) {
      throw new Error('maxFileSize must be greater than 0');
    }
    if (this.maxDimensions <= 0) {
      throw new Error('maxDimensions must be greater than 0');
    }
    if (this.targetSize !== undefined && this.targetSize <= 0) {
      throw new Error('targetSize must be greater than 0');
    }
    if (this.quality !== undefined && (this.quality < 1 || this.quality > 100)) {
      throw new Error('quality must be between 1 and 100');
    }
  }

  /**
   * Get specifications for avatar processing
   */
  static forAvatar(): ImageSpecs {
    return new ImageSpecs({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxDimensions: 4000, // 4000x4000px
      targetSize: 256, // 256x256px
      quality: 85, // JPEG quality
      format: 'jpeg',
    });
  }

  /**
   * Get specifications for general image optimization
   */
  static forOptimization(): ImageSpecs {
    return new ImageSpecs({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxDimensions: 5000,
      targetSize: 1920, // Full HD
      quality: 85,
      format: 'jpeg',
    });
  }

  /**
   * Get specifications for thumbnail processing
   */
  static forThumbnail(): ImageSpecs {
    return new ImageSpecs({
      maxFileSize: 2 * 1024 * 1024, // 2MB
      maxDimensions: 2000,
      targetSize: 150, // 150x150px
      quality: 80,
      format: 'jpeg',
    });
  }

  /**
   * Get max file size in MB
   */
  getMaxFileSizeInMB(): number {
    return this.maxFileSize / (1024 * 1024);
  }

  /**
   * Check if file size is within limits
   */
  isValidFileSize(sizeInBytes: number): boolean {
    return sizeInBytes <= this.maxFileSize;
  }

  /**
   * Check if dimensions are within limits
   */
  isValidDimensions(width: number, height: number): boolean {
    return width <= this.maxDimensions && height <= this.maxDimensions;
  }

  /**
   * Check if this is an avatar specification
   */
  isAvatarSpecs(): boolean {
    return (
      this.targetSize === 256 &&
      this.quality === 85 &&
      this.format === 'jpeg'
    );
  }
}
