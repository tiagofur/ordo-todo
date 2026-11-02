/**
 * Content-Security-Policy helpers for the web app.
 *
 * The API lives on another origin (`NEXT_PUBLIC_API_URL`), so `connect-src`
 * must allow it explicitly — otherwise every API fetch and every socket.io
 * handshake/poll logs a CSP violation. Each `http(s)` origin also needs its
 * `ws(s)` twin for the realtime socket upgrade.
 *
 * Pure and node-safe: imported by `next.config.ts` at build time.
 */

/** Production API origin, used when no API URL is configured. */
export const PROD_API_ORIGIN = 'https://api.ordotodo.app';

/**
 * Returns the `connect-src` origins for the given public API URL:
 * the production origin, the URL's own origin (path stripped), and the
 * `ws(s)` twin of each. Malformed URLs are ignored, never thrown.
 */
export function getCspConnectOrigins(apiUrl?: string): string[] {
  const httpOrigins = new Set<string>([PROD_API_ORIGIN]);
  if (apiUrl) {
    try {
      httpOrigins.add(new URL(apiUrl).origin);
    } catch {
      // Ignore malformed URLs: the production fallback still applies.
    }
  }
  const origins: string[] = [];
  for (const origin of httpOrigins) {
    origins.push(origin, origin.replace(/^http/, 'ws'));
  }
  return origins;
}
