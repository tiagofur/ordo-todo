/**
 * Utility functions for translation format conversion
 */
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
export function convertInterpolation(text, targetFormat) {
    if (targetFormat === 'i18next') {
        // Convert {var} to {{var}}, but avoid double conversion
        // Also handle plural syntax {count, plural, ...} by extracting just the variable
        return text
            .replace(/\{(\w+),\s*plural,[^}]+\}/g, '{{$1}}') // {count, plural, ...} -> {{count}}
            .replace(/(?<!\{)\{(\w+)\}(?!\})/g, '{{$1}}'); // {var} -> {{var}}
    }
    else {
        // Convert {{var}} to {var}
        return text.replace(/\{\{(\w+)\}\}/g, '{$1}');
    }
}
/**
 * Deep transform all string values in a translations object
 */
export function transformTranslations(translations, targetFormat) {
    const transform = (value) => {
        if (typeof value === 'string') {
            return convertInterpolation(value, targetFormat);
        }
        if (Array.isArray(value)) {
            return value.map(transform);
        }
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = transform(val);
        }
        return result;
    };
    return transform(translations);
}
/**
 * Flatten nested translation keys for i18next compatibility
 *
 * @example
 * flattenKeys({ Settings: { title: "Settings", theme: { light: "Light" } } })
 * // => { "Settings.title": "Settings", "Settings.theme.light": "Light" }
 */
export function flattenKeys(translations, prefix = '', separator = '.') {
    const result = {};
    for (const [key, value] of Object.entries(translations)) {
        const newKey = prefix ? `${prefix}${separator}${key}` : key;
        if (typeof value === 'string') {
            result[newKey] = value;
        }
        else {
            Object.assign(result, flattenKeys(value, newKey, separator));
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
export function getByPath(translations, path) {
    const keys = path.split('.');
    let current = translations;
    for (const key of keys) {
        if (typeof current === 'string' || current === undefined) {
            return undefined;
        }
        if (Array.isArray(current)) {
            const index = parseInt(key, 10);
            if (isNaN(index)) {
                current = undefined;
            }
            else {
                current = current[index];
            }
        }
        else {
            current = current[key];
        }
    }
    return typeof current === 'string' ? current : undefined;
}
