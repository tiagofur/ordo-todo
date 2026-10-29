import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en, es, ptBr, transformTranslations } from '@ordo-todo/i18n';

const transformedEn = transformTranslations(en, 'i18next');
const transformedEs = transformTranslations(es, 'i18next');
const transformedPtBr = transformTranslations(ptBr, 'i18next');

export const resources = {
  en: { translation: transformedEn },
  es: { translation: transformedEs },
  'pt-br': { translation: transformedPtBr },
} as const;

export const supportedLanguages = ['en', 'es', 'pt-br'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false,
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

export const changeLanguage = (lng: SupportedLanguage) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('ordo-language', lng);
};

export const getCurrentLanguage = (): SupportedLanguage =>
  (i18n.language || 'en') as SupportedLanguage;

export default i18n;
