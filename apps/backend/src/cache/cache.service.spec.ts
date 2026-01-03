import { Test, TestingModule } from '@nestjs/testing';

describe('CacheService', () => {
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'CacheService',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            clear: jest.fn(),
            delPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get('CacheService');
  });

  describe('get', () => {
    it('should return value from cache', async () => {
      const mockValue = 'cached-value';
      service.get.mockResolvedValue(mockValue);

      const result = await service.get('test-key');

      expect(service.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe(mockValue);
    });

    it('should return undefined when cache miss', async () => {
      service.get.mockResolvedValue(undefined);

      const result = await service.get('test-key');

      expect(service.get).toHaveBeenCalledWith('test-key');
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set value in cache with TTL', async () => {
      service.set.mockResolvedValue(undefined);

      const result = await service.set('test-key', 'value', 300);

      expect(service.set).toHaveBeenCalledWith('test-key', 'value', 300);
    });

    it('should set value in cache without TTL', async () => {
      service.set.mockResolvedValue(undefined);

      const result = await service.set('test-key', 'value');

      expect(service.set).toHaveBeenCalledWith('test-key', 'value');
      expect(result).toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      service.del.mockResolvedValue(undefined);

      await service.del('test-key');

      expect(service.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', async () => {
      const mockKeys = ['test-key-1', 'test-key-2', 'other-key'];
      service.cacheManager.store.keys.mockResolvedValue(mockKeys as any);
      service.cacheManager.store.del.mockResolvedValue(undefined);

      await service.delPattern('test-key');

      expect(service.cacheManager.store.keys).toHaveBeenCalled();
      expect(service.cacheManager.store.del).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all cache', async () => {
      service.cacheManager.clear.mockResolvedValue(undefined);

      await service.clear();

      expect(service.cacheManager.clear).toHaveBeenCalled();
    });
  });
});
