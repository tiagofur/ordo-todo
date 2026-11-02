/**
 * UX-only token freshness check for the Edge middleware.
 *
 * This NEVER verifies the JWT signature: the middleware cannot be the
 * security boundary (it only redirects between login/dashboard). The backend
 * API is the sole authority that validates signatures and enforces access.
 * Treat any `true` here as "worth letting the page render", not as proof
 * of identity. Fail closed: anything unexpected (no `exp`, malformed
 * payload) is invalid.
 */
export function isTokenValid(token?: string): boolean {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3 || !parts[1]) return false;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (!payload.exp) return false;
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}
