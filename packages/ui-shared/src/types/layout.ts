import type { ReactNode } from 'react';
import type { StyleableProps } from './button';

/**
 * Card component props
 */
export interface CardProps extends StyleableProps {
    /** Card content */
    children?: ReactNode;
    /** Visual variant */
    variant?: 'default' | 'outlined' | 'elevated' | 'glass';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Clickable card */
    clickable?: boolean;
    /** Click/press handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Selected state */
    selected?: boolean;
}

/**
 * Card header props
 */
export interface CardHeaderProps extends StyleableProps {
    /** Title text */
    title: string;
    /** Subtitle text */
    subtitle?: string;
    /** Icon or avatar on the left */
    leading?: ReactNode;
    /** Action buttons on the right */
    trailing?: ReactNode;
}

/**
 * Card content props
 */
export interface CardContentProps extends StyleableProps {
    children?: ReactNode;
}

/**
 * Card footer props
 */
export interface CardFooterProps extends StyleableProps {
    children?: ReactNode;
    /** Align content */
    align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * Box/Container props
 */
export interface BoxProps extends StyleableProps {
    children?: ReactNode;
    /** Flex direction */
    direction?: 'row' | 'column';
    /** Justify content */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    /** Align items */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Gap between children */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Padding */
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Background color */
    bg?: 'transparent' | 'primary' | 'secondary' | 'muted' | 'card';
    /** Full width */
    fullWidth?: boolean;
    /** Full height */
    fullHeight?: boolean;
    /** Wrap content */
    wrap?: boolean;
}

/**
 * Text component props
 */
export interface TextProps extends StyleableProps {
    children?: ReactNode;
    /** Typography variant */
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label';
    /** Text color */
    color?: 'default' | 'muted' | 'primary' | 'danger' | 'success';
    /** Font weight */
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Truncate with ellipsis */
    truncate?: boolean;
    /** Number of lines before truncating (mobile) */
    numberOfLines?: number;
}

/**
 * Badge props
 */
export interface BadgeProps extends StyleableProps {
    children?: ReactNode;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Pill shaped */
    pill?: boolean;
    /** Dot indicator (no content) */
    dot?: boolean;
}

/**
 * Avatar props
 */
export interface AvatarProps extends StyleableProps {
    /** Image source URL */
    src?: string;
    /** Alt text */
    alt?: string;
    /** Fallback initials */
    fallback?: string;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Shape */
    shape?: 'circle' | 'square';
    /** Online status indicator */
    status?: 'online' | 'offline' | 'busy' | 'away';
}

/**
 * Divider props
 */
export interface DividerProps extends StyleableProps {
    /** Orientation */
    orientation?: 'horizontal' | 'vertical';
    /** With label */
    label?: string;
}

/**
 * Skeleton loader props
 */
export interface SkeletonProps extends StyleableProps {
    /** Width */
    width?: string | number;
    /** Height */
    height?: string | number;
    /** Shape */
    variant?: 'text' | 'circular' | 'rectangular';
    /** Animation */
    animation?: 'pulse' | 'wave' | 'none';
}
