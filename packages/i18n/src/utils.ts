/**
 * Utility functions for translation format conversion
 */

import type { Translations, TranslationValue, InterpolationFormat } from './types.js';

/**
 * Convert interpolation syntax between next-intl and i18next formats
 *
 * next-intl: {variable}, {count, plural, ...}
 * i18next: {{variable}}, {{count}} with _one/_other suffixes
 *
 * @example
 * // next-intl to i18next
 * convertInterpolation("{name} has {count} tasks", 'i18next')
 * // => "{{name}} has {{count}} tasks"
 *
 * // i18next to next-intl
 * convertInterpolation("{{name}} has {{count}} tasks", 'next-intl')
 * // => "{name} has {count} tasks"
 */
export function convertInterpolation(text: string, targetFormat: InterpolationFormat): string {
  if (targetFormat === 'i18next') {
    // Convert {var} to {{var}}, but avoid double conversion
    // Also handle plural syntax {count, plural, ...} by extracting just the variable
    return text
      .replace(/\{(\w+),\s*plural,[^}]+\}/g, '{{$1}}') // {count, plural, ...} -> {{count}}
      .replace(/(?<!\{)\{(\w+)\}(?!\})/g, '{{$1}}'); // {var} -> {{var}}
  } else {
    // Convert {{var}} to {var}
    return text.replace(/\{\{(\w+)\}\}/g, '{$1}');
  }
}

/**
 * Deep transform all string values in a translations object
 */
export function transformTranslations(
  translations: Translations,
  targetFormat: InterpolationFormat
): Translations {
  const transform = (value: TranslationValue): TranslationValue => {
    if (typeof value === 'string') {
      return convertInterpolation(value, targetFormat);
    }
    const result: { [key: string]: TranslationValue } = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = transform(val);
    }
    return result;
  };

  return transform(translations) as Translations;
}

/**
 * Flatten nested translation keys for i18next compatibility
 *
 * @example
 * flattenKeys({ Settings: { title: "Settings", theme: { light: "Light" } } })
 * // => { "Settings.title": "Settings", "Settings.theme.light": "Light" }
 */
export function flattenKeys(
  translations: Translations,
  prefix = '',
  separator = '.'
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(translations)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else {
      Object.assign(result, flattenKeys(value as Translations, newKey, separator));
    }
  }

  return result;
}

/**
 * Get translation value by dot-notation key path
 *
 * @example
 * getByPath(translations, 'Settings.theme.light')
 * // => "Light"
 */
export function getByPath(translations: Translations, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationValue | undefined = translations;

  for (const key of keys) {
    if (typeof current === 'string' || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === 'string' ? current : undefined;
}
