import { argbFromHex, hexFromArgb } from '@material/material-color-utilities';

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Parses an opaque `#RRGGBB` color, rejecting shorthand, alpha and named colors. */
export function argbFromToken(hex: string): number {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(`Expected an opaque #RRGGBB color, got "${hex}"`);
  }
  return argbFromHex(hex);
}

/** Uppercase `#RRGGBB` for an ARGB int (alpha is dropped: every token is opaque). */
export function hexFromToken(argb: number): string {
  return hexFromArgb(argb).toUpperCase();
}

/** Compose literal, e.g. `Color(0xFF7C3AED)`. */
export function kotlinColor(hex: string): string {
  argbFromToken(hex);
  return `Color(0xFF${hex.slice(1).toUpperCase()})`;
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance(hex: string): number {
  const argb = argbFromToken(hex);
  const r = channelToLinear((argb >> 16) & 0xff);
  const g = channelToLinear((argb >> 8) & 0xff);
  const b = channelToLinear(argb & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two opaque colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
