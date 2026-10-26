/**
 * Allowlist for the post-login `next` target shared by the social OAuth
 * entry points (`GET /auth/google|github?next=...`) and callbacks.
 *
 * Only same-API paths (`/api/...`) are accepted, and the redirect host
 * always comes from our own API origin — never from user input — so a
 * crafted `next` can never turn login into an open redirect. Mirrors
 * the frontend `resolvePostLoginTarget` (web has no shared code with
 * the backend, so the rule is duplicated deliberately; keep both in
 * sync: path must start with `/api/`, reject `//`, `\` and controls).
 */
export function isSafeApiNextTarget(next: unknown): next is string {
  if (typeof next !== 'string') return false;
  if (!next.startsWith('/api/') || next.startsWith('//')) return false;
  if (next.includes('//')) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\\\x00-\x1f\x7f]/.test(next)) return false;
  return true;
}

/** API origin derived from our own configured callback URL. */
export function apiOriginFromCallback(callbackUrl: string): string | null {
  try {
    return new URL(callbackUrl).origin;
  } catch {
    return null;
  }
}

