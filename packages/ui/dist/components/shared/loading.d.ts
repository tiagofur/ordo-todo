import { type ReactNode } from 'react';
interface LoadingOverlayProps {
    /** Custom logo/brand component */
    renderLogo?: () => ReactNode;
    /** Loading text */
    text?: string;
    /** Whether to show the overlay */
    isVisible?: boolean;
}
export declare function LoadingOverlay({ renderLogo, text, isVisible, }: LoadingOverlayProps): import("react/jsx-runtime").JSX.Element | null;
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}
export declare function LoadingSpinner({ size, text, className, }: LoadingSpinnerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=loading.d.ts.map