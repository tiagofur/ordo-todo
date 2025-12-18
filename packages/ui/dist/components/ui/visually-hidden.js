import { jsx as _jsx } from "react/jsx-runtime";
/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */
import { cn } from '../../utils/index.js';
export function VisuallyHidden({ children, focusable = false, className, as: Component = 'span', }) {
    return (_jsx(Component, { className: cn('sr-only', focusable && 'focus:not-sr-only', className), children: children }));
}
