/**
 * Base URL of the Ordo web app for marketing CTAs (login/register).
 *
 * No verified production domain exists yet (ODD 013 S10: `ordotodo.app`
 * serves an unrelated site, `ordo-todo.com` does not resolve as of
 * 2026-10-21). Until the business provides one, CTAs fall back to the
 * internal `/contact` page instead of linking to a foreign site.
 * Set `NEXT_PUBLIC_APP_URL` (e.g. https://app.example.com) to enable them.
 */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');

export function appLink(path: '/login' | '/register'): string {
  if (APP_URL) return `${APP_URL}${path}`;
  return '/contact';
}
