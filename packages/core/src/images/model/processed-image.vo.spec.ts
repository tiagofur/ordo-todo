import { ProcessedImage } from './processed-image.vo';

describe('ProcessedImage Value Object', () => {
  const validBuffer = Buffer.from('test image data');

  const validProps = {
    buffer: validBuffer,
    width: 256,
    height: 256,
    format: 'jpeg',
    size: 12345,
  };

  describe('Constructor', () => {
    it('should create valid processed image', () => {
      const processed = new ProcessedImage(validProps);

      expect(processed.buffer).toBe(validBuffer);
      expect(processed.width).toBe(256);
      expect(processed.height).toBe(256);
      expect(processed.format).toBe('jpeg');
      expect(processed.size).toBe(12345);
    });

    it('should create with optional original name', () => {
      const processed = new ProcessedImage({
        ...validProps,
        originalName: 'avatar.jpg',
      });

      expect(processed.originalName).toBe('avatar.jpg');
    });

    it('should throw error if buffer is empty', () => {
      expect(() => {
        new ProcessedImage({
          ...validProps,
          buffer: Buffer.from(''),
        });
      }).toThrow('Processed image must have a valid buffer');
    });

    it('should throw error if dimensions are invalid', () => {
      expect(() => {
        new ProcessedImage({
          ...validProps,
          width: 0,
        });
      }).toThrow('Processed image must have valid dimensions');

      expect(() => {
        new ProcessedImage({
          ...validProps,
          height: -1,
        });
      }).toThrow('Processed image must have valid dimensions');
    });

    it('should throw error if size is invalid', () => {
      expect(() => {
        new ProcessedImage({
          ...validProps,
          size: 0,
        });
      }).toThrow('Processed image must have a valid size');
    });

    it('should throw error if format is empty', () => {
      expect(() => {
        new ProcessedImage({
          ...validProps,
          format: '',
        });
      }).toThrow('Processed image must have a format');
    });
  });

  describe('Size Calculations', () => {
    it('should get size in different units', () => {
      const processed = new ProcessedImage({
        ...validProps,
        size: 102400, // 100 KB
      });

      expect(processed.getSizeInBytes()).toBe(102400);
      expect(processed.getSizeInKB()).toBe(100);
      expect(processed.getSizeInMB()).toBeCloseTo(0.0977, 2);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect square image', () => {
      const square = new ProcessedImage({
        ...validProps,
        width: 256,
        height: 256,
      });

      expect(square.isSquare()).toBe(true);
      expect(square.isLandscape()).toBe(false);
      expect(square.isPortrait()).toBe(false);
    });

    it('should detect landscape image', () => {
      const landscape = new ProcessedImage({
        ...validProps,
        width: 1920,
        height: 1080,
      });

      expect(landscape.isSquare()).toBe(false);
      expect(landscape.isLandscape()).toBe(true);
      expect(landscape.isPortrait()).toBe(false);
    });

    it('should detect portrait image', () => {
      const portrait = new ProcessedImage({
        ...validProps,
        width: 1080,
        height: 1920,
      });

      expect(portrait.isSquare()).toBe(false);
      expect(portrait.isLandscape()).toBe(false);
      expect(portrait.isPortrait()).toBe(true);
    });
  });

  describe('Format Detection', () => {
    it('should detect JPEG format', () => {
      const jpeg = new ProcessedImage({
        ...validProps,
        format: 'jpeg',
      });
      expect(jpeg.isJPEG()).toBe(true);

      const jpg = new ProcessedImage({
        ...validProps,
        format: 'jpg',
      });
      expect(jpg.isJPEG()).toBe(true);
    });

    it('should detect PNG format', () => {
      const png = new ProcessedImage({
        ...validProps,
        format: 'png',
      });
      expect(png.isPNG()).toBe(true);
    });

    it('should detect WEBP format', () => {
      const webp = new ProcessedImage({
        ...validProps,
        format: 'webp',
      });
      expect(webp.isWEBP()).toBe(true);
    });
  });

  describe('Calculations', () => {
    it('should calculate aspect ratio', () => {
      const landscape = new ProcessedImage({
        ...validProps,
        width: 1920,
        height: 1080,
      });
      expect(landscape.getAspectRatio()).toBeCloseTo(1.78, 2);

      const portrait = new ProcessedImage({
        ...validProps,
        width: 1080,
        height: 1920,
      });
      expect(portrait.getAspectRatio()).toBeCloseTo(0.56, 2);
    });

    it('should calculate megapixels', () => {
      const hd = new ProcessedImage({
        ...validProps,
        width: 1920,
        height: 1080,
      });
      expect(hd.getMegapixels()).toBeCloseTo(2.07, 2);
    });
  });

  describe('File Operations', () => {
    it('should generate filename', () => {
      const processed = new ProcessedImage({
        ...validProps,
        format: 'jpeg',
      });

      const filename = processed.generateFilename('avatar');
      expect(filename).toMatch(/^avatar-\d+\.jpg$/);
    });

    it('should get file extension', () => {
      const jpeg = new ProcessedImage({
        ...validProps,
        format: 'jpeg',
      });
      expect(jpeg.getExtension()).toBe('jpg');

      const png = new ProcessedImage({
        ...validProps,
        format: 'png',
      });
      expect(png.getExtension()).toBe('png');
    });

    it('should get MIME type', () => {
      const jpeg = new ProcessedImage({
        ...validProps,
        format: 'jpeg',
      });
      expect(jpeg.getMimeType()).toBe('image/jpeg');

      const png = new ProcessedImage({
        ...validProps,
        format: 'png',
      });
      expect(png.getMimeType()).toBe('image/png');
    });
  });

  describe('DTO Conversion', () => {
    it('should convert to DTO', () => {
      const processed = new ProcessedImage({
        buffer: validBuffer,
        width: 1920,
        height: 1080,
        format: 'jpeg',
        size: 102400,
      });

      const dto = processed.toDTO();

      expect(dto.size).toBe(102400);
      expect(dto.width).toBe(1920);
      expect(dto.height).toBe(1080);
      expect(dto.format).toBe('jpeg');
      expect(dto.sizeInKB).toBe(100);
      expect(dto.aspectRatio).toBeCloseTo(1.78, 1);
      expect(dto.isSquare).toBe(false);
      expect(dto.mimeType).toBe('image/jpeg');
    });
  });
});
