/**
 * Types for shared i18n package
 */

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
export type TranslationValue = string | { [key: string]: TranslationValue };

export type Translations = {
  [key: string]: TranslationValue;
};

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'pt-br'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  'pt-br': 'Português (Brasil)',
};
