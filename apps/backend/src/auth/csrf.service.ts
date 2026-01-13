import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * CSRF Protection Service
 *
 * Generates and validates CSRF tokens to prevent cross-site request forgery attacks.
 * Tokens are stored in Redis or memory for validation.
 *
 * @see {@link https://owasp.org/www-project-csrf/ | OWASP CSRF Prevention}
 */
@Injectable()
export class CsrfService {
  private readonly tokens: Map<string, { expiry: number }> = new Map();
  private readonly TOKEN_TTL = 3600000; // 1 hour in milliseconds

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a new CSRF token
   *
   * @returns CSRF token (hex string)
   */
  generateToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.TOKEN_TTL;

    this.tokens.set(token, { expiry });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Validate a CSRF token
   *
   * @param token - CSRF token to validate
   * @returns true if token is valid, false otherwise
   */
  validateToken(token: string): boolean {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > tokenData.expiry) {
      this.tokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Invalidate a CSRF token after use
   *
   * @param token - CSRF token to invalidate
   */
  invalidateToken(token: string): void {
    this.tokens.delete(token);
  }

  /**
   * Clean up expired tokens from memory
   *
   * Runs periodically to prevent memory leaks
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();

    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expiry) {
        this.tokens.delete(token);
      }
    }
  }
}
