import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { CryptoProvider } from '@ordo-todo/core';

/**
 * Bcrypt Crypto Provider
 *
 * Implements password hashing using bcryptjs (pure JavaScript implementation).
 *
 * SECURITY: Uses 12 salt rounds (increased from 10) for better security.
 * - 10 rounds: ~100ms per hash (fast but less secure)
 * - 12 rounds: ~400ms per hash (recommended for 2025)
 * - 14 rounds: ~1.6s per hash (very secure but slow)
 *
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html | OWASP Password Storage}
 */
@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  // SECURITY: Increased from 10 to 12 rounds (2025 recommendation)
  private readonly saltRounds = 12;

  async encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
