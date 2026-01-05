import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockCacheStore = {
      keys: jest.fn(),
      del: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
      store: mockCacheStore,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('get', () => {
    it('should return value from cache', async () => {
      const mockValue = 'cached-value';
      cacheManager.get.mockResolvedValue(mockValue);

      const result = await service.get('test-key');

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe(mockValue);
    });

    it('should return undefined when cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('test-key');

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set value in cache with TTL', async () => {
      cacheManager.set.mockResolvedValue(undefined);

      await service.set('test-key', 'value', 300);

      expect(cacheManager.set).toHaveBeenCalledWith('test-key', 'value', 300);
    });

    it('should set value in cache without TTL', async () => {
      cacheManager.set.mockResolvedValue(undefined);

      await service.set('test-key', 'value');

      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        'value',
        undefined,
      );
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      cacheManager.del.mockResolvedValue(undefined);

      await service.del('test-key');

      expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', async () => {
      const mockKeys = ['test-key-1', 'test-key-2', 'other-key'];
      cacheManager.store.keys.mockResolvedValue(mockKeys);
      cacheManager.del.mockResolvedValue(undefined);

      await service.delPattern('test-key');

      expect(cacheManager.store.keys).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledTimes(2); // test-key-1 and test-key-2
    });

    it('should handle when store.keys is not available', async () => {
      cacheManager.store.keys = undefined;

      await expect(service.delPattern('test-key')).resolves.toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all cache', async () => {
      cacheManager.clear.mockResolvedValue(undefined);

      await service.clear();

      expect(cacheManager.clear).toHaveBeenCalled();
    });
  });
});
