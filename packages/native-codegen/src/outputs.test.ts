import { describe, expect, it } from 'vitest';
import { buildOutputs, findStaleOutputs, staleMessage } from './outputs.ts';

describe('native generated files', () => {
  it('are in sync with packages/styles and packages/i18n (run the generator when this fails)', () => {
    const stale = findStaleOutputs(buildOutputs());
    expect(stale, staleMessage(stale)).toEqual([]);
  });

  it('cover the theme, the window colors and the three locales', () => {
    const paths = buildOutputs().map((file) => file.path);
    expect(paths.some((p) => p.endsWith('ui/theme/OrdoTokens.kt'))).toBe(true);
    for (const dir of ['values', 'values-night']) {
      expect(paths.some((p) => p.endsWith(`res/${dir}/ordo_colors.xml`))).toBe(true);
    }
    for (const dir of ['values', 'values-en', 'values-pt-rBR']) {
      expect(paths.some((p) => p.endsWith(`res/${dir}/strings.xml`))).toBe(true);
    }
  });
});
