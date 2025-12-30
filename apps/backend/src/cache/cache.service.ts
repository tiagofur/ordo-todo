import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache) { }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set<T>(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const cacheStore = this.cacheManager as any;
    if (cacheStore.store && cacheStore.store.keys) {
      const keys = await cacheStore.store.keys();
      const keysToDelete = keys.filter((key: string) => key.includes(pattern));
      await Promise.all(
        keysToDelete.map((key: string) => this.cacheManager.del(key)),
      );
    }
  }

  async clear(): Promise<void> {
    const cacheStore = this.cacheManager as any;
    if (cacheStore.clear) {
      await cacheStore.clear();
    }
  }
}
