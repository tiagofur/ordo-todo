import { describe, expect, it } from 'vitest';
import { isTokenValid } from '../auth-token';

function unsignedJwt(payload: Record<string, unknown>): string {
    const b64 = (obj: unknown) =>
        Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    return `${b64({ alg: 'none' })}.${b64(payload)}.sig`;
}

describe('isTokenValid', () => {
    it('accepts a token expiring in the future', () => {
        const exp = Math.floor(Date.now() / 1000) + 3600;
        expect(isTokenValid(unsignedJwt({ sub: 'u1', exp }))).toBe(true);
    });

    it('rejects an expired token', () => {
        const exp = Math.floor(Date.now() / 1000) - 3600;
        expect(isTokenValid(unsignedJwt({ sub: 'u1', exp }))).toBe(false);
    });

    it('rejects a token without exp (fail-closed)', () => {
        expect(isTokenValid(unsignedJwt({ sub: 'u1' }))).toBe(false);
    });

    it('rejects malformed input', () => {
        expect(isTokenValid(undefined)).toBe(false);
        expect(isTokenValid('')).toBe(false);
        expect(isTokenValid('not-a-jwt')).toBe(false);
        expect(isTokenValid('a.b')).toBe(false);
    });
});
