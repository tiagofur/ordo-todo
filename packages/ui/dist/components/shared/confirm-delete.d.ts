import { type ReactNode } from 'react';
export interface ConfirmDeleteProps {
    children?: ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    isLoading?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    deletingText?: string;
    disabled?: boolean;
}
export declare function ConfirmDelete({ children, onConfirm, onCancel, open, onOpenChange, isLoading, title, description, confirmText, cancelText, deletingText, disabled, }: ConfirmDeleteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=confirm-delete.d.ts.map