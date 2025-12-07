import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';
import { en, es, ptBr } from '@ordo-todo/i18n';

// Map locale codes to translation objects
const translations = {
    en,
    es,
    'pt-br': ptBr,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Use translations from shared package
    const messages = translations[locale as keyof typeof translations] || en;

    return {
        locale,
        messages,
    };
});
