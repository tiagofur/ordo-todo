import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * Symmetric encryption for webhook signing secrets.
 *
 * Webhook secrets must be recoverable (each delivery is HMAC-signed),
 * so one-way hashing is not an option. Secrets are encrypted with
 * AES-256-GCM under WEBHOOK_SECRET_KEY before storage. The derived
 * SHA-256 fingerprint allows prefix lookups without decrypting.
 */
@Injectable()
export class WebhookCryptoService {
  private readonly logger = new Logger(WebhookCryptoService.name);

  constructor(private readonly configService: ConfigService) {}

  encryptSecret(rawSecret: string): {
    ciphertext: string;
    fingerprint: string;
  } {
    const key = this.key();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(rawSecret, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
      ciphertext: Buffer.concat([iv, tag, encrypted]).toString('base64'),
      fingerprint: this.fingerprint(rawSecret),
    };
  }

  decryptSecret(ciphertext: string): string {
    const key = this.key();
    const raw = Buffer.from(ciphertext, 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  fingerprint(rawSecret: string): string {
    return createHash('sha256').update(rawSecret).digest('hex');
  }

  private key(): Buffer {
    const configured =
      this.configService.get<string>('WEBHOOK_SECRET_KEY') ?? '';
    if (configured.length < 32) {
      this.logger.warn(
        'WEBHOOK_SECRET_KEY is missing or too short; webhook secrets cannot be protected',
      );
      throw new Error('WEBHOOK_SECRET_KEY must be at least 32 characters');
    }
    return createHash('sha256').update(configured).digest();
  }
}
