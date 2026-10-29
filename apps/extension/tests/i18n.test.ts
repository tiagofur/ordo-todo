import { expect, describe, it } from 'vitest';
import i18n, { resources, supportedLanguages } from '../src/i18n';

const LOCALES = {
  en: resources.en.translation as Record<string, unknown>,
  es: resources.es.translation as Record<string, unknown>,
  'pt-br': resources['pt-br'].translation as Record<string, unknown>,
};

describe('Extension namespace i18n', () => {
  it('tiene paridad de claves Extension en es/en/pt-br', () => {
    const keys = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        typeof v === 'object' && v !== null ? keys(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
      );

    const extensionKeys = (locale: string) =>
      keys(LOCALES[locale as keyof typeof LOCALES]).filter((k) => k.startsWith('Extension.'));

    expect(extensionKeys('es').length).toBeGreaterThan(0);
    expect(new Set(extensionKeys('es'))).toEqual(new Set(extensionKeys('en')));
    expect(new Set(extensionKeys('es'))).toEqual(new Set(extensionKeys('pt-br')));
  });

  it('resuelve las claves Extension en los 3 idiomas', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('Extension.popupTitle')).toBeTruthy();
    expect(i18n.t('Extension.popupTitle')).not.toBe('Extension.popupTitle');

    await i18n.changeLanguage('en');
    expect(i18n.t('Extension.popupTitle')).toBeTruthy();

    await i18n.changeLanguage('pt-br');
    expect(i18n.t('Extension.popupTitle')).toBeTruthy();
    expect(supportedLanguages).toContain('pt-br');
  });
});
