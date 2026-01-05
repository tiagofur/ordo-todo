import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../../cache/redis.service';
import { CACHE_RESULT_METADATA, CacheTTL } from './cache-result.decorator';

/**
 * CacheInterceptor - Intercepts method calls to cache results
 *
 * This interceptor:
 * 1. Checks if the method has @CacheResult decorator
 * 2. Generates a cache key based on method signature and arguments
 * 3. Returns cached value if available (cache hit)
 * 4. Executes method and caches result if not cached (cache miss)
 * 5. Handles cache invalidation with @CacheInvalidate decorator
 *
 * @example
 * ```typescript
 * // Apply to controller methods
 * @UseInterceptors(CacheInterceptor)
 * @Get()
 * @CacheResult('workspaces', CacheTTL.MEDIUM)
 * async findAll() { ... }
 * ```
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if method has cache metadata
    const cacheMetadata = this.reflector.getAllAndOverride<{
      keyPrefix: string;
      ttl: number;
      keyPrefixGenerator?: (...args: any[]) => string;
      cacheEmpty?: boolean;
      argsToInclude?: number[];
      invalidateOnMutation?: boolean;
    }>(CACHE_RESULT_METADATA, [context.getHandler(), context.getClass()]);

    if (!cacheMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    // Generate cache key
    const cacheKey = this.generateCacheKey(
      context,
      cacheMetadata.keyPrefix,
      cacheMetadata.keyPrefixGenerator,
      userId,
    );

    this.logger.debug(`Cache check for key: ${cacheKey}`);

    // Try to get from cache
    return this.handleCache(cacheKey, cacheMetadata, next.handle());
  }

  /**
   * Handle cache logic
   * @param cacheKey - Cache key to use
   * @param metadata - Cache metadata
   * @param observable - Method execution observable
   * @returns Observable with cached or fresh data
   */
  private handleCache<T>(
    cacheKey: string,
    metadata: any,
    observable: Observable<T>,
  ): Observable<T> {
    return new Observable((observer) => {
      // Try to get from cache
      this.redisService
        .get<T>(cacheKey)
        .then((cached) => {
          if (cached !== undefined) {
            this.logger.debug(`✅ Cache hit: ${cacheKey}`);
            observer.next(cached);
            observer.complete();
            return;
          }

          // Cache miss - execute method
          this.logger.debug(`❌ Cache miss: ${cacheKey}`);
          observable
            .pipe(
              tap((result) => {
                // Cache the result (including empty results if configured)
                if (result !== undefined || metadata.cacheEmpty !== false) {
                  this.redisService
                    .set(cacheKey, result, metadata.ttl)
                    .then(() => {
                      this.logger.debug(
                        `💾 Cached result: ${cacheKey} (TTL: ${metadata.ttl}s)`,
                      );
                    })
                    .catch((error) => {
                      this.logger.error(
                        `Failed to cache result for key ${cacheKey}:`,
                        error,
                      );
                    });
                }
              }),
              catchError((error) => {
                this.logger.error(
                  `Error in cached method execution for key ${cacheKey}:`,
                  error,
                );
                return throwError(() => error);
              }),
            )
            .subscribe(observer);
        })
        .catch((error) => {
          this.logger.error(`Redis error for key ${cacheKey}:`, error);
          // On Redis error, execute method without caching
          observable.subscribe(observer);
        });
    });
  }

  /**
   * Generate cache key based on context and arguments
   * @param context - Execution context
   * @param keyPrefix - Cache key prefix
   * @param customKeyGenerator - Optional custom key generator
   * @param userId - Current user ID
   * @returns Generated cache key
   */
  private generateCacheKey(
    context: ExecutionContext,
    keyPrefix: string,
    customKeyGenerator?: (...args: any[]) => string,
    userId?: string,
  ): string {
    // Use custom generator if provided
    if (customKeyGenerator) {
      const args = this.getArgs(context);
      return customKeyGenerator(...args);
    }

    // Default key generation
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const args = this.getArgs(context);

    // Build key from class, method, and arguments
    const argsKey = args
      .map((arg) => {
        if (arg === null || arg === undefined) return '';
        if (typeof arg === 'object') return JSON.stringify(arg);
        return String(arg);
      })
      .join(':');

    return `${keyPrefix}:${className}:${methodName}:${userId || 'anon'}:${argsKey}`;
  }

  /**
   * Get method arguments from context
   * @param context - Execution context
   * @returns Method arguments
   */
  private getArgs(context: ExecutionContext): any[] {
    const request = context.switchToHttp().getRequest();
    const args: any[] = [];

    // Add user ID if available
    if (request.user?.id) {
      args.push(request.user.id);
    }

    // Add route parameters
    if (request.params && Object.keys(request.params).length > 0) {
      args.push(request.params);
    }

    // Add query parameters
    if (request.query && Object.keys(request.query).length > 0) {
      args.push(request.query);
    }

    // Add body for POST/PATCH (only for read operations)
    if (
      request.body &&
      Object.keys(request.body).length > 0 &&
      ['GET', 'HEAD'].includes(request.method)
    ) {
      args.push(request.body);
    }

    return args;
  }
}

/**
 * CacheInvalidateInterceptor - Invalidates cache after mutations
 *
 * This interceptor:
 * 1. Checks if the method has @CacheInvalidate decorator
 * 2. Executes the method
 * 3. Invalidates matching cache keys after successful execution
 *
 * @example
 * ```typescript
 * // Apply to controller methods
 * @UseInterceptors(CacheInvalidateInterceptor)
 * @Post()
 * @CacheInvalidate('workspaces')
 * async create() { ... }
 * ```
 */
@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidateInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if method has cache invalidation metadata
    const invalidateMetadata = this.reflector.getAllAndOverride<{
      keyPrefix: string;
      pattern?: (...args: any[]) => string;
      invalidateAll?: boolean;
      keysToInvalidate?: number[];
    }>('CACHE_INVALIDATE', [context.getHandler(), context.getClass()]);

    if (!invalidateMetadata) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        // Only invalidate if operation was successful
        if (result) {
          await this.invalidateCache(context, invalidateMetadata);
        }
      }),
    );
  }

  /**
   * Invalidate cache based on metadata
   * @param context - Execution context
   * @param metadata - Invalidation metadata
   */
  private async invalidateCache(
    context: ExecutionContext,
    metadata: any,
  ): Promise<void> {
    try {
      const request = context.switchToHttp().getRequest();

      // Generate invalidation pattern
      let pattern: string;

      if (metadata.pattern) {
        const args = this.getArgs(context);
        pattern = metadata.pattern(...args);
      } else if (metadata.invalidateAll) {
        pattern = `${metadata.keyPrefix}:*`;
      } else {
        // Default: invalidate keys for current user
        const userId = request.user?.id || 'anon';
        pattern = `${metadata.keyPrefix}:*:${userId}:*`;
      }

      this.logger.debug(`Invalidating cache pattern: ${pattern}`);

      await this.redisService.delPattern(pattern);

      this.logger.debug(`✅ Cache invalidated: ${pattern}`);
    } catch (error) {
      this.logger.error('Failed to invalidate cache:', error);
    }
  }

  /**
   * Get method arguments from context
   * @param context - Execution context
   * @returns Method arguments
   */
  private getArgs(context: ExecutionContext): any[] {
    const request = context.switchToHttp().getRequest();
    const args: any[] = [];

    if (request.user?.id) {
      args.push(request.user.id);
    }

    if (request.params && Object.keys(request.params).length > 0) {
      args.push(request.params);
    }

    if (request.body && Object.keys(request.body).length > 0) {
      args.push(request.body);
    }

    return args;
  }
}
