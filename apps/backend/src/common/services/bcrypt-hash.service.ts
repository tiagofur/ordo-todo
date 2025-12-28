import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { HashService } from '@ordo-todo/core';

/**
 * Bcrypt implementation of HashService for the backend.
 * Used for hashing invitation tokens and other secure data.
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
