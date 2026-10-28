import { locales, defaultLocale, type AppLocale } from '@/i18n/locales';

export type { AppLocale };

/** Backend locales (es-MX, pt-BR…) collapse to the app locale when possible. */
const BACKEND_LOCALE_PREFIX: Record<string, AppLocale> = {
  pt: 'pt-br',
  es: 'es',
  en: 'en',
};

function normalizeCandidate(raw: string): AppLocale | null {
  const lower = raw.trim().toLowerCase();
  if ((locales as readonly string[]).includes(lower)) {
    return lower as AppLocale;
  }
  const prefix = BACKEND_LOCALE_PREFIX[lower.split('-')[0] ?? ''];
  return prefix ?? null;
}

/**
 * Priority: explicit user choice (cookie) → saved account locale →
 * browser languages in order → default. Never throws on junk input.
 */
export function resolvePreferredLocale(
  browserLocales: readonly string[],
  storedLocale?: string | null,
  savedAccountLocale?: string | null
): AppLocale {
  if (storedLocale) {
    const stored = normalizeCandidate(storedLocale);
    if (stored) return stored;
  }
  if (savedAccountLocale) {
    const saved = normalizeCandidate(savedAccountLocale);
    if (saved) return saved;
  }
  for (const candidate of browserLocales) {
    const match = normalizeCandidate(candidate);
    if (match) return match;
  }
  return defaultLocale;
}
