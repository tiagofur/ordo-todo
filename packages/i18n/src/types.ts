/**
 * Types for shared i18n package
 */

import en from './locales/en.json' with { type: "json" };

export type SupportedLocale = 'en' | 'es' | 'pt-br';

export type InterpolationFormat = 'next-intl' | 'i18next';

export interface TransformOptions {
  /**
   * Target interpolation format
   * - 'next-intl': Uses {variable} syntax
   * - 'i18next': Uses {{variable}} syntax
   */
  format: InterpolationFormat;
}

/**
 * Deep nested translation object type
 */
export type TranslationValue = string | TranslationValue[] | { [key: string]: TranslationValue };

export type Translations = {
  [key: string]: TranslationValue;
};

/**
 * Type representing the full structure of the default locale (en)
 * Use this for strict typing of translation keys.
 */
export type Dictionary = typeof en;


export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'pt-br'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  'pt-br': 'Português (Brasil)',
};
