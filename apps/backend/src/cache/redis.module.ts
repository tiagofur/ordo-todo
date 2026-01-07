import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * Redis Module - Production-Scale Caching
 *
 * This module provides Redis-backed caching for production deployments.
 *
 * Environment Variables:
 * - REDIS_URL: Redis connection string (default: redis://localhost:6379)
 * - REDIS_ENABLED: Enable/disable Redis (default: true)
 * - NODE_ENV: Environment (development/production)
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [RedisModule],
 *   providers: [MyService],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  /**
   * Dynamic module for custom configuration
   */
  static register(options: { enabled?: boolean; url?: string }) {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useValue: options,
        },
      ],
    };
  }
}
