import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../cache/redis.service';

/**
 * Token Blacklist Service
 *
 * Manages revoked JWT tokens to prevent reuse after logout.
 * Uses Redis for production-scale token management across multiple instances.
 *
 * Features:
 * - Redis-backed storage for distributed systems
 * - Automatic expiration based on JWT token expiry
 * - Production-ready with connection pooling and health checks
 *
 * @example
 * ```typescript
 * // Blacklist a token on logout
 * await tokenBlacklistService.blacklist(accessToken);
 *
 * // Check if token is blacklisted during authentication
 * const isRevoked = await tokenBlacklistService.isBlacklisted(accessToken);
 * ```
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly TOKEN_PREFIX = 'blacklist:token:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Add a token to the blacklist
   *
   * Stores the token in Redis with automatic expiration based on JWT expiry time.
   * This ensures blacklisted tokens are revoked across all server instances.
   *
   * @param token - JWT access token to blacklist
   * @returns Promise that resolves when token is added to Redis
   */
  async blacklist(token: string): Promise<void> {
    try {
      // Decode token to get expiration time
      const decoded = this.jwtService.decode(token);

      if (!decoded || typeof decoded === 'string') {
        this.logger.warn('Invalid token format provided for blacklisting');
        return;
      }

      const jti = decoded.jti || token; // Use JWT ID if available, otherwise use full token
      const exp = decoded.exp; // Expiration timestamp (seconds since epoch)

      if (exp) {
        const expiresAt = new Date(exp * 1000);
        const now = new Date();

        // Only store if token hasn't already expired
        if (expiresAt > now) {
          // Calculate TTL in seconds
          const ttl = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

          // Store in Redis with automatic expiration
          const redisKey = `${this.TOKEN_PREFIX}${jti}`;
          await this.redisService.set(redisKey, true, ttl);

          this.logger.debug(
            `Token ${jti} blacklisted until ${expiresAt.toISOString()} (TTL: ${ttl}s)`,
          );
        } else {
          this.logger.debug('Token already expired, not adding to blacklist');
        }
      }
    } catch (error) {
      this.logger.error('Failed to blacklist token', error);
    }
  }

  /**
   * Check if a token is blacklisted
   *
   * Queries Redis to determine if the token has been revoked.
   * Works across multiple server instances due to Redis distributed storage.
   *
   * @param token - JWT access token to check
   * @returns Promise that resolves to true if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.decode(token);

      if (!decoded || typeof decoded === 'string') {
        return false;
      }

      const jti = decoded.jti || token;
      const redisKey = `${this.TOKEN_PREFIX}${jti}`;

      // Check if token exists in Redis blacklist
      const isBlacklisted = await this.redisService.exists(redisKey);

      if (isBlacklisted) {
        this.logger.debug(`Token ${jti} is blacklisted`);
      }

      return isBlacklisted;
    } catch (error) {
      this.logger.error('Failed to check token blacklist status', error);
      return false;
    }
  }

  /**
   * Remove expired tokens from blacklist (manual cleanup)
   * Note: Redis automatically handles expiration, but this can be used for manual cleanup
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanup(): Promise<void> {
    try {
      // Delete all keys with the blacklist prefix
      await this.redisService.delPattern(`${this.TOKEN_PREFIX}*`);
      this.logger.debug('Blacklist cleared');
    } catch (error) {
      this.logger.error('Failed to cleanup token blacklist', error);
    }
  }

  /**
   * Get approximate size of the blacklist
   * Note: This is an estimate as Redis keys auto-expire
   *
   * @returns Promise with number of tokens currently blacklisted
   */
  async getBlacklistSize(): Promise<number> {
    try {
      // In production, you might want to use Redis SCAN to count keys
      // For now, we'll return -1 to indicate "unknown" in Redis mode
      // or you could implement a counter
      this.logger.debug(
        'Blacklist size tracking not implemented in Redis mode',
      );
      return -1;
    } catch (error) {
      this.logger.error('Failed to get blacklist size', error);
      return 0;
    }
  }

  /**
   * Get health status of token blacklist service
   *
   * @returns Object with Redis connection status
   */
  async getHealthStatus(): Promise<{ redis: boolean; message: string }> {
    try {
      const healthCheck = await this.redisService.healthCheck();
      return {
        redis: healthCheck.status === 'connected',
        message:
          healthCheck.status === 'connected'
            ? `Redis connected (latency: ${healthCheck.latency}ms)`
            : 'Redis disconnected',
      };
    } catch (error) {
      return {
        redis: false,
        message: 'Failed to check Redis health',
      };
    }
  }
}
