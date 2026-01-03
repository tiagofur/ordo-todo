import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

/**
 * Redis Service for Production-Scale Caching
 *
 * Features:
 * - Connection pooling and health checks
 * - Automatic reconnection
 * - Cache invalidation across multiple instances
 * - Pub/Sub for cache coordination
 * - Performance monitoring
 *
 * @example
 * ```typescript
 * // Set a value
 * await redisService.set('tasks:user-123', tasks, 300);
 *
 * // Get a value
 * const tasks = await redisService.get('tasks:user-123');
 *
 * // Invalidate pattern
 * await redisService.delPattern('tasks:user-123');
 *
 * // Publish invalidation
 * await redisService.publish('cache:invalidate', { key: 'tasks:user-123' });
 * ```
 */
@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis.RedisClientType;
  private subscriber: Redis.RedisClientType;
  private publisher: Redis.RedisClientType;
  private isConnected = false;

  // Metrics
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  /**
   * Connect to Redis with retry logic
   */
  private async connect() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const enabled = this.configService.get<string>('REDIS_ENABLED') !== 'false';

    if (!enabled || !redisUrl) {
      this.logger.warn('Redis is disabled. Using in-memory cache instead.');
      return;
    }

    try {
      // Create Redis clients with optimized settings
      const redisOptions: Redis.RedisClientOptions = {
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          },
          keepAlive: 30000,
        },
        database: 0,
      };

      // Main client for operations
      this.client = Redis.createClient(redisOptions);

      // Dedicated client for pub/sub (prevents blocking)
      this.subscriber = Redis.createClient(redisOptions);
      this.publisher = Redis.createClient(redisOptions);

      // Connect all clients
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
      ]);

      // Set up error handlers
      this.client.on('error', (err) => {
        this.logger.error('Redis client error:', err);
        this.metrics.errors++;
      });

      this.subscriber.on('error', (err) => {
        this.logger.error('Redis subscriber error:', err);
      });

      this.publisher.on('error', (err) => {
        this.logger.error('Redis publisher error:', err);
      });

      this.isConnected = true;
      this.logger.log('✅ Redis connected successfully');

      // Ping to verify connection
      const pong = await this.client.ping();
      this.logger.log(`Redis ping response: ${pong}`);

    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get value from Redis
   * @param key - Cache key
   * @returns Value or undefined if not found
   */
  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isConnected) return undefined;

    try {
      const value = await this.client.get(key);
      if (value !== null) {
        this.metrics.hits++;
        return JSON.parse(value) as T;
      }
      this.metrics.misses++;
      return undefined;
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      this.metrics.errors++;
      return undefined;
    }
  }

  /**
   * Set value in Redis with TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 300)
   */
  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    if (!this.isConnected) return;

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      this.metrics.sets++;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
      this.metrics.errors++;
    }
  }

  /**
   * Delete a single key
   * @param key - Cache key to delete
   */
  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
      this.metrics.deletes++;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
      this.metrics.errors++;
    }
  }

  /**
   * Delete keys matching a pattern
   * WARNING: This uses SCAN which is safe for production
   * @param pattern - Pattern to match (e.g., "tasks:user-123*")
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      let cursor = 0;
      let deletedCount = 0;

      do {
        // Scan for keys matching pattern
        const result = await this.client.scan(
          cursor,
          {
            MATCH: pattern,
            COUNT: 100,
          }
        );

        cursor = result.cursor;

        if (result.keys.length > 0) {
          // Delete found keys
          await this.client.del(result.keys);
          deletedCount += result.keys.length;
        }
      } while (cursor !== 0);

      this.metrics.deletes += deletedCount;
      this.logger.log(`Deleted ${deletedCount} keys matching pattern: ${pattern}`);

    } catch (error) {
      this.logger.error(`Redis DEL_PATTERN error for pattern ${pattern}:`, error);
      this.metrics.errors++;
    }
  }

  /**
   * Publish cache invalidation message
   * Other instances will subscribe and invalidate their local caches
   * @param channel - Channel to publish to
   * @param message - Message to publish
   */
  async publish(channel: string, message: any): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.publisher.publish(channel, JSON.stringify(message));
    } catch (error) {
      this.logger.error(`Redis PUBLISH error:`, error);
    }
  }

  /**
   * Subscribe to cache invalidation messages
   * @param channel - Channel to subscribe to
   * @param callback - Callback function when message received
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.isConnected) return;

    try {
      const subscriber = this.subscriber.duplicate();

      await subscriber.connect();

      await subscriber.subscribe(channel, (message) => {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          this.logger.error('Error parsing Redis message:', error);
        }
      });

      this.logger.log(`Subscribed to Redis channel: ${channel}`);

    } catch (error) {
      this.logger.error(`Redis SUBSCRIBE error:`, error);
    }
  }

  /**
   * Increment a counter (useful for rate limiting)
   * @param key - Counter key
   * @param ttl - Time to live in seconds
   * @returns New counter value
   */
  async increment(key: string, ttl?: number): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const value = await this.client.incr(key);

      // Set expiry on first increment
      if (ttl && value === 1) {
        await this.client.expire(key, ttl);
      }

      return value;
    } catch (error) {
      this.logger.error(`Redis INCR error for key ${key}:`, error);
      this.metrics.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param key - Cache key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  /**
   * Get all cache metrics
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: `${hitRate.toFixed(2)}%`,
      total,
      isConnected: this.isConnected,
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Flush all data in Redis (use with caution!)
   */
  async flush(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.flushDb();
      this.logger.warn('⚠️  Redis database flushed');
    } catch (error) {
      this.logger.error('Redis FLUSHDB error:', error);
    }
  }

  /**
   * Close Redis connections gracefully
   */
  async onModuleDestroy() {
    this.logger.log('Closing Redis connections...');

    await Promise.all([
      this.client?.quit(),
      this.subscriber?.quit(),
      this.publisher?.quit(),
    ]);

    this.isConnected = false;
  }

  /**
   * Check Redis connection health
   */
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    if (!this.isConnected) {
      return { status: 'disconnected' };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      return {
        status: 'connected',
        latency,
      };
    } catch (error) {
      return { status: 'error' };
    }
  }
}
