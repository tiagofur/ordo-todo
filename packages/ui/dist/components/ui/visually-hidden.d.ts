/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */
import { ReactNode } from 'react';
interface VisuallyHiddenProps {
    children: ReactNode;
    /** When true, content becomes visible on focus (for skip links) */
    focusable?: boolean;
    /** Additional class names */
    className?: string;
    /** HTML element to render */
    as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
export declare function VisuallyHidden({ children, focusable, className, as: Component, }: VisuallyHiddenProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=visually-hidden.d.ts.map