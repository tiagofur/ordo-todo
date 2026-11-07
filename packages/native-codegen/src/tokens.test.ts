import { darkColors, lightColors, sectionColors } from '@ordo-todo/styles/tokens';
import { describe, expect, it } from 'vitest';
import { contrastRatio, kotlinColor } from './color.ts';
import { M3_ROLES, buildSchemes, renderColorResources, renderKotlinTokens } from './tokens.ts';

const { light, dark } = buildSchemes();

describe('buildSchemes', () => {
  it('fills every Material 3 role with an opaque hex color', () => {
    for (const scheme of [light, dark]) {
      expect(Object.keys(scheme).sort()).toEqual([...M3_ROLES].sort());
      for (const role of M3_ROLES) expect(scheme[role]).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('pins the action voice to the brand tokens, not the nearest tonal step', () => {
    expect(light.primary).toBe(lightColors.primary);
    expect(light.onPrimary).toBe(lightColors.primaryForeground);
    expect(dark.primary).toBe(darkColors.primary);
    expect(dark.onPrimary).toBe(darkColors.primaryForeground);
    expect(light.surfaceTint).toBe(light.primary);
    expect(dark.surfaceTint).toBe(dark.primary);
  });

  it('shows the other theme’s primary on inverse surfaces', () => {
    expect(light.inversePrimary).toBe(darkColors.primary);
    expect(dark.inversePrimary).toBe(lightColors.primary);
  });

  it.each([
    ['light', light],
    ['dark', dark],
  ] as const)('meets WCAG AA text contrast in the %s scheme', (_, scheme) => {
    const textPairs = [
      ['primary', 'onPrimary'],
      ['primaryContainer', 'onPrimaryContainer'],
      ['secondaryContainer', 'onSecondaryContainer'],
      ['tertiaryContainer', 'onTertiaryContainer'],
      ['error', 'onError'],
      ['errorContainer', 'onErrorContainer'],
      ['surface', 'onSurface'],
      ['surface', 'onSurfaceVariant'],
      ['surfaceContainerHighest', 'onSurface'],
      ['inverseSurface', 'inverseOnSurface'],
    ] as const;
    for (const [bg, fg] of textPairs) {
      expect(contrastRatio(scheme[bg], scheme[fg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each([
    ['light', light],
    ['dark', dark],
  ] as const)('keeps interactive accents and outlines at 3:1 on the %s surface', (_, scheme) => {
    expect(contrastRatio(scheme.surface, scheme.primary)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(scheme.surface, scheme.outline)).toBeGreaterThanOrEqual(3);
  });

  it('keeps the canvas near-neutral: light surface is almost white, dark is the cold near-black', () => {
    expect(contrastRatio(light.surface, '#FFFFFF')).toBeLessThan(1.05);
    expect(contrastRatio(dark.surface, darkColors.background)).toBeLessThan(1.15);
  });
});

describe('renderKotlinTokens', () => {
  const source = renderKotlinTokens();

  it('declares a Compose color scheme argument for every role, in both themes', () => {
    for (const role of M3_ROLES) {
      expect(
        source.match(new RegExp(`^    ${role} = Color\\(0xFF[0-9A-F]{6}\\),$`, 'gm')),
      ).toHaveLength(2);
    }
  });

  it('exposes every section signature, the brand mark and the closed palettes', () => {
    for (const [key, hex] of Object.entries(sectionColors)) {
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      expect(source).toContain(`val ${name} = ${kotlinColor(hex)}`);
    }
    expect(source).toContain('val Mark = Color(0xFFAD46FF)');
    expect(source).toContain('val Project: List<Color>');
    expect(source).toContain('val Tag: List<Color>');
  });

  it('is marked as generated and points to the regenerate command', () => {
    expect(source.startsWith('// GENERATED FILE — DO NOT EDIT.')).toBe(true);
    expect(source).toContain('npm run generate -w @ordo-todo/native-codegen');
  });
});

describe('renderColorResources', () => {
  it('gives the window the scheme surface in each theme and the icon the brand mark', () => {
    const { day, night } = renderColorResources();
    expect(day).toContain(`<color name="ordo_window_background">${light.surface}</color>`);
    expect(day).toContain('<color name="ordo_brand_mark">#AD46FF</color>');
    expect(night).toContain(`<color name="ordo_window_background">${dark.surface}</color>`);
    expect(night).not.toContain('ordo_brand_mark');
  });
});
