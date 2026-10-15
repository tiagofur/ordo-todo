import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { HashService } from '@ordo-todo/core';

/**
 * Token HashService implementation for the backend.
 * Uses SHA-256 for high-entropy tokens (UUIDs) for fast O(1) indexed lookup,
 * while maintaining backward compatibility with legacy bcrypt hashes.
 */
@Injectable()
export class BcryptHashService implements HashService {
  async hash(value: string): Promise<string> {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  async compare(value: string, hash: string): Promise<boolean> {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      return bcrypt.compare(value, hash);
    }
    const computed = crypto.createHash('sha256').update(value).digest('hex');
    if (computed.length !== hash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  }
}
