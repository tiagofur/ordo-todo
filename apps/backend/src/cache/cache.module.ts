import { Module, Global } from '@nestjs/common';
import {
  CacheModule as NestCacheModule,
  CacheInterceptor,
} from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './cache.service';
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
  providers: [
    CacheService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [CacheService, RedisModule],
})
export class CacheModule {}
