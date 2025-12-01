import { useTheme } from '../contexts/theme.context';

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

const lightColors: ThemeColors = {
  // Backgrounds - Light and clean (SOLO ESTO CAMBIA)
  background: '#F7F9FC',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text - Dark on light (SOLO ESTO CAMBIA)
  text: '#1A1F36',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  // Borders - Light borders (SOLO ESTO CAMBIA)
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Cards - White surfaces (SOLO ESTO CAMBIA)
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',

  // Input - Light inputs (SOLO ESTO CAMBIA)
  input: '#FFFFFF',
  inputBorder: '#CBD5E0',
  inputPlaceholder: '#94A3B8',
  inputFocused: '#7C3AED',

  // Buttons - MISMOS COLORES que dark mode
  buttonPrimary: '#7C3AED',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#FFFFFF',

  // Status - MISMOS COLORES VIBRANTES que dark mode
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Priority - MISMOS COLORES que dark mode
  priorityLow: '#10B981',
  priorityLowBg: '#D1FAE5',
  priorityMedium: '#F59E0B',
  priorityMediumBg: '#FEF3C7',
  priorityHigh: '#EF4444',
  priorityHighBg: '#FEE2E2',

  // Tags - MISMO ESQUEMA que dark mode
  tagBackground: '#EDE9FE',
  tagText: '#7C3AED',

  // Accent - MISMOS COLORES que dark mode
  accent: '#7C3AED',
  accentLight: '#A78BFA',
  accentDark: '#6D28D9',

  // Additional vibrant colors - MISMOS que dark mode
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  tertiary: '#F59E0B',
  tertiaryLight: '#FBBF24',

  // Shadows - Adaptado para light mode
  shadowColor: '#000000',
  shadowLight: '#64748B',
};

const darkColors: ThemeColors = {
  // Backgrounds - Deep dark (SOLO ESTO CAMBIA)
  background: '#0F0F1E',
  backgroundSecondary: '#1A1A2E',
  backgroundTertiary: '#252540',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',

  // Text - Light on dark (SOLO ESTO CAMBIA)
  text: '#F7FAFC',
  textSecondary: '#CBD5E0',
  textMuted: '#94A3B8',
  textInverse: '#1A1F36',

  // Borders - Dark borders (SOLO ESTO CAMBIA)
  border: '#334155',
  borderLight: '#1E293B',

  // Cards - Dark surfaces (SOLO ESTO CAMBIA)
  card: '#1A1A2E',
  cardBorder: '#334155',

  // Input - Dark inputs (SOLO ESTO CAMBIA)
  input: '#252540',
  inputBorder: '#475569',
  inputPlaceholder: '#64748B',
  inputFocused: '#7C3AED',

  // Buttons - MISMOS COLORES que light mode
  buttonPrimary: '#7C3AED',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#FFFFFF',

  // Status - MISMOS COLORES VIBRANTES que light mode
  success: '#10B981',
  successLight: '#064E3B',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  info: '#3B82F6',
  infoLight: '#1E3A8A',

  // Priority - MISMOS COLORES que light mode
  priorityLow: '#10B981',
  priorityLowBg: '#064E3B',
  priorityMedium: '#F59E0B',
  priorityMediumBg: '#78350F',
  priorityHigh: '#EF4444',
  priorityHighBg: '#7F1D1D',

  // Tags - MISMO ESQUEMA que light mode
  tagBackground: '#4C1D95',
  tagText: '#C4B5FD',

  // Accent - MISMOS COLORES que light mode
  accent: '#7C3AED',
  accentLight: '#A78BFA',
  accentDark: '#6D28D9',

  // Additional vibrant colors - MISMOS que light mode
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  tertiary: '#F59E0B',
  tertiaryLight: '#FBBF24',

  // Shadows - Adaptado para dark mode
  shadowColor: '#000000',
  shadowLight: '#0F172A',
};

export function useThemeColors(): ThemeColors {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
}
