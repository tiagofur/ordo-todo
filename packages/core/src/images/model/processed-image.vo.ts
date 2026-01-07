/**
 * Value Object representing a processed image
 *
 * Contains the result of image processing operations including
 * the buffer, dimensions, format, and size information.
 *
 * @example
 * ```typescript
 * const processed = new ProcessedImage({
 *   buffer: Buffer.from('...'),
 *   width: 256,
 *   height: 256,
 *   format: 'jpeg',
 *   size: 12345,
 *   originalName: 'avatar.jpg',
 * });
 *
 * processed.isSquare(); // true
 * processed.getSizeInKB(); // ~12 KB
 * ```
 */
export class ProcessedImage {
  readonly buffer: Buffer;
  readonly width: number;
  readonly height: number;
  readonly format: string;
  readonly size: number;
  readonly originalName?: string;

  constructor(props: {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number;
    originalName?: string;
  }) {
    this.buffer = props.buffer;
    this.width = props.width;
    this.height = props.height;
    this.format = props.format;
    this.size = props.size;
    this.originalName = props.originalName;

    this.validate();
  }

  private validate(): void {
    if (!this.buffer || this.buffer.length === 0) {
      throw new Error('Processed image must have a valid buffer');
    }
    if (this.width <= 0 || this.height <= 0) {
      throw new Error('Processed image must have valid dimensions');
    }
    if (this.size <= 0) {
      throw new Error('Processed image must have a valid size');
    }
    if (!this.format || this.format.trim() === '') {
      throw new Error('Processed image must have a format');
    }
  }

  /**
   * Get size in bytes
   */
  getSizeInBytes(): number {
    return this.size;
  }

  /**
   * Get size in KB
   */
  getSizeInKB(): number {
    return this.size / 1024;
  }

  /**
   * Get size in MB
   */
  getSizeInMB(): number {
    return this.size / (1024 * 1024);
  }

  /**
   * Check if image is square
   */
  isSquare(): boolean {
    return this.width === this.height;
  }

  /**
   * Check if image is landscape
   */
  isLandscape(): boolean {
    return this.width > this.height;
  }

  /**
   * Check if image is portrait
   */
  isPortrait(): boolean {
    return this.height > this.width;
  }

  /**
   * Check if format is JPEG
   */
  isJPEG(): boolean {
    return this.format.toLowerCase() === 'jpeg' || this.format.toLowerCase() === 'jpg';
  }

  /**
   * Check if format is PNG
   */
  isPNG(): boolean {
    return this.format.toLowerCase() === 'png';
  }

  /**
   * Check if format is WEBP
   */
  isWEBP(): boolean {
    return this.format.toLowerCase() === 'webp';
  }

  /**
   * Get aspect ratio
   */
  getAspectRatio(): number {
    return this.width / this.height;
  }

  /**
   * Get megapixel count
   */
  getMegapixels(): number {
    return (this.width * this.height) / 1_000_000;
  }

  /**
   * Generate filename for storage
   */
  generateFilename(prefix: string = 'img'): string {
    const timestamp = Date.now();
    const ext = this.getExtension();
    return `${prefix}-${timestamp}.${ext}`;
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    const formatMap: Record<string, string> = {
      jpeg: 'jpg',
      jpg: 'jpg',
      png: 'png',
      webp: 'webp',
      gif: 'gif',
    };
    return formatMap[this.format.toLowerCase()] || this.format;
  }

  /**
   * Get MIME type
   */
  getMimeType(): string {
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return mimeMap[this.format.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Convert to DTO for API responses
   */
  toDTO() {
    return {
      size: this.size,
      width: this.width,
      height: this.height,
      format: this.format,
      sizeInKB: Math.round(this.getSizeInKB() * 100) / 100,
      sizeInMB: Math.round(this.getSizeInMB() * 100) / 100,
      aspectRatio: Math.round(this.getAspectRatio() * 100) / 100,
      megapixels: Math.round(this.getMegapixels() * 100) / 100,
      isSquare: this.isSquare(),
      mimeType: this.getMimeType(),
    };
  }
}
