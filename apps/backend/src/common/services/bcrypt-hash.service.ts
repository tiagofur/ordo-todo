import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { HashService } from '@ordo-todo/core';

/**
 * Bcryptjs implementation of HashService for the backend.
 * Used for hashing invitation tokens and other secure data.
 * Uses pure JavaScript bcrypt implementation for cross-platform compatibility.
 */
@Injectable()
export class BcryptHashService implements HashService {
  private readonly SALT_ROUNDS = 10;

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.SALT_ROUNDS);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
