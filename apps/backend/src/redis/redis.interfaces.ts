import { ModuleMetadata } from '@nestjs/common';
import type { Redis } from 'ioredis';

/**
 * Redis module configuration options
 */
export interface RedisModuleOptions {
  /**
   * Redis connection host
   * @default 'localhost'
   */
  host?: string;

  /**
   * Redis connection port
   * @default 6379
   */
  port?: number;

  /**
   * Redis password (if authentication is enabled)
   */
  password?: string;

  /**
   * Redis database number (0-15)
   * @default 0
   */
  db?: number;

  /**
   * Connection URL (alternative to host/port)
   * Format: redis://[[username][:password]@][host][:port][/db-number]
   */
  url?: string;

  /**
   * Key prefix for all cached values
   * @default ''
   */
  keyPrefix?: string;

  /**
   * Default TTL in seconds for cache entries
   * @default 3600 (1 hour)
   */
  defaultTTL?: number;

  /**
   * Maximum number of retries on connection failure
   * @default 3
   */
  maxRetriesPerRequest?: number;

  /**
   * Enable offline queue
   * @default true
   */
  enableOfflineQueue?: boolean;

  /**
   * Enable ready check
   * @default true
   */
  enableReadyCheck?: boolean;

  /**
   * Custom Redis client options
   */
  clientOptions?: Partial<{
    connectTimeout: number;
    commandTimeout: number;
    retryStrategy(times: number): number | void;
    reconnectOnError(error: Error): boolean | 1 | 2;
  }>;

  /**
   * Custom ioredis client instance
   * If provided, other connection options will be ignored
   */
  client?: Redis;

  /**
   * Is this module for testing?
   * If true, uses a mock Redis client
   * @default false
   */
  isGlobal?: boolean;
}

/**
 * Redis module async options
 */
export interface RedisModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  /**
   * Whether the module is global
   * @default false
   */
  isGlobal?: boolean;

  /**
   * Use existing factory
   */
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;

  /**
   * Dependencies for the factory
   */
  inject?: any[];
}
