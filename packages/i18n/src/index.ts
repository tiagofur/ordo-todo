/**
 * Shared Internationalization Package for Ordo-Todo
 *
 * This package provides:
 * - Shared translation files for all supported locales
 * - Utility functions to convert between i18n library formats
 * - Type definitions for translations
 *
 * @example
 * ```tsx
 * // For Next.js (next-intl) - use JSON directly
 * import en from '@ordo-todo/i18n/locales/en';
 *
 * // For React Native/Desktop (i18next) - transform format
 * import en from '@ordo-todo/i18n/locales/en';
 * import { transformTranslations } from '@ordo-todo/i18n';
 *
 * const i18nextTranslations = transformTranslations(en, 'i18next');
 * ```
 */

// Types
export * from './types';

// Utilities
export * from './utils';

// Locales (as JavaScript modules for tree-shaking)
import en from './locales/en.json';
import es from './locales/es.json';
import ptBr from './locales/pt-br.json';

export const locales = {
  en,
  es,
  'pt-br': ptBr,
} as const;

export { en, es, ptBr };

// Default export for convenience
export default locales;
