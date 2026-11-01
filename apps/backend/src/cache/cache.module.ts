import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './redis.module';

/**
 * Cache Module - Unified Caching Solution
 *
 * Provides both in-memory caching (via NestJS CacheManager) and
 * Redis-backed distributed caching for production deployments.
 *
 * Features:
 * - In-memory cache for development
 * - Redis for production (automatic failover)
 * - Global availability across all modules
 * - Cache interceptor for automatic response caching
 */
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 300,
      max: 1000,
      isGlobal: true,
    }),
    RedisModule, // Redis for distributed caching and token blacklist
  ],
  // NOTE (ODD 027 T8): the in-memory CacheService was dead code (zero
  // injectors) with broken substring invalidation; RedisService in
  // ./redis.service.ts is the single cache implementation.
  providers: [],
  exports: [RedisModule],
})
export class CacheModule {}
