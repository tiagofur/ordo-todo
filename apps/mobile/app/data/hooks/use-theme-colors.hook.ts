import { useDesignTokens } from '../../lib/use-design-tokens';

/**
 * Convert hex color to rgba
 * Local implementation to avoid Metro bundler issues with workspace subpath exports
 */
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface ThemeColors {
  // Backgrounds - Vibrant and layered
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Borders
  border: string;
  borderLight: string;

  // Cards
  card: string;
  cardBorder: string;

  // Input
  input: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputFocused: string;

  // Button
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;

  // Status - More vibrant
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;

  // Priority colors - Enhanced
  priorityLow: string;
  priorityLowBg: string;
  priorityMedium: string;
  priorityMediumBg: string;
  priorityHigh: string;
  priorityHighBg: string;

  // Tag colors - Colorful
  tagBackground: string;
  tagText: string;

  // Accent - Multiple accent colors
  accent: string;
  accentLight: string;
  accentDark: string;

  // Additional vibrant colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  tertiary: string;
  tertiaryLight: string;

  // Shadow colors
  shadowColor: string;
  shadowLight: string;
}

export function useThemeColors(): ThemeColors {
  const { colors, isDark } = useDesignTokens();

  return {
    // Backgrounds
    background: isDark ? colors.background : colors.sidebar, // Use sidebar (very light gray) for light bg to differentiate from pure white cards
    backgroundSecondary: colors.card,
    backgroundTertiary: colors.muted,
    surface: colors.card,
    surfaceElevated: colors.popover,

    // Text
    text: colors.foreground,
    textSecondary: colors.mutedForeground,
    textMuted: colors.mutedForeground,
    textInverse: colors.background,

    // Borders
    border: colors.border,
    borderLight: hexToRgba(colors.border, 0.5),

    // Cards
    card: colors.card,
    cardBorder: colors.border,

    // Input
    input: colors.input,
    inputBorder: colors.border,
    inputPlaceholder: colors.mutedForeground,
    inputFocused: colors.ring,

    // Buttons
    buttonPrimary: colors.primary,
    buttonPrimaryText: colors.primaryForeground,
    buttonSecondary: colors.secondary,
    buttonSecondaryText: colors.secondaryForeground,

    // Status
    success: colors.semantic.success,
    successLight: colors.semantic.successLight,
    error: colors.semantic.error,
    errorLight: colors.semantic.errorLight,
    warning: colors.semantic.warning,
    warningLight: colors.semantic.warningLight,
    info: colors.semantic.info,
    infoLight: colors.semantic.infoLight,

    // Priority
    priorityLow: colors.priority.LOW.foreground,
    priorityLowBg: colors.priority.LOW.background,
    priorityMedium: colors.priority.MEDIUM.foreground,
    priorityMediumBg: colors.priority.MEDIUM.background,
    priorityHigh: colors.priority.HIGH.foreground,
    priorityHighBg: colors.priority.HIGH.background,

    // Tags
    tagBackground: colors.secondary,
    tagText: colors.primary,

    // Accent
    accent: colors.primary,
    accentLight: colors.semantic.purpleLight,
    accentDark: colors.semantic.purpleDark,

    // Additional vibrant colors
    primary: colors.primary,
    primaryLight: colors.semantic.purpleLight,
    primaryDark: colors.semantic.purpleDark,
    secondary: colors.semantic.green,
    secondaryLight: colors.semantic.greenLight,
    tertiary: colors.semantic.orange,
    tertiaryLight: colors.semantic.orangeLight,

    // Shadows
    shadowColor: '#000000',
    shadowLight: isDark ? '#000000' : '#94A3B8',
  };
}
