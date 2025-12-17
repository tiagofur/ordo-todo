/**
 * Ordo-Todo Design Tokens
 * 
 * This file exports the CSS variables as JavaScript objects for use in
 * React Native and other JavaScript environments where CSS is not available.
 * 
 * These tokens are derived from the CSS variables in variables.css and
 * should be kept in sync.
 * 
 * @example
 * ```tsx
 * // In React Native
 * import { colors, spacing, borderRadius } from '@ordo-todo/styles/tokens';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: colors.background,
 *     padding: spacing.md,
 *     borderRadius: borderRadius.lg,
 *   },
 * });
 * ```
 */

// ============ COLOR PALETTE ============

/**
 * Light theme colors
 * OKLCH values converted to hex approximations for React Native
 */
export const lightColors = {
    // Core
    background: '#FFFFFF',
    foreground: '#0A0A0B',
    card: '#FFFFFF',
    cardForeground: '#0A0A0B',
    popover: '#FFFFFF',
    popoverForeground: '#0A0A0B',

    // Primary (Vibrant Violet)
    primary: '#7C3AED',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#F5F3FF',
    secondaryForeground: '#7C3AED',

    // Muted
    muted: '#F5F3FF',
    mutedForeground: '#6B7280',

    // Accent
    accent: '#F5F3FF',
    accentForeground: '#7C3AED',

    // Destructive
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    // Border & Input
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#7C3AED',

    // Sidebar
    sidebar: '#FAFAFA',
    sidebarForeground: '#1F2937',
    sidebarPrimary: '#7C3AED',
    sidebarPrimaryForeground: '#FFFFFF',
    sidebarAccent: '#F3F4F6',
    sidebarAccentForeground: '#7C3AED',
    sidebarBorder: '#E5E7EB',
    sidebarRing: '#7C3AED',
} as const;

/**
 * Dark theme colors
 * OKLCH values converted to hex approximations for React Native
 */
export const darkColors = {
    // Core
    background: '#0F0F14',
    foreground: '#FAFAFA',
    card: '#1A1A24',
    cardForeground: '#FAFAFA',
    popover: '#1A1A24',
    popoverForeground: '#FAFAFA',

    // Primary (Bright Violet)
    primary: '#A78BFA',
    primaryForeground: '#1A1A24',

    // Secondary
    secondary: '#27272A',
    secondaryForeground: '#FAFAFA',

    // Muted
    muted: '#27272A',
    mutedForeground: '#A1A1AA',

    // Accent
    accent: '#3F3F46',
    accentForeground: '#FAFAFA',

    // Destructive
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',

    // Border & Input
    border: '#27272A',
    input: '#27272A',
    ring: '#A78BFA',

    // Sidebar
    sidebar: '#18181B',
    sidebarForeground: '#FAFAFA',
    sidebarPrimary: '#A78BFA',
    sidebarPrimaryForeground: '#1A1A24',
    sidebarAccent: '#27272A',
    sidebarAccentForeground: '#FAFAFA',
    sidebarBorder: '#27272A',
    sidebarRing: '#A78BFA',
} as const;

/**
 * Semantic colors used throughout the app
 */
export const semanticColors = {
    // Status colors
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',

    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',

    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',

    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',

    // Vibrant colors for accents
    cyan: '#06B6D4',
    cyanLight: '#22D3EE',
    cyanDark: '#0891B2',

    purple: '#A855F7',
    purpleLight: '#C084FC',
    purpleDark: '#9333EA',

    pink: '#EC4899',
    pinkLight: '#F472B6',
    pinkDark: '#DB2777',

    orange: '#F97316',
    orangeLight: '#FB923C',
    orangeDark: '#EA580C',

    green: '#10B981',
    greenLight: '#34D399',
    greenDark: '#059669',
} as const;

/**
 * Project colors for project cards and indicators
 */
export const projectColors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F97316', // Orange
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#F43F5E', // Rose
] as const;

/**
 * Tag colors for tag badges
 */
export const tagColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#84CC16', // Lime
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
] as const;

/**
 * Chart colors for data visualization
 */
export const chartColors = {
    light: ['#F97316', '#14B8A6', '#4B5563', '#FACC15', '#EA580C'],
    dark: ['#3B82F6', '#10B981', '#FACC15', '#A855F7', '#EF4444'],
} as const;

// ============ SPACING ============

/**
 * Spacing scale based on 4px grid
 */
export const spacing = {
    px: 1,
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
} as const;

/**
 * Named spacing for common use cases
 */
export const namedSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

// ============ BORDER RADIUS ============

/**
 * Border radius scale
 * Based on --radius: 0.625rem (10px)
 */
export const borderRadius = {
    none: 0,
    sm: 6,  // calc(var(--radius) - 4px)
    md: 8,  // calc(var(--radius) - 2px)
    lg: 10, // var(--radius)
    xl: 14, // calc(var(--radius) + 4px)
    '2xl': 18,
    '3xl': 24,
    full: 9999,
} as const;

// ============ TYPOGRAPHY ============

/**
 * Font sizes
 */
export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
} as const;

/**
 * Font weights
 */
export const fontWeight = {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
} as const;

/**
 * Line heights
 */
export const lineHeight = {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
} as const;

// ============ SHADOWS ============

/**
 * Shadow definitions for React Native
 * iOS uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * Android uses elevation
 */
export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
} as const;

// ============ PRIORITY COLORS ============

/**
 * Priority colors matching the CSS theme
 */
export const priorityColors = {
    LOW: {
        background: '#DBEAFE',
        foreground: '#1E40AF',
        border: '#93C5FD',
    },
    MEDIUM: {
        background: '#FEF3C7',
        foreground: '#92400E',
        border: '#FCD34D',
    },
    HIGH: {
        background: '#FECACA',
        foreground: '#991B1B',
        border: '#F87171',
    },
    URGENT: {
        background: '#F87171',
        foreground: '#FFFFFF',
        border: '#EF4444',
    },
} as const;

// ============ STATUS COLORS ============

/**
 * Task status colors
 */
export const statusColors = {
    TODO: {
        background: '#F3F4F6',
        foreground: '#374151',
        border: '#D1D5DB',
    },
    IN_PROGRESS: {
        background: '#DBEAFE',
        foreground: '#1E40AF',
        border: '#93C5FD',
    },
    COMPLETED: {
        background: '#D1FAE5',
        foreground: '#065F46',
        border: '#6EE7B7',
    },
    CANCELLED: {
        background: '#F3F4F6',
        foreground: '#6B7280',
        border: '#D1D5DB',
    },
} as const;

// ============ TIMER COLORS ============

/**
 * Timer mode colors
 */
export const timerColors = {
    WORK: {
        primary: '#EF4444',
        background: '#FEE2E2',
    },
    SHORT_BREAK: {
        primary: '#22C55E',
        background: '#DCFCE7',
    },
    LONG_BREAK: {
        primary: '#3B82F6',
        background: '#DBEAFE',
    },
} as const;

// ============ HELPER FUNCTIONS ============

/**
 * Get colors based on theme
 */
export function getColors(isDark: boolean) {
    return isDark ? darkColors : lightColors;
}

/**
 * Get project color by index (wraps around)
 */
export function getProjectColor(index: number): string {
    return projectColors[index % projectColors.length];
}

/**
 * Get tag color by index (wraps around)
 */
export function getTagColor(index: number): string {
    return tagColors[index % tagColors.length];
}

/**
 * Convert hex to RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============ DEFAULT EXPORT ============

export const tokens = {
    colors: {
        light: lightColors,
        dark: darkColors,
        semantic: semanticColors,
        project: projectColors,
        tag: tagColors,
        chart: chartColors,
        priority: priorityColors,
        status: statusColors,
        timer: timerColors,
    },
    spacing,
    namedSpacing,
    borderRadius,
    fontSize,
    fontWeight,
    lineHeight,
    shadows,
} as const;

export default tokens;
