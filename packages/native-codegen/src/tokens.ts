import { Hct, TonalPalette } from '@material/material-color-utilities';
import {
  brandColors,
  darkColors,
  lightColors,
  projectColors,
  sectionColors,
  tagColors,
} from '@ordo-todo/styles/tokens';
import { argbFromToken, hexFromToken, kotlinColor } from './color.ts';
import { REGENERATE_COMMAND } from './paths.ts';

/** Material 3 color roles, in the parameter order of Compose's `lightColorScheme()`. */
export const M3_ROLES = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'inversePrimary',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'background',
  'onBackground',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'surfaceTint',
  'inverseSurface',
  'inverseOnSurface',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'outline',
  'outlineVariant',
  'scrim',
  'surfaceBright',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'surfaceContainerLow',
  'surfaceContainerLowest',
  'surfaceDim',
] as const;

export type M3Role = (typeof M3_ROLES)[number];
export type ColorScheme = Record<M3Role, string>;

type PaletteKey = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant' | 'error';
type ToneSpec = readonly [PaletteKey, number];

/**
 * Chroma per palette. Accent palettes follow Material's Tonal Spot; the neutral
 * palettes sit lower than Tonal Spot (6/8) so the canvas stays almost neutral,
 * like the web's zinc-and-white "cockpit sereno", while keeping the violet hue
 * that gives dark mode its cold bias (DESIGN.md "La Regla del Modo Oscuro Frío").
 */
export const PALETTE_CHROMA = {
  primary: 36,
  secondary: 16,
  tertiary: 24,
  neutral: 4,
  neutralVariant: 6,
} as const;

/** Tertiary hue rotation used by Material's Tonal Spot scheme. */
const TERTIARY_HUE_SHIFT = 60;

/** Material's default error palette (hue 25 ≈ the web's destructive red, at accessible tones). */
const ERROR_HUE = 25;
const ERROR_CHROMA = 84;

/** Material 3 baseline tone mapping (static scheme, 2023 surface roles). */
const LIGHT_TONES: Record<Exclude<M3Role, 'surfaceTint'>, ToneSpec> = {
  primary: ['primary', 40],
  onPrimary: ['primary', 100],
  primaryContainer: ['primary', 90],
  onPrimaryContainer: ['primary', 10],
  inversePrimary: ['primary', 80],
  secondary: ['secondary', 40],
  onSecondary: ['secondary', 100],
  secondaryContainer: ['secondary', 90],
  onSecondaryContainer: ['secondary', 10],
  tertiary: ['tertiary', 40],
  onTertiary: ['tertiary', 100],
  tertiaryContainer: ['tertiary', 90],
  onTertiaryContainer: ['tertiary', 10],
  background: ['neutral', 98],
  onBackground: ['neutral', 10],
  surface: ['neutral', 98],
  onSurface: ['neutral', 10],
  // The brand primary sits at HCT tone ~43 (not Material's 40), so primary-as-text
  // misses AA (4.4:1) on the canonical tone-90 surfaces. These three move two tones
  // lighter (4.6:1+) keeping the container ladder monotonic; everything else canonical.
  surfaceVariant: ['neutralVariant', 92],
  onSurfaceVariant: ['neutralVariant', 30],
  inverseSurface: ['neutral', 20],
  inverseOnSurface: ['neutral', 95],
  error: ['error', 40],
  onError: ['error', 100],
  errorContainer: ['error', 90],
  onErrorContainer: ['error', 10],
  outline: ['neutralVariant', 50],
  outlineVariant: ['neutralVariant', 80],
  scrim: ['neutral', 0],
  surfaceBright: ['neutral', 98],
  surfaceContainer: ['neutral', 94],
  surfaceContainerHigh: ['neutral', 93],
  surfaceContainerHighest: ['neutral', 92],
  surfaceContainerLow: ['neutral', 96],
  surfaceContainerLowest: ['neutral', 100],
  surfaceDim: ['neutral', 87],
};

const DARK_TONES: Record<Exclude<M3Role, 'surfaceTint'>, ToneSpec> = {
  primary: ['primary', 80],
  onPrimary: ['primary', 20],
  primaryContainer: ['primary', 30],
  onPrimaryContainer: ['primary', 90],
  inversePrimary: ['primary', 40],
  secondary: ['secondary', 80],
  onSecondary: ['secondary', 20],
  secondaryContainer: ['secondary', 30],
  onSecondaryContainer: ['secondary', 90],
  tertiary: ['tertiary', 80],
  onTertiary: ['tertiary', 20],
  tertiaryContainer: ['tertiary', 30],
  onTertiaryContainer: ['tertiary', 90],
  background: ['neutral', 6],
  onBackground: ['neutral', 90],
  surface: ['neutral', 6],
  onSurface: ['neutral', 90],
  surfaceVariant: ['neutralVariant', 30],
  onSurfaceVariant: ['neutralVariant', 80],
  inverseSurface: ['neutral', 90],
  inverseOnSurface: ['neutral', 20],
  error: ['error', 80],
  onError: ['error', 20],
  errorContainer: ['error', 30],
  onErrorContainer: ['error', 90],
  outline: ['neutralVariant', 60],
  outlineVariant: ['neutralVariant', 30],
  scrim: ['neutral', 0],
  surfaceBright: ['neutral', 24],
  surfaceContainer: ['neutral', 12],
  surfaceContainerHigh: ['neutral', 17],
  surfaceContainerHighest: ['neutral', 22],
  surfaceContainerLow: ['neutral', 10],
  surfaceContainerLowest: ['neutral', 4],
  surfaceDim: ['neutral', 6],
};

export function buildPalettes(seedHex: string): Record<PaletteKey, TonalPalette> {
  const hue = Hct.fromInt(argbFromToken(seedHex)).hue;
  return {
    primary: TonalPalette.fromHueAndChroma(hue, PALETTE_CHROMA.primary),
    secondary: TonalPalette.fromHueAndChroma(hue, PALETTE_CHROMA.secondary),
    tertiary: TonalPalette.fromHueAndChroma(
      (hue + TERTIARY_HUE_SHIFT) % 360,
      PALETTE_CHROMA.tertiary,
    ),
    neutral: TonalPalette.fromHueAndChroma(hue, PALETTE_CHROMA.neutral),
    neutralVariant: TonalPalette.fromHueAndChroma(hue, PALETTE_CHROMA.neutralVariant),
    error: TonalPalette.fromHueAndChroma(ERROR_HUE, ERROR_CHROMA),
  };
}

interface BrandOverrides {
  primary: string;
  onPrimary: string;
}

function buildScheme(
  palettes: Record<PaletteKey, TonalPalette>,
  tones: Record<Exclude<M3Role, 'surfaceTint'>, ToneSpec>,
  brand: BrandOverrides,
): ColorScheme {
  const scheme = {} as ColorScheme;
  for (const role of M3_ROLES) {
    if (role === 'surfaceTint') continue;
    const [palette, tone] = tones[role];
    scheme[role] = hexFromToken(palettes[palette].tone(tone));
  }
  // Brand fidelity: the action voice is the exact token, not the nearest tone.
  // inversePrimary keeps its palette tone (80 light / 40 dark): the brand hex is
  // HCT tone ~43, which misses AA as text on the tone-90 inverse surfaces.
  scheme.primary = brand.primary;
  scheme.onPrimary = brand.onPrimary;
  scheme.surfaceTint = brand.primary;
  return scheme;
}

/** Light and dark schemes: tonal roles from the brand hue, primary pinned to the tokens. */
export function buildSchemes(): { light: ColorScheme; dark: ColorScheme } {
  const palettes = buildPalettes(lightColors.primary);
  return {
    light: buildScheme(palettes, LIGHT_TONES, {
      primary: lightColors.primary,
      onPrimary: lightColors.primaryForeground,
    }),
    dark: buildScheme(palettes, DARK_TONES, {
      primary: darkColors.primary,
      onPrimary: darkColors.primaryForeground,
    }),
  };
}

function pascalCase(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function renderScheme(name: string, factory: string, scheme: ColorScheme): string {
  const args = M3_ROLES.map((role) => `    ${role} = ${kotlinColor(scheme[role])},`).join('\n');
  return `internal val ${name}: ColorScheme = ${factory}(\n${args}\n)`;
}

function renderColorList(colors: readonly string[]): string {
  return colors.map((hex) => `        ${kotlinColor(hex)},`).join('\n');
}

/** Kotlin source with the Compose color schemes, section signatures, brand and closed palettes. */
export function renderKotlinTokens(): string {
  const { light, dark } = buildSchemes();
  const sections = Object.entries(sectionColors)
    .map(([key, hex]) => `    val ${pascalCase(key)} = ${kotlinColor(hex)}`)
    .join('\n');

  return `// GENERATED FILE — DO NOT EDIT.
// Source: packages/styles/src/tokens.ts, via @ordo-todo/native-codegen.
// Regenerate with: ${REGENERATE_COMMAND}
package dev.creapolis.ordotodo.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/** Material 3 light scheme: primary pinned to the brand token, tonal roles from its hue. */
${renderScheme('OrdoLightColorScheme', 'lightColorScheme', light)}

/** Material 3 dark scheme: primary pinned to the brand token, tonal roles from its hue. */
${renderScheme('OrdoDarkColorScheme', 'darkColorScheme', dark)}

/** Section signatures: they identify a module, never drive an action (DESIGN.md). */
object OrdoSectionColors {
${sections}
}

/** Brand identity: app icon and BrandMark only, never an action color (DESIGN.md). */
object OrdoBrandColors {
    val Mark = ${kotlinColor(brandColors.mark)}
}

/** Closed palettes: values are picked from these lists, never invented. */
object OrdoPalettes {
    val Project: List<Color> = listOf(
${renderColorList(projectColors)}
    )
    val Tag: List<Color> = listOf(
${renderColorList(tagColors)}
    )
}
`;
}

function renderColorResource(entries: Record<string, string>): string {
  const items = Object.entries(entries)
    .map(([name, hex]) => `    <color name="${name}">${hex}</color>`)
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- GENERATED FILE — DO NOT EDIT. Source: packages/styles/src/tokens.ts. Regenerate with: ${REGENERATE_COMMAND} -->
<resources>
${items}
</resources>
`;
}

/**
 * XML color resources for what lives outside Compose: the window background
 * shown before the first frame, and the adaptive launcher icon.
 */
export function renderColorResources(): { day: string; night: string } {
  const { light, dark } = buildSchemes();
  return {
    day: renderColorResource({
      ordo_brand_mark: brandColors.mark,
      ordo_window_background: light.surface,
    }),
    night: renderColorResource({
      ordo_window_background: dark.surface,
    }),
  };
}
