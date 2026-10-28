export const locales = ['en', 'es', 'pt-br'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'es';

/** Explicit language choice (auth switcher, settings). Wins over detection. */
export const LOCALE_COOKIE = 'ordo-locale';
