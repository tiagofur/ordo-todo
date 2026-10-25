/**
 * Base URL of the Ordo web app for marketing CTAs (login/register).
 *
 * Production: `NEXT_PUBLIC_APP_URL=https://ordotodo.app` (build arg in
 * apps/webpage/Dockerfile, set by .github/workflows/deploy-marketing.yml).
 * The app's middleware redirects `/login` and `/register` to the visitor's
 * locale. When the variable is missing (local dev without .env) the CTAs fall
 * back to the internal `/contact` page instead of linking to a foreign site.
 */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');

export function appLink(path: '/login' | '/register'): string {
  if (APP_URL) return `${APP_URL}${path}`;
  return '/contact';
}
