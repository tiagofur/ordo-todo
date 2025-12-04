/**
 * Color utility functions
 * Used across all applications for consistent color manipulation
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1]!, 16),
            g: parseInt(result[2]!, 16),
            b: parseInt(result[3]!, 16),
        }
        : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (x: number) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return "#000000";

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hexColor: string, percent: number): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return hexColor;

    const amount = Math.round(2.55 * percent);
    const r = Math.min(255, rgb.r + amount);
    const g = Math.min(255, rgb.g + amount);
    const b = Math.min(255, rgb.b + amount);

    return rgbToHex(r, g, b);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hexColor: string, percent: number): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return hexColor;

    const amount = Math.round(2.55 * percent);
    const r = Math.max(0, rgb.r - amount);
    const g = Math.max(0, rgb.g - amount);
    const b = Math.max(0, rgb.b - amount);

    return rgbToHex(r, g, b);
}

/**
 * Add alpha channel to hex color
 */
export function addAlpha(hexColor: string, alpha: number): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return hexColor;

    const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
    return `${hexColor}${a.toString(16).padStart(2, "0")}`;
}

/**
 * Convert hex color to RGBA string
 */
export function hexToRgba(hexColor: string, alpha: number = 1): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return `rgba(0, 0, 0, ${alpha})`;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Generate a random hex color
 */
export function randomColor(): string {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

/**
 * Check if a color is light
 */
export function isLightColor(hexColor: string): boolean {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return false;

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
}

/**
 * Check if a color is dark
 */
export function isDarkColor(hexColor: string): boolean {
    return !isLightColor(hexColor);
}

/**
 * Mix two colors
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const w = Math.max(0, Math.min(1, weight));
    const r = Math.round(rgb1.r * (1 - w) + rgb2.r * w);
    const g = Math.round(rgb1.g * (1 - w) + rgb2.g * w);
    const b = Math.round(rgb1.b * (1 - w) + rgb2.b * w);

    return rgbToHex(r, g, b);
}

/**
 * Generate a color palette from a base color
 */
export function generatePalette(baseColor: string): {
    lighter: string;
    light: string;
    base: string;
    dark: string;
    darker: string;
} {
    return {
        lighter: lightenColor(baseColor, 40),
        light: lightenColor(baseColor, 20),
        base: baseColor,
        dark: darkenColor(baseColor, 20),
        darker: darkenColor(baseColor, 40),
    };
}

/**
 * Get color with opacity for backgrounds
 */
export function getColorWithOpacity(hexColor: string, opacity: number = 0.1): string {
    return hexToRgba(hexColor, opacity);
}
