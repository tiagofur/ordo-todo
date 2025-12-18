/**
 * Utility functions for translation format conversion
 */
import type { Translations, InterpolationFormat } from './types.js';
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
export declare function convertInterpolation(text: string, targetFormat: InterpolationFormat): string;
/**
 * Deep transform all string values in a translations object
 */
export declare function transformTranslations(translations: Translations, targetFormat: InterpolationFormat): Translations;
/**
 * Flatten nested translation keys for i18next compatibility
 *
 * @example
 * flattenKeys({ Settings: { title: "Settings", theme: { light: "Light" } } })
 * // => { "Settings.title": "Settings", "Settings.theme.light": "Light" }
 */
export declare function flattenKeys(translations: Translations, prefix?: string, separator?: string): Record<string, string>;
/**
 * Get translation value by dot-notation key path
 *
 * @example
 * getByPath(translations, 'Settings.theme.light')
 * // => "Light"
 */
export declare function getByPath(translations: Translations, path: string): string | undefined;
//# sourceMappingURL=utils.d.ts.map