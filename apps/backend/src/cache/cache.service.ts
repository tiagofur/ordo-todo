import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager';

/**
 * Enhanced Cache Service with Intelligent Invalidation
 *
 * Features:
 * - Pattern-based cache invalidation
 * - Automatic cache warming
 * - Cache hit/miss metrics
 * - Namespaced keys for organized invalidation
 *
 * @example
 * ```typescript
 * // Set a value
 * await cacheService.set('tasks:user-123', tasks, 300);
 *
 * // Get a value
 * const tasks = await cacheService.get('tasks:user-123');
 *
 * // Invalidate all tasks for a user
 * await cacheService.invalidateUserTasks('user-123');
 *
 * // Invalidate all workspace-related caches
 * await cacheService.invalidateWorkspace('ws-123');
 * ```
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheManager.get<T>(key);
    if (value !== undefined) {
      this.metrics.hits++;
      return value;
    }
    this.metrics.misses++;
    return undefined;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set<T>(key, value, ttl);
    this.metrics.sets++;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.metrics.deletes++;
  }

  /**
   * Delete all cache keys matching a pattern
   * @param pattern - Pattern to match (e.g., "tasks:user-123")
   */
  async delPattern(pattern: string): Promise<void> {
    const cacheStore = this.cacheManager as any;
    if (cacheStore.store && cacheStore.store.keys) {
      const keys = await cacheStore.store.keys();
      const keysToDelete = keys.filter((key: string) => key.includes(pattern));
      await Promise.all(
        keysToDelete.map((key: string) => this.cacheManager.del(key)),
      );
      this.metrics.deletes += keysToDelete.length;
    }
  }

  /**
   * Invalidate all caches related to a specific task
   * @param taskId - Task ID to invalidate
   */
  async invalidateTask(taskId: string): Promise<void> {
    const patterns = [
      `task:${taskId}`,
      `tasks:*:${taskId}`, // Tasks in any list containing this task
      `user:*:tasks`, // Invalidate all user task lists
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern.replace('*', ''));
    }
  }

  /**
   * Invalidate all task caches for a user
   * @param userId - User ID to invalidate
   */
  async invalidateUserTasks(userId: string): Promise<void> {
    await this.delPattern(`tasks:${userId}`);
    await this.delPattern(`task:*:${userId}`);
  }

  /**
   * Invalidate all caches related to a workspace
   * @param workspaceId - Workspace ID to invalidate
   */
  async invalidateWorkspace(workspaceId: string): Promise<void> {
    const patterns = [
      `workspace:${workspaceId}`,
      `workspaces:${workspaceId}`,
      `workspaces:*:${workspaceId}`, // Workspaces for any user
      `projects:*:${workspaceId}`, // Projects in this workspace
      `tasks:*:${workspaceId}`, // Tasks in this workspace
      `members:${workspaceId}`, // Workspace members
      `settings:${workspaceId}`, // Workspace settings
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern.replace('*', ''));
    }

    this.logger.log(`Invalidated all caches for workspace: ${workspaceId}`);
  }

  /**
   * Invalidate all caches related to a project
   * @param projectId - Project ID to invalidate
   */
  async invalidateProject(projectId: string): Promise<void> {
    const patterns = [
      `project:${projectId}`,
      `projects:*:${projectId}`, // Projects for any user
      `tasks:*:${projectId}`, // Tasks in this project
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern.replace('*', ''));
    }
  }

  /**
   * Invalidate all caches related to a user
   * @param userId - User ID to invalidate
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}`);
    await this.delPattern(`tasks:${userId}`);
    await this.delPattern(`workspaces:${userId}`);
  }

  /**
   * Invalidate daily metrics cache for a user
   * @param userId - User ID
   * @param date - Optional specific date to invalidate
   */
  async invalidateDailyMetrics(userId: string, date?: Date): Promise<void> {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      await this.del(`daily-metrics:${userId}:${dateStr}`);
    } else {
      await this.delPattern(`daily-metrics:${userId}`);
    }
  }

  /**
   * Invalidate timer-related caches
   * @param userId - User ID
   */
  async invalidateTimers(userId: string): Promise<void> {
    await this.delPattern(`timers:${userId}`);
    await this.delPattern(`timer:${userId}`);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const cacheStore = this.cacheManager as any;
    if (cacheStore.clear) {
      await cacheStore.clear();
      this.logger.warn('Cache cleared completely');
    }
  }

  /**
   * Get cache metrics for monitoring
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: `${hitRate.toFixed(2)}%`,
      total,
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Warm cache with frequently accessed data
   * @param data - Map of key-value pairs to cache
   * @param defaultTTL - Default TTL in seconds
   */
  async warmCache<T extends Record<string, any>>(
    data: T,
    defaultTTL: number = 300,
  ): Promise<void> {
    const promises = Object.entries(data).map(([key, value]) =>
      this.set(key, value, defaultTTL),
    );

    await Promise.all(promises);
    this.logger.log(`Warmed cache with ${Object.keys(data).length} entries`);
  }
}
