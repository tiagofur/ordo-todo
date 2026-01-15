import type { ReactNode } from 'react';
import type { StyleableProps } from './button';

/**
 * Dialog/Modal props
 */
export interface DialogProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onOpenChange?: (open: boolean) => void;
    /** Dialog title */
    title?: string;
    /** Dialog description */
    description?: string;
    /** Dialog content */
    children?: ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Close on overlay click */
    closeOnOverlayClick?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Show close button */
    showCloseButton?: boolean;
}

/**
 * Sheet/Drawer props
 */
export interface SheetProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onOpenChange?: (open: boolean) => void;
    /** Sheet title */
    title?: string;
    /** Sheet content */
    children?: ReactNode;
    /** Side to appear from */
    side?: 'left' | 'right' | 'top' | 'bottom';
    /** Size */
    size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Bottom sheet props (mobile)
 */
export interface BottomSheetProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onClose?: () => void;
    /** Sheet content */
    children?: ReactNode;
    /** Snap points (percentages) */
    snapPoints?: number[];
    /** Enable background interaction */
    enableBackgroundInteraction?: boolean;
    /** Handle indicator visible */
    showHandle?: boolean;
}

/**
 * Menu/Dropdown props
 */
export interface MenuProps extends StyleableProps {
    /** Trigger element */
    trigger: ReactNode;
    /** Menu items */
    children?: ReactNode;
    /** Alignment */
    align?: 'start' | 'center' | 'end';
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Offset from trigger */
    offset?: number;
}

/**
 * Menu item props
 */
export interface MenuItemProps extends StyleableProps {
    /** Item content */
    children?: ReactNode;
    /** Click/press handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Icon */
    icon?: ReactNode;
    /** Keyboard shortcut (web) */
    shortcut?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Destructive action */
    destructive?: boolean;
}

/**
 * Tooltip props
 */
export interface TooltipProps extends StyleableProps {
    /** Trigger element */
    children: ReactNode;
    /** Tooltip content */
    content: ReactNode;
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Delay before showing (ms) */
    delayDuration?: number;
}

/**
 * Popover props
 */
export interface PopoverProps extends StyleableProps {
    /** Trigger element */
    trigger: ReactNode;
    /** Popover content */
    children?: ReactNode;
    /** Alignment */
    align?: 'start' | 'center' | 'end';
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Open state (controlled) */
    open?: boolean;
    /** Open change handler */
    onOpenChange?: (open: boolean) => void;
}

/**
 * Tabs props
 */
export interface TabsProps extends StyleableProps {
    /** Current tab value */
    value?: string;
    /** Default tab value */
    defaultValue?: string;
    /** Tab change handler */
    onValueChange?: (value: string) => void;
    /** Tab items */
    children?: ReactNode;
    /** Orientation */
    orientation?: 'horizontal' | 'vertical';
}

export interface TabProps extends StyleableProps {
    /** Tab value */
    value: string;
    /** Tab label */
    children?: ReactNode;
    /** Disabled state */
    disabled?: boolean;
    /** Icon */
    icon?: ReactNode;
}

/**
 * Progress bar props
 */
export interface ProgressProps extends StyleableProps {
    /** Progress value (0-100) */
    value: number;
    /** Maximum value */
    max?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Color variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    /** Show percentage label */
    showLabel?: boolean;
    /** Indeterminate (loading) */
    indeterminate?: boolean;
}

/**
 * Toast/Notification props
 */
export interface ToastProps extends StyleableProps {
    /** Toast title */
    title?: string;
    /** Toast description */
    description?: string;
    /** Visual variant */
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    /** Action button */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Duration (ms), 0 for persistent */
    duration?: number;
    /** Close handler */
    onClose?: () => void;
}
