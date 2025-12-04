import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

export const supportedLanguages = ['es', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: supportedLanguages,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ordo-language',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper to change language
export const changeLanguage = (lng: SupportedLanguage) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('ordo-language', lng);
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || 'es') as SupportedLanguage;
};
