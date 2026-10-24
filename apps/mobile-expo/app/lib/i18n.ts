/**
 * i18n Configuration for Mobile
 * 
 * Uses react-i18next with translations from @ordo-todo/i18n package.
 * This ensures translations are synchronized with Web and Desktop apps.
 * 
 * @example
 * ```tsx
 * // In a component
 * import { useTranslation } from 'react-i18next';
 * 
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <Text>{t('Common.loading')}</Text>;
 * }
 * ```
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { locales } from '@ordo-todo/i18n';

// Determine the device language
const getDeviceLanguage = (): string => {
    const locales = Localization.getLocales();
    if (locales.length > 0) {
        const languageCode = locales[0].languageCode || 'en';
        // Map language codes to our supported locales
        if (languageCode.startsWith('es')) return 'es';
        if (languageCode.startsWith('pt')) return 'pt-br';
        return 'en';
    }
    return 'en';
};

// Supported languages
export const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'pt-br', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: locales.en },
            es: { translation: locales.es },
            'pt-br': { translation: locales['pt-br'] },
        },
        lng: getDeviceLanguage(),
        fallbackLng: 'en',

        // Interpolation settings
        interpolation: {
            escapeValue: false, // React Native handles escaping
        },

        // Namespace settings
        defaultNS: 'translation',
        ns: ['translation'],

        // React i18next settings
        react: {
            useSuspense: false, // Disable suspense for React Native compatibility
        },

        // Key separator for nested keys (e.g., "Common.loading")
        keySeparator: '.',

        // Nesting support
        nsSeparator: ':',

        // Debug mode in development
        debug: __DEV__,

        // Compatibility mode
        compatibilityJSON: 'v4',
    });

/**
 * Change the current language
 * @param language - The language code to change to
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
    await i18n.changeLanguage(language);
};

/**
 * Get the current language
 */
export const getCurrentLanguage = (): string => {
    return i18n.language;
};

/**
 * Check if a language is supported
 */
export const isLanguageSupported = (code: string): code is SupportedLanguage => {
    return supportedLanguages.some(lang => lang.code === code);
};

export default i18n;
