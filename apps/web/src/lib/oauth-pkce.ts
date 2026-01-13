/**
 * PKCE (Proof Key for Code Exchange) Utilities for Browser
 * 
 * Implements PKCE as defined in RFC 7636 for enhanced OAuth security.
 * Uses Web Crypto API for browser-safe cryptographic operations.
 * 
 * @see {@link https://tools.ietf.org/html/rfc7636 | RFC 7636 - PKCE}
 * @see {@link https://oauth.net/2/pkce/ | OAuth 2.0 PKCE}
 */

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
 * Uses Web Crypto API for browser-safe random generation.
 * 
 * @returns Base64url-encoded random string (43 characters)
 */
export function generateCodeVerifier(): string {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return base64urlEncode(buffer);
}

/**
 * Generate a code challenge from a code verifier
 * 
 * The code challenge is the Base64-URL encoding of the SHA256 hash
 * of the code verifier.
 * 
 * @param verifier - The code verifier string
 * @returns Promise resolving to base64url-encoded SHA256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return base64urlEncode(new Uint8Array(hashBuffer));
}

/**
 * Generate a complete PKCE challenge pair
 * 
 * @returns Promise resolving to object containing codeVerifier, codeChallenge, and codeChallengeMethod
 */
export async function generatePKCEChallenge(): Promise<PKCEChallenge> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256',
    };
}

/**
 * Generate a random state parameter for OAuth
 * 
 * @returns Cryptographically random state string (32 hex characters)
 */
export function generateState(): string {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Base64url encode a Uint8Array
 * 
 * Standard Base64 encoding modified to be URL-safe:
 * - '+' replaced with '-'
 * - '/' replaced with '_'
 * - Trailing '=' padding removed
 * 
 * @param buffer - Uint8Array to encode
 * @returns Base64url-encoded string
 */
function base64urlEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Storage keys for PKCE data
 */
const PKCE_VERIFIER_KEY = 'ordo_pkce_verifier';
const PKCE_STATE_KEY = 'ordo_pkce_state';

/**
 * Store PKCE data in sessionStorage before OAuth redirect
 * 
 * @param state - OAuth state parameter
 * @param codeVerifier - PKCE code verifier
 */
export function storePKCEData(state: string, codeVerifier: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
        sessionStorage.setItem(PKCE_STATE_KEY, state);
    }
}

/**
 * Retrieve and clear PKCE data from sessionStorage after OAuth callback
 * 
 * @param expectedState - The state parameter received from OAuth callback
 * @returns The code verifier if state matches, null otherwise
 */
export function consumePKCEData(expectedState: string): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedState = sessionStorage.getItem(PKCE_STATE_KEY);
    const storedVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

    // Clear stored data regardless of match
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);

    // Verify state matches (CSRF protection)
    if (storedState !== expectedState) {
        console.warn('[PKCE] State mismatch - possible CSRF attack');
        return null;
    }

    return storedVerifier;
}

/**
 * Initiate OAuth flow with PKCE
 * 
 * Generates PKCE challenge, stores verifier, and returns OAuth URL with parameters.
 * 
 * @param baseOAuthUrl - The OAuth authorization endpoint
 * @param clientId - OAuth client ID
 * @param redirectUri - OAuth redirect URI
 * @param scope - OAuth scope
 * @returns Promise resolving to complete OAuth URL with PKCE parameters
 */
export async function initiateOAuthWithPKCE(
    baseOAuthUrl: string,
    clientId: string,
    redirectUri: string,
    scope: string,
): Promise<string> {
    const state = generateState();
    const { codeVerifier, codeChallenge, codeChallengeMethod } = await generatePKCEChallenge();

    // Store for later verification
    storePKCEData(state, codeVerifier);

    // Build OAuth URL with PKCE parameters
    const url = new URL(baseOAuthUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', codeChallengeMethod);

    return url.toString();
}
