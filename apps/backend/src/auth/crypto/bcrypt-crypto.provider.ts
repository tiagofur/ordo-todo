import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { CryptoProvider } from '@ordo-todo/core';

@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  async encrypt(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
