import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const localesDir = path.resolve(
  process.cwd(),
  '../../packages/i18n/src/locales',
);

function load(locale: string): unknown {
  const raw = readFileSync(path.join(localesDir, `${locale}.json`), 'utf-8');
  return JSON.parse(raw);
}

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.keys(value as Record<string, unknown>).flatMap((key) =>
    keyPaths(
      (value as Record<string, unknown>)[key],
      prefix ? `${prefix}.${key}` : key,
    ),
  );
}

describe('locale parity (@ordo-todo/i18n)', () => {
  it('has CreateTask.validation.titleRequired in every locale', () => {
    for (const locale of ['en', 'es', 'pt-br']) {
      const messages = load(locale) as Record<string, any>;
      expect(
        messages?.CreateTask?.validation?.titleRequired,
        `${locale}: CreateTask.validation.titleRequired`,
      ).toMatch(/\S+/);
    }
  });

  it('has identical key trees in en, es and pt-br', () => {
    const reference = keyPaths(load('en')).sort();
    for (const locale of ['es', 'pt-br']) {
      expect(keyPaths(load(locale)).sort()).toEqual(reference);
    }
  });
});
