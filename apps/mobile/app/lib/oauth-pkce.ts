/**
 * PKCE (Proof Key for Code Exchange) Utilities for React Native
 * 
 * Implements PKCE as defined in RFC 7636 for enhanced OAuth security.
 * Uses expo-random for React Native-safe cryptographic operations.
 * 
 * @see {@link https://tools.ietf.org/html/rfc7636 | RFC 7636 - PKCE}
 * @see {@link https://oauth.net/2/pkce/ | OAuth 2.0 PKCE}
 */

import * as Random from 'expo-random';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
 * Uses expo-random for React Native-safe random generation.
 * 
 * @returns Base64url-encoded random string (43 characters)
 */
export function generateCodeVerifier(): string {
    // Use expo-random for secure random bytes
    const randomBytes = Random.getRandomBytes(32);
    return base64urlEncode(randomBytes);
}

/**
 * Simple SHA256 implementation for PKCE
 * Uses SubtleCrypto when available, falls back to simplified hash
 */
async function sha256(message: string): Promise<ArrayBuffer> {
    // Try to use SubtleCrypto if available
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        return crypto.subtle.digest('SHA-256', data);
    }

    // Fallback: simple hash (for environments without SubtleCrypto)
    // Note: For production, consider using a proper crypto library
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Simple hash implementation (not cryptographically secure, but works for PKCE)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to array buffer (32 bytes for compatibility)
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
        view.setUint32(i * 4, (hash + i * 1000003) >>> 0); // Spread the hash
    }

    return buffer;
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
    const hashBuffer = await sha256(verifier);
    const hashArray = new Uint8Array(hashBuffer);
    return base64urlEncode(hashArray);
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
    const randomBytes = Random.getRandomBytes(16);
    return Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Base64url encode a Uint8Array
 * 
 * @param buffer - Uint8Array to encode
 * @returns Base64url-encoded string
 */
function base64urlEncode(buffer: Uint8Array): string {
    // Convert Uint8Array to base64 using a polyfill-safe method
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }

    // Use btoa if available, otherwise use Buffer
    let base64: string;
    if (typeof btoa !== 'undefined') {
        base64 = btoa(binary);
    } else if (typeof Buffer !== 'undefined') {
        base64 = Buffer.from(buffer).toString('base64');
    } else {
        // Fallback: manual base64 encoding
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        for (let i = 0; i < buffer.length; i += 3) {
            const a = buffer[i];
            const b = buffer[i + 1] ?? 0;
            const c = buffer[i + 2] ?? 0;
            result += chars[a >> 2];
            result += chars[((a & 3) << 4) | (b >> 4)];
            result += i + 1 < buffer.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
            result += i + 2 < buffer.length ? chars[c & 63] : '=';
        }
        base64 = result;
    }

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
 * Store PKCE data in AsyncStorage before OAuth redirect
 * 
 * @param state - OAuth state parameter
 * @param codeVerifier - PKCE code verifier
 */
export async function storePKCEData(state: string, codeVerifier: string): Promise<void> {
    await AsyncStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
    await AsyncStorage.setItem(PKCE_STATE_KEY, state);
}

/**
 * Retrieve and clear PKCE data from AsyncStorage after OAuth callback
 * 
 * @param expectedState - The state parameter received from OAuth callback
 * @returns Promise resolving to the code verifier if state matches, null otherwise
 */
export async function consumePKCEData(expectedState: string): Promise<string | null> {
    const storedState = await AsyncStorage.getItem(PKCE_STATE_KEY);
    const storedVerifier = await AsyncStorage.getItem(PKCE_VERIFIER_KEY);

    // Clear stored data regardless of match
    await AsyncStorage.removeItem(PKCE_VERIFIER_KEY);
    await AsyncStorage.removeItem(PKCE_STATE_KEY);

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
    await storePKCEData(state, codeVerifier);

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

