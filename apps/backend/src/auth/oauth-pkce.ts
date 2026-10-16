/**
 * PKCE (Proof Key for Code Exchange) Utilities
 *
 * Implements PKCE as defined in RFC 7636 for enhanced OAuth security.
 * PKCE prevents authorization code interception attacks in public clients.
 *
 * @see {@link https://tools.ietf.org/html/rfc7636 | RFC 7636 - PKCE}
 * @see {@link https://oauth.net/2/pkce/ | OAuth 2.0 PKCE}
 */

import * as crypto from 'crypto';

/**
 * PKCE Challenge pair
 */
export interface PKCEChallenge {
  /** Random code verifier (43-128 characters) */
  codeVerifier: string;
  /** SHA256 hash of verifier, base64url encoded */
  codeChallenge: string;
  /** Challenge method (always S256 for security) */
  codeChallengeMethod: 'S256';
}

/**
 * Generate a cryptographically secure code verifier
 *
 * The code verifier is a cryptographically random string using the
 * unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 * with a minimum length of 43 characters and a maximum length of 128 characters.
 *
 * @returns Base64url-encoded random string (43 characters)
 */
export function generateCodeVerifier(): string {
  // Generate 32 random bytes, which will result in 43 base64url characters
  const buffer = crypto.randomBytes(32);
  return base64urlEncode(buffer);
}

/**
 * Generate a code challenge from a code verifier
 *
 * The code challenge is the Base64-URL encoding of the SHA256 hash
 * of the code verifier.
 *
 * @param verifier - The code verifier string
 * @returns Base64url-encoded SHA256 hash of the verifier
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64urlEncode(hash);
}

/**
 * Generate a complete PKCE challenge pair
 *
 * @returns Object containing codeVerifier, codeChallenge, and codeChallengeMethod
 */
export function generatePKCEChallenge(): PKCEChallenge {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Verify a code verifier against a code challenge
 *
 * Used during token exchange to verify the client possesses the original verifier.
 *
 * @param codeVerifier - The original code verifier
 * @param codeChallenge - The code challenge received during authorization
 * @returns True if the verifier matches the challenge
 */
export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string,
): boolean {
  const expectedChallenge = generateCodeChallenge(codeVerifier);
  return crypto.timingSafeEqual(
    Buffer.from(expectedChallenge),
    Buffer.from(codeChallenge),
  );
}

/**
 * Generate a random state parameter for OAuth
 *
 * The state parameter is used to prevent CSRF attacks and maintain
 * state between the authorization request and callback.
 *
 * @returns Cryptographically random state string
 */
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Base64url encode a buffer
 *
 * Standard Base64 encoding modified to be URL-safe:
 * - '+' replaced with '-'
 * - '/' replaced with '_'
 * - Trailing '=' padding removed
 *
 * @param buffer - Buffer to encode
 * @returns Base64url-encoded string
 */
function base64urlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * PKCE Store
 *
 * In-memory store for PKCE challenges during the OAuth flow.
 * In production, this should use Redis or a similar distributed cache.
 */
export class PKCEStore {
  private readonly challenges: Map<
    string,
    { verifier: string; expiresAt: number }
  > = new Map();
  private readonly TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Store a PKCE challenge for the state parameter
   */
  store(state: string, codeVerifier: string): void {
    this.cleanup();
    this.challenges.set(state, {
      verifier: codeVerifier,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  /**
   * Retrieve and remove the code verifier for a state
   */
  consume(state: string): string | null {
    this.cleanup();
    const data = this.challenges.get(state);

    if (!data) {
      return null;
    }

    this.challenges.delete(state);

    if (Date.now() > data.expiresAt) {
      return null;
    }

    return data.verifier;
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

// Export singleton PKCE store instance
export const pkceStore = new PKCEStore();
