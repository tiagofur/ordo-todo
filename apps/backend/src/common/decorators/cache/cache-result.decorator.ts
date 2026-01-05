import { SetMetadata } from '@nestjs/common';

/**
 * Cache TTL values (in seconds)
 */
export enum CacheTTL {
  /** 5 minutes - for frequently changing data */
  SHORT = 300,
  /** 15 minutes - for moderately changing data */
  MEDIUM = 900,
  /** 1 hour - for relatively stable data */
  LONG = 3600,
  /** 6 hours - for stable data */
  VERY_LONG = 21600,
  /** 24 hours - for very stable data */
  DAY = 86400,
}

/**
 * Cache decorator metadata key
 */
export const CACHE_RESULT_METADATA = 'CACHE_RESULT';

/**
 * CacheResult decorator - Cache the return value of a method
 *
 * Uses Redis to cache the result of expensive operations like database queries.
 * The cache key is automatically generated based on the class name, method name,
 * and arguments.
 *
 * @example
 * ```typescript
 * @CacheResult('workspaces', CacheTTL.MEDIUM)
 * async findAll(userId: string) {
 *   return this.prisma.workspace.findMany({ where: { userId } });
 * }
 *
 * // With custom key generator
 * @CacheResult('workspaces', CacheTTL.LONG, {
 *   keyPrefix: (args) => `user:${args[0]}:workspaces`
 * })
 * async findAll(userId: string) {
 *   return this.prisma.workspace.findMany({ where: { userId } });
 * }
 * ```
 */
export const CacheResult = (
  /**
   * Cache key prefix (e.g., 'workspaces', 'projects')
   */
  keyPrefix: string,

  /**
   * Time to live in seconds
   */
  ttl: number = CacheTTL.MEDIUM,

  /**
   * Optional configuration
   */
  options?: {
    /**
     * Custom key prefix generator function
     * @param args - Method arguments
     * @returns Custom cache key prefix
     */
    keyPrefixGenerator?: (...args: any[]) => string;

    /**
     * Whether to cache undefined/null results
     * @default true
     */
    cacheEmpty?: boolean;

    /**
     * Arguments to include in cache key (by index)
     * If not provided, all arguments are included
     */
    argsToInclude?: number[];

    /**
     * Whether to invalidate cache on mutation operations
     * @default false
     */
    invalidateOnMutation?: boolean;
  },
): MethodDecorator => {
  return SetMetadata(CACHE_RESULT_METADATA, {
    keyPrefix,
    ttl,
    ...options,
  });
};

/**
 * CacheInvalidate decorator - Invalidate cache after method execution
 *
 * Used for mutation operations (create, update, delete) to invalidate
 * related cache entries.
 *
 * @example
 * ```typescript
 * @CacheInvalidate('workspaces')
 * async create(userId: string, dto: CreateWorkspaceDto) {
 *   // This will invalidate all 'workspaces:*' cache entries
 *   return this.prisma.workspace.create({ data: { ... } });
 * }
 *
 * // Invalidate specific user's workspaces
 * @CacheInvalidate('workspaces', {
 *   pattern: (args) => `user:${args[0]}:workspaces*`
 * })
 * async create(userId: string, dto: CreateWorkspaceDto) {
 *   return this.prisma.workspace.create({ data: { ... } });
 * }
 * ```
 */
export const CacheInvalidate = (
  /**
   * Cache key prefix to invalidate
   */
  keyPrefix: string,

  /**
   * Optional configuration
   */
  options?: {
    /**
     * Custom invalidation pattern generator
     * @param args - Method arguments
     * @returns Invalidaton pattern (supports wildcards)
     */
    pattern?: (...args: any[]) => string;

    /**
     * Whether to invalidate all keys matching the prefix
     * @default true
     */
    invalidateAll?: boolean;

    /**
     * Specific keys to invalidate (by index from args)
     */
    keysToInvalidate?: number[];
  },
): MethodDecorator => {
  return SetMetadata('CACHE_INVALIDATE', {
    keyPrefix,
    ...options,
  });
};
