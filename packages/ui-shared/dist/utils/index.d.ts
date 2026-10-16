import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
export { VariantProps, cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';
export { ClassValue, clsx } from 'clsx';

/**
 * Merge class names utility
 * Combines clsx and removes duplicates
 */
declare function cn(...inputs: ClassValue[]): string;
/**
 * Button variants configuration
 */
declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | null | undefined;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ButtonVariants = VariantProps<typeof buttonVariants>;
/**
 * Input variants configuration
 */
declare const inputVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    error?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type InputVariants = VariantProps<typeof inputVariants>;
/**
 * Card variants configuration
 */
declare const cardVariants: (props?: ({
    variant?: "default" | "outlined" | "elevated" | "glass" | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | null | undefined;
    clickable?: boolean | null | undefined;
    selected?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type CardVariants = VariantProps<typeof cardVariants>;
/**
 * Badge variants configuration
 */
declare const badgeVariants: (props?: ({
    variant?: "primary" | "secondary" | "danger" | "success" | "default" | "warning" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    pill?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type BadgeVariants = VariantProps<typeof badgeVariants>;
/**
 * Text variants configuration
 */
declare const textVariants: (props?: ({
    variant?: "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | null | undefined;
    color?: "primary" | "danger" | "success" | "default" | "muted" | null | undefined;
    weight?: "normal" | "medium" | "semibold" | "bold" | null | undefined;
    align?: "left" | "center" | "right" | null | undefined;
    truncate?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TextVariants = VariantProps<typeof textVariants>;

/**
 * Platform detection utilities
 */
/**
 * Check if running in browser
 */
declare const isBrowser: boolean;
/**
 * Check if running in React Native
 */
declare const isReactNative: boolean;
/**
 * Check if running on iOS (either web or native)
 */
declare const isIOS: boolean;
/**
 * Check if running on Android (either web or native)
 */
declare const isAndroid: boolean;
/**
 * Check if running on mobile device
 */
declare const isMobile: boolean;
/**
 * Check if running in Electron
 */
declare const isElectron: boolean;
/**
 * Check if touch device
 */
declare const isTouchDevice: boolean;
/**
 * Get current platform
 */
type Platform = 'web' | 'mobile-web' | 'ios' | 'android' | 'electron';
declare function getPlatform(): Platform;
/**
 * Check if we should use web components
 */
declare function useWebComponents(): boolean;
/**
 * Check if we should use native components
 */
declare function useNativeComponents(): boolean;

/**
 * Accessibility utilities
 */
declare function generateId(prefix?: string): string;
/**
 * Common ARIA properties for interactive elements
 */
interface AriaInteractiveProps {
    role?: string;
    'aria-disabled'?: boolean;
    'aria-pressed'?: boolean;
    'aria-expanded'?: boolean;
    'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-controls'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    tabIndex?: number;
}
/**
 * Get ARIA props for a button
 */
declare function getButtonAriaProps(props: {
    disabled?: boolean;
    pressed?: boolean;
    loading?: boolean;
}): AriaInteractiveProps;
/**
 * Get ARIA props for a dialog
 */
declare function getDialogAriaProps(props: {
    titleId?: string;
    descriptionId?: string;
}): AriaInteractiveProps;
/**
 * Get ARIA props for a menu
 */
declare function getMenuAriaProps(props: {
    expanded?: boolean;
    triggerId?: string;
}): AriaInteractiveProps;
/**
 * Get ARIA props for menu trigger
 */
declare function getMenuTriggerAriaProps(props: {
    expanded?: boolean;
    menuId?: string;
}): AriaInteractiveProps;
/**
 * Screen reader only class (visually hidden)
 */
declare const srOnly = "sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";
/**
 * Skip to main content link styles
 */
declare const skipLink = "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-gray-900 focus:text-white";
/**
 * Focus trap utilities
 */
declare function getFocusableElements(container: HTMLElement): HTMLElement[];
declare function trapFocus(container: HTMLElement): () => void;

export { type AriaInteractiveProps, type BadgeVariants, type ButtonVariants, type CardVariants, type InputVariants, type Platform, type TextVariants, badgeVariants, buttonVariants, cardVariants, cn, generateId, getButtonAriaProps, getDialogAriaProps, getFocusableElements, getMenuAriaProps, getMenuTriggerAriaProps, getPlatform, inputVariants, isAndroid, isBrowser, isElectron, isIOS, isMobile, isReactNative, isTouchDevice, skipLink, srOnly, textVariants, trapFocus, useNativeComponents, useWebComponents };
