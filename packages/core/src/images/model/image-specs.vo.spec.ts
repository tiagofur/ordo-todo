import { ImageSpecs } from './image-specs.vo';

describe('ImageSpecs Value Object', () => {
  describe('Constructor', () => {
    it('should create valid image specs', () => {
      const specs = new ImageSpecs({
        maxFileSize: 5 * 1024 * 1024,
        maxDimensions: 4000,
        targetSize: 256,
        quality: 85,
        format: 'jpeg',
      });

      expect(specs.maxFileSize).toBe(5 * 1024 * 1024);
      expect(specs.maxDimensions).toBe(4000);
      expect(specs.targetSize).toBe(256);
      expect(specs.quality).toBe(85);
      expect(specs.format).toBe('jpeg');
    });

    it('should create specs without optional fields', () => {
      const specs = new ImageSpecs({
        maxFileSize: 10 * 1024 * 1024,
        maxDimensions: 5000,
      });

      expect(specs.targetSize).toBeUndefined();
      expect(specs.quality).toBeUndefined();
      expect(specs.format).toBeUndefined();
    });

    it('should throw error if maxFileSize is 0', () => {
      expect(() => {
        new ImageSpecs({
          maxFileSize: 0,
          maxDimensions: 4000,
        });
      }).toThrow('maxFileSize must be greater than 0');
    });

    it('should throw error if maxDimensions is 0', () => {
      expect(() => {
        new ImageSpecs({
          maxFileSize: 5 * 1024 * 1024,
          maxDimensions: 0,
        });
      }).toThrow('maxDimensions must be greater than 0');
    });

    it('should throw error if quality is out of range', () => {
      expect(() => {
        new ImageSpecs({
          maxFileSize: 5 * 1024 * 1024,
          maxDimensions: 4000,
          quality: 0,
        });
      }).toThrow('quality must be between 1 and 100');

      expect(() => {
        new ImageSpecs({
          maxFileSize: 5 * 1024 * 1024,
          maxDimensions: 4000,
          quality: 101,
        });
      }).toThrow('quality must be between 1 and 100');
    });
  });

  describe('Static Factory Methods', () => {
    it('should create avatar specs', () => {
      const specs = ImageSpecs.forAvatar();

      expect(specs.maxFileSize).toBe(5 * 1024 * 1024);
      expect(specs.maxDimensions).toBe(4000);
      expect(specs.targetSize).toBe(256);
      expect(specs.quality).toBe(85);
      expect(specs.format).toBe('jpeg');
      expect(specs.isAvatarSpecs()).toBe(true);
    });

    it('should create optimization specs', () => {
      const specs = ImageSpecs.forOptimization();

      expect(specs.maxFileSize).toBe(10 * 1024 * 1024);
      expect(specs.maxDimensions).toBe(5000);
      expect(specs.targetSize).toBe(1920);
      expect(specs.quality).toBe(85);
      expect(specs.format).toBe('jpeg');
    });

    it('should create thumbnail specs', () => {
      const specs = ImageSpecs.forThumbnail();

      expect(specs.maxFileSize).toBe(2 * 1024 * 1024);
      expect(specs.maxDimensions).toBe(2000);
      expect(specs.targetSize).toBe(150);
      expect(specs.quality).toBe(80);
      expect(specs.format).toBe('jpeg');
    });
  });

  describe('Business Methods', () => {
    it('should convert file size to MB', () => {
      const specs = new ImageSpecs({
        maxFileSize: 5 * 1024 * 1024,
        maxDimensions: 4000,
      });

      expect(specs.getMaxFileSizeInMB()).toBe(5);
    });

    it('should validate file size', () => {
      const specs = new ImageSpecs({
        maxFileSize: 5 * 1024 * 1024,
        maxDimensions: 4000,
      });

      expect(specs.isValidFileSize(4 * 1024 * 1024)).toBe(true);
      expect(specs.isValidFileSize(5 * 1024 * 1024)).toBe(true);
      expect(specs.isValidFileSize(6 * 1024 * 1024)).toBe(false);
    });

    it('should validate dimensions', () => {
      const specs = new ImageSpecs({
        maxFileSize: 5 * 1024 * 1024,
        maxDimensions: 4000,
      });

      expect(specs.isValidDimensions(3000, 3000)).toBe(true);
      expect(specs.isValidDimensions(4000, 4000)).toBe(true);
      expect(specs.isValidDimensions(5000, 3000)).toBe(false);
    });

    it('should check if avatar specs', () => {
      const avatarSpecs = ImageSpecs.forAvatar();
      expect(avatarSpecs.isAvatarSpecs()).toBe(true);

      const customSpecs = new ImageSpecs({
        maxFileSize: 10 * 1024 * 1024,
        maxDimensions: 5000,
      });
      expect(customSpecs.isAvatarSpecs()).toBe(false);
    });
  });
});
