import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_MODULE_CONNECTION } from './redis.constants';
import type { RedisModuleOptions } from './redis.interfaces';

/**
 * RedisService - Centralized Redis operations for caching and data management
 *
 * Provides a high-level interface for Redis operations with built-in
 * error handling, logging, and type safety.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_MODULE_CONNECTION) private readonly redis: Redis,
    @Inject('REDIS_MODULE_OPTIONS')
    private readonly options: RedisModuleOptions,
  ) {
    this.logger.log('Redis service initialized');
  }

  /**
   * Lifecycle hook - cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }

  // ============ CACHE OPERATIONS ============

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON serialized)
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
        this.logger.debug(`Cached key ${key} with TTL ${ttlSeconds}s`);
      } else {
        await this.redis.set(key, serialized);
        this.logger.debug(`Cached key ${key} (no expiration)`);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   * @param key - Cache key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Deleted key ${key} from cache`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param pattern - Glob pattern (e.g., "user:*", "workspace:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        this.logger.debug(`No keys found for pattern ${pattern}`);
        return;
      }

      await this.redis.del(...keys);
      this.logger.debug(`Deleted ${keys.length} keys matching ${pattern}`);
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set TTL for existing key
   * @param key - Cache key
   * @param ttlSeconds - Time to live in seconds
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(key, ttlSeconds);
      this.logger.debug(`Set TTL ${ttlSeconds}s for key ${key}`);
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}:`, error);
    }
  }

  /**
   * Get TTL of key
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -2;
    }
  }

  // ============ LIST OPERATIONS ============

  /**
   * Push value to list (left push)
   * @param key - List key
   * @param value - Value to push
   * @returns New list length
   */
  async lpush<T>(key: string, value: T): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.redis.lpush(key, serialized);
    } catch (error) {
      this.logger.error(`Error lpush to key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Pop value from list (left pop)
   * @param key - List key
   * @returns Popped value or null
   */
  async lpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.lpop(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error lpop from key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get list range
   * @param key - List key
   * @param start - Start index (0-based)
   * @param stop - Stop index (-1 for last element)
   * @returns Array of values
   */
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map((v) => JSON.parse(v) as T);
    } catch (error) {
      this.logger.error(`Error lrange from key ${key}:`, error);
      return [];
    }
  }

  // ============ SET OPERATIONS ============

  /**
   * Add member to set
   * @param key - Set key
   * @param member - Member to add
   * @returns 1 if added, 0 if already exists
   */
  async sadd<T>(key: string, member: T): Promise<number> {
    try {
      const serialized = JSON.stringify(member);
      return await this.redis.sadd(key, serialized);
    } catch (error) {
      this.logger.error(`Error sadd to key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Remove member from set
   * @param key - Set key
   * @param member - Member to remove
   * @returns 1 if removed, 0 if not exists
   */
  async srem<T>(key: string, member: T): Promise<number> {
    try {
      const serialized = JSON.stringify(member);
      return await this.redis.srem(key, serialized);
    } catch (error) {
      this.logger.error(`Error srem from key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get all members of set
   * @param key - Set key
   * @returns Array of members
   */
  async smembers<T>(key: string): Promise<T[]> {
    try {
      const members = await this.redis.smembers(key);
      return members.map((m) => JSON.parse(m) as T);
    } catch (error) {
      this.logger.error(`Error smembers from key ${key}:`, error);
      return [];
    }
  }

  /**
   * Check if member exists in set
   * @param key - Set key
   * @param member - Member to check
   * @returns true if member exists
   */
  async sismember<T>(key: string, member: T): Promise<boolean> {
    try {
      const serialized = JSON.stringify(member);
      const result = await this.redis.sismember(key, serialized);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error sismember for key ${key}:`, error);
      return false;
    }
  }

  // ============ HASH OPERATIONS ============

  /**
   * Set field in hash
   * @param key - Hash key
   * @param field - Field name
   * @param value - Field value
   */
  async hset<T>(key: string, field: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.hset(key, field, serialized);
      this.logger.debug(`Set hash field ${key}.${field}`);
    } catch (error) {
      this.logger.error(`Error hset for key ${key}:`, error);
    }
  }

  /**
   * Get field from hash
   * @param key - Hash key
   * @param field - Field name
   * @returns Field value or null
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error hget for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all fields from hash
   * @param key - Hash key
   * @returns Object with all field-value pairs
   */
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key);
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value) as T;
      }

      return result;
    } catch (error) {
      this.logger.error(`Error hgetall for key ${key}:`, error);
      return {};
    }
  }

  /**
   * Delete field from hash
   * @param key - Hash key
   * @param field - Field name
   * @returns Number of deleted fields
   */
  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.redis.hdel(key, field);
    } catch (error) {
      this.logger.error(`Error hdel for key ${key}:`, error);
      return 0;
    }
  }

  // ============ UTILITY OPERATIONS ============

  /**
   * Clear all keys in current database
   * WARNING: This will delete ALL cached data
   */
  async flushDb(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.warn('Flushed entire database');
    } catch (error) {
      this.logger.error('Error flushing database:', error);
    }
  }

  /**
   * Get database size (number of keys)
   * @returns Number of keys in current database
   */
  async dbSize(): Promise<number> {
    try {
      return await this.redis.dbsize();
    } catch (error) {
      this.logger.error('Error getting database size:', error);
      return 0;
    }
  }

  /**
   * Get Redis info
   * @param section - Info section (optional)
   * @returns Redis info as string
   */
  async info(section?: string): Promise<string> {
    try {
      return await this.redis.info(section || 'default');
    } catch (error) {
      this.logger.error('Error getting Redis info:', error);
      return '';
    }
  }

  /**
   * Ping Redis server
   * @returns PONG if server is responsive
   */
  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('Error pinging Redis:', error);
      throw error;
    }
  }

  /**
   * Get Redis client instance for advanced operations
   * @returns Raw Redis client
   */
  getClient(): Redis {
    return this.redis;
  }
}
