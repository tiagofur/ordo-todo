/**
 * Parity guard: tokens.ts must mirror packages/styles/src/variables.css.
 * The CSS file is the source of truth for the web; tokens.ts serves
 * React Native. If this test fails, update both files together.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { darkColors, lightColors } from './tokens';

const css = readFileSync(new URL('./variables.css', import.meta.url), 'utf8').toLowerCase();
const lightBlock = css.split('.dark')[0] ?? '';
const darkBlock = css.split('.dark')[1] ?? '';

function expectIn(block: string, cssVar: string, value: string) {
    expect(
        block.includes(`${cssVar.toLowerCase()}: ${value.toLowerCase()}`),
        `${cssVar} should be ${value} in variables.css`
    ).toBe(true);
}

describe('tokens.ts ↔ variables.css parity', () => {
    it('mirrors the light semantic voice', () => {
        expectIn(lightBlock, '--primary', lightColors.primary);
        expectIn(lightBlock, '--ring', lightColors.ring);
        expectIn(lightBlock, '--secondary', lightColors.secondary);
        expectIn(lightBlock, '--secondary-foreground', lightColors.secondaryForeground);
        expectIn(lightBlock, '--accent', lightColors.accent);
        expectIn(lightBlock, '--accent-foreground', lightColors.accentForeground);
        expectIn(lightBlock, '--muted', lightColors.muted);
        expectIn(lightBlock, '--sidebar-primary', lightColors.sidebarPrimary);
        expectIn(lightBlock, '--sidebar-ring', lightColors.sidebarRing);
    });

    it('mirrors the dark semantic voice', () => {
        expectIn(darkBlock, '--primary', darkColors.primary);
        expectIn(darkBlock, '--ring', darkColors.ring);
        expectIn(darkBlock, '--secondary', darkColors.secondary);
        expectIn(darkBlock, '--secondary-foreground', darkColors.secondaryForeground);
        expectIn(darkBlock, '--accent', darkColors.accent);
        expectIn(darkBlock, '--sidebar-primary', darkColors.sidebarPrimary);
        expectIn(darkBlock, '--sidebar-ring', darkColors.sidebarRing);
    });
});
