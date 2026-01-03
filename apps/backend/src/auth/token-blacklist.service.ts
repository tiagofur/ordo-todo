import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Token Blacklist Service
 *
 * Manages revoked JWT tokens to prevent reuse after logout.
 * Uses in-memory Set for token tracking (can be migrated to Redis for production).
 *
 * @note For production with multiple instances, migrate to Redis
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklist = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Add a token to the blacklist
   *
   * @param token - JWT access token to blacklist
   * @returns Promise that resolves when token is added
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
          this.blacklist.add(jti);
          this.logger.debug(`Token ${jti} blacklisted until ${expiresAt.toISOString()}`);

          // Schedule automatic cleanup after expiration
          const ttl = expiresAt.getTime() - now.getTime();
          setTimeout(() => {
            this.blacklist.delete(jti);
            this.logger.debug(`Token ${jti} removed from blacklist (expired)`);
          }, ttl);
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
      const isBlacklisted = this.blacklist.has(jti);

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
   * Note: This is usually not needed as tokens auto-expire via setTimeout
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanup(): Promise<void> {
    const beforeSize = this.blacklist.size;
    this.blacklist.clear();
    this.logger.debug(`Blacklist cleared (${beforeSize} tokens removed)`);
  }

  /**
   * Get the current size of the blacklist
   *
   * @returns Number of tokens currently blacklisted
   */
  getBlacklistSize(): number {
    return this.blacklist.size;
  }
}
