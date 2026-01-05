import {
  DynamicModule,
  Module,
  Provider,
  Global,
  Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from './redis.interfaces';
import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS,
} from './redis.constants';
import { RedisService } from './redis.service';

/**
 * Redis Module - Provides Redis connection and caching services
 *
 * @example
 * ```typescript
 * // Synchronous registration
 * RedisModule.register({
 *   host: 'localhost',
 *   port: 6379,
 *   db: 0,
 *   defaultTTL: 3600,
 * });
 *
 * // Asynchronous registration
 * RedisModule.registerAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     host: config.get('REDIS_HOST'),
 *     port: config.get('REDIS_PORT'),
 *     password: config.get('REDIS_PASSWORD'),
 *   }),
 * });
 * ```
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  private static readonly logger = new Logger(RedisModule.name);

  /**
   * Register Redis module synchronously
   * @param options - Module options
   * @returns Dynamic module
   */
  static register(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        ...this.createConnectionProviders(options),
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [RedisService],
    };
  }

  /**
   * Register Redis module asynchronously
   * @param options - Async module options
   * @returns Dynamic module
   */
  static registerAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncConnectionProviders(options),
        {
          provide: REDIS_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [RedisService],
    };
  }

  /**
   * Create connection providers
   * @param options - Module options
   * @returns Array of providers
   */
  private static createConnectionProviders(
    options: RedisModuleOptions,
  ): Provider[] {
    const connectionProvider: Provider = {
      provide: REDIS_MODULE_CONNECTION,
      useValue: this.createClient(options),
    };

    const connectionTokenProvider: Provider = {
      provide: REDIS_MODULE_CONNECTION_TOKEN,
      useValue: options.client || this.createClient(options),
    };

    return [connectionProvider, connectionTokenProvider];
  }

  /**
   * Create async connection providers
   * @param options - Async module options
   * @returns Array of providers
   */
  private static createAsyncConnectionProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    const connectionProvider: Provider = {
      provide: REDIS_MODULE_CONNECTION,
      useFactory: (opts: RedisModuleOptions) => this.createClient(opts),
      inject: [REDIS_MODULE_OPTIONS],
    };

    const connectionTokenProvider: Provider = {
      provide: REDIS_MODULE_CONNECTION_TOKEN,
      useFactory: (opts: RedisModuleOptions) =>
        opts.client || this.createClient(opts),
      inject: [REDIS_MODULE_OPTIONS],
    };

    return [connectionProvider, connectionTokenProvider];
  }

  /**
   * Create Redis client instance
   * @param options - Module options
   * @returns Redis client
   */
  private static createClient(options: RedisModuleOptions): Redis {
    // If custom client provided, use it
    if (options.client) {
      this.logger.log('Using custom Redis client');
      return options.client;
    }

    // If URL provided, use it
    if (options.url) {
      this.logger.log(`Connecting to Redis at ${options.url}`);
      return new Redis(options.url, {
        maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
        enableOfflineQueue: options.enableOfflineQueue ?? true,
        enableReadyCheck: options.enableReadyCheck ?? true,
        ...options.clientOptions,
      });
    }

    // Otherwise, use host/port
    const host = options.host || 'localhost';
    const port = options.port || 6379;
    const db = options.db || 0;

    this.logger.log(`Connecting to Redis at ${host}:${port} [DB: ${db}]`);

    const client = new Redis({
      host,
      port,
      db,
      password: options.password,
      maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
      enableOfflineQueue: options.enableOfflineQueue ?? true,
      enableReadyCheck: options.enableReadyCheck ?? true,
      ...options.clientOptions,
    });

    // Event listeners
    client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    client.on('ready', () => {
      this.logger.log('Redis ready to accept commands');
    });

    client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });

    return client;
  }
}
