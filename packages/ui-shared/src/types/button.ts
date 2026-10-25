import type { ReactNode, CSSProperties } from 'react';

/**
 * Base props for all interactive components
 * Supports both web (onClick) and mobile (onPress) patterns
 */
export interface InteractiveProps {
    /** Disables the component */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Web: onClick handler */
    onClick?: () => void;
    /** Mobile: onPress handler */
    onPress?: () => void;
}

/**
 * Base props for styleable components
 */
export interface StyleableProps {
    /** Web: Tailwind classes */
    className?: string;
    /** Mobile: React Native styles */
    style?: CSSProperties | object;
    /** Test ID for e2e testing */
    testID?: string;
}

/**
 * Button component props
 * Used by @ordo-todo/ui
 */
export interface ButtonProps extends InteractiveProps, StyleableProps {
    /** Button text (alternative to children) */
    title?: string;
    /** Button content */
    children?: ReactNode;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Full width button */
    fullWidth?: boolean;
    /** Icon to show before text */
    iconLeft?: ReactNode;
    /** Icon to show after text */
    iconRight?: ReactNode;
    /** Button type (web only) */
    type?: 'button' | 'submit' | 'reset';
}

/**
 * IconButton component props
 */
export interface IconButtonProps extends InteractiveProps, StyleableProps {
    /** Icon component or element */
    icon: ReactNode;
    /** Accessible label */
    'aria-label': string;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Rounded corners */
    rounded?: boolean;
}
