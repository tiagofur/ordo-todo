/**
 * Accessibility utilities
 */

/**
 * Generate a unique ID for accessibility
 */
let idCounter = 0;
export function generateId(prefix = 'ordo'): string {
    return `${prefix}-${++idCounter}`;
}

/**
 * Common ARIA properties for interactive elements
 */
export interface AriaInteractiveProps {
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
export function getButtonAriaProps(props: {
    disabled?: boolean;
    pressed?: boolean;
    loading?: boolean;
}): AriaInteractiveProps {
    return {
        role: 'button',
        'aria-disabled': props.disabled || props.loading,
        'aria-pressed': props.pressed,
        tabIndex: props.disabled ? -1 : 0,
    };
}

/**
 * Get ARIA props for a dialog
 */
export function getDialogAriaProps(props: {
    titleId?: string;
    descriptionId?: string;
}): AriaInteractiveProps {
    return {
        role: 'dialog',
        'aria-labelledby': props.titleId,
        'aria-describedby': props.descriptionId,
    };
}

/**
 * Get ARIA props for a menu
 */
export function getMenuAriaProps(props: {
    expanded?: boolean;
    triggerId?: string;
}): AriaInteractiveProps {
    return {
        role: 'menu',
        'aria-expanded': props.expanded,
        'aria-labelledby': props.triggerId,
    };
}

/**
 * Get ARIA props for menu trigger
 */
export function getMenuTriggerAriaProps(props: {
    expanded?: boolean;
    menuId?: string;
}): AriaInteractiveProps {
    return {
        'aria-haspopup': 'menu',
        'aria-expanded': props.expanded,
        'aria-controls': props.menuId,
    };
}

/**
 * Screen reader only class (visually hidden)
 */
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Skip to main content link styles
 */
export const skipLink = 'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-gray-900 focus:text-white';

/**
 * Focus trap utilities
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
    );
}

export function trapFocus(container: HTMLElement): () => void {
    const focusableElements = getFocusableElements(container);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable?.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable?.focus();
            }
        }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
}
