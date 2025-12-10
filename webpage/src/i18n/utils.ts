import { translations } from "./translations";

export function getLangFromUrl(url: URL): string {
  const [, lang] = url.pathname.split("/");
  return lang in translations ? lang : "en";
}

export function t(lang: string, key: keyof typeof translations.en): string {
  return (
    translations[lang as keyof typeof translations]?.[key] ||
    translations.en[key]
  );
}

export function useTranslations(lang: string) {
  return (key: keyof typeof translations.en) => t(lang, key);
}

export const rtlLocales = ["ar", "he", "fa", "ur"];

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale);
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}
