import { API_CONFIG } from "@/config";

/**
 * Resolves the post-login `next` target to an absolute URL, or null when
 * absent or unsafe. Only same-API paths are accepted (`/api/...`); the
 * host always comes from our own API base, never from the query, so a
 * crafted `?next=https://evil` can never turn login into an open
 * redirect. Used by the OAuth authorize bounce
 * (`/login?next=/api/v1/oauth/authorize?...`): after signing in, the
 * browser returns to the authorize URL (now with a session) and the
 * connector flow completes without a manual retry.
 */
export function resolvePostLoginTarget(next: string | null): string | null {
  if (!next || !next.startsWith("/api/") || next.startsWith("//")) {
    return null;
  }
  let apiOrigin: string;
  try {
    apiOrigin = new URL(API_CONFIG.baseURL).origin;
  } catch {
    return null;
  }
  return `${apiOrigin}${next}`;
}
