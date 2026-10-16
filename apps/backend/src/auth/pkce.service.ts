import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * PKCE Service
 *
 * Manages PKCE (Proof Key for Code Exchange) for OAuth flows.
 * Implements RFC 7636 for enhanced OAuth security in public clients.
 *
 * @see {@link https://tools.ietf.org/html/rfc7636 | RFC 7636 - PKCE}
 */
@Injectable()
export class PkceService {
  private readonly logger = new Logger(PkceService.name);

  // In-memory store for PKCE challenges (TODO: Use Redis in production)
  private readonly challenges: Map<
    string,
    {
      codeChallenge: string;
      codeChallengeMethod: 'S256' | 'plain';
      expiresAt: number;
    }
  > = new Map();

  private readonly TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Store a PKCE challenge for a state parameter
   *
   * Called when initiating OAuth flow with PKCE from frontend
   */
  storeChallenge(
    state: string,
    codeChallenge: string,
    codeChallengeMethod: 'S256' | 'plain' = 'S256',
  ): void {
    this.cleanup();

    this.challenges.set(state, {
      codeChallenge,
      codeChallengeMethod,
      expiresAt: Date.now() + this.TTL_MS,
    });

    this.logger.debug(
      `PKCE challenge stored for state: ${state.substring(0, 8)}...`,
    );
  }

  /**
   * Verify a code verifier against stored challenge
   *
   * Called during token exchange to verify the client possesses the original verifier
   */
  verifyChallenge(state: string, codeVerifier: string): boolean {
    this.cleanup();

    const stored = this.challenges.get(state);

    if (!stored) {
      this.logger.warn(
        `No PKCE challenge found for state: ${state.substring(0, 8)}...`,
      );
      return false;
    }

    // Remove the challenge (one-time use)
    this.challenges.delete(state);

    // Check if expired
    if (Date.now() > stored.expiresAt) {
      this.logger.warn(
        `PKCE challenge expired for state: ${state.substring(0, 8)}...`,
      );
      return false;
    }

    // Verify the code verifier
    const expectedChallenge = this.computeChallenge(
      codeVerifier,
      stored.codeChallengeMethod,
    );

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedChallenge),
      Buffer.from(stored.codeChallenge),
    );

    if (!isValid) {
      this.logger.warn(
        `PKCE verification failed for state: ${state.substring(0, 8)}...`,
      );
    }

    return isValid;
  }

  /**
   * Compute code challenge from code verifier
   */
  private computeChallenge(
    codeVerifier: string,
    method: 'S256' | 'plain',
  ): string {
    if (method === 'plain') {
      return codeVerifier;
    }

    // S256: BASE64URL(SHA256(code_verifier))
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return this.base64urlEncode(hash);
  }

  /**
   * Generate a code verifier (for backend-initiated flows)
   */
  generateCodeVerifier(): string {
    const buffer = crypto.randomBytes(32);
    return this.base64urlEncode(buffer);
  }

  /**
   * Generate a code challenge from a verifier
   */
  generateCodeChallenge(codeVerifier: string): string {
    return this.computeChallenge(codeVerifier, 'S256');
  }

  /**
   * Generate state parameter
   */
  generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Base64url encode
   */
  private base64urlEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Clean up expired challenges
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [state, data] of this.challenges.entries()) {
      if (now > data.expiresAt) {
        this.challenges.delete(state);
      }
    }
  }
}
