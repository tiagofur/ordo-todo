import { describe, it, expect } from 'vitest';
import { resolvePreferredLocale } from '../locale-resolve';

describe('resolvePreferredLocale', () => {
  describe('explicit cookie choice wins', () => {
    it('returns the stored locale over browser and account values', () => {
      expect(resolvePreferredLocale(['pt-BR', 'en'], 'en', 'pt-BR')).toBe('en');
      expect(resolvePreferredLocale(['en'], 'pt-br', 'es-MX')).toBe('pt-br');
    });

    it('ignores a junk cookie without throwing', () => {
      expect(resolvePreferredLocale(['pt-BR'], 'xx', null)).toBe('pt-br');
      expect(resolvePreferredLocale(['fr'], 'xx', null)).toBe('es');
    });
  });

  describe('saved account locale is second', () => {
    it('collapses backend locales (pt-BR, es-MX) to app locales', () => {
      expect(resolvePreferredLocale(['en'], null, 'pt-BR')).toBe('pt-br');
      expect(resolvePreferredLocale(['en'], null, 'es-MX')).toBe('es');
      expect(resolvePreferredLocale(['pt-BR'], null, 'es-ES')).toBe('es');
    });

    it('ignores junk account locales', () => {
      expect(resolvePreferredLocale(['pt-BR'], null, 'xx-YY')).toBe('pt-br');
    });
  });

  describe('browser negotiation', () => {
    it('matches full tags first (pt-PT falls back to the pt prefix)', () => {
      expect(resolvePreferredLocale(['pt-PT', 'en'], null, null)).toBe('pt-br');
      expect(resolvePreferredLocale(['pt', 'en'], null, null)).toBe('pt-br');
      expect(resolvePreferredLocale(['es-AR', 'en'], null, null)).toBe('es');
      expect(resolvePreferredLocale(['en-US', 'es'], null, null)).toBe('en');
    });

    it('walks the browser list in order', () => {
      expect(resolvePreferredLocale(['fr', 'es', 'en'], null, null)).toBe('es');
      expect(resolvePreferredLocale(['de-CH', 'it'], null, null)).toBe('es');
    });

    it('is case-insensitive and trims whitespace', () => {
      expect(resolvePreferredLocale(['  PT-br '], null, null)).toBe('pt-br');
    });

    it('falls back to the default locale', () => {
      expect(resolvePreferredLocale([], null, null)).toBe('es');
      expect(resolvePreferredLocale(['fr'], null, null)).toBe('es');
    });
  });
});
