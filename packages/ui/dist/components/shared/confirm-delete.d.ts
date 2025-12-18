import { type ReactNode } from 'react';
interface ConfirmDeleteProps {
    children: ReactNode;
    onConfirm: () => void | Promise<void>;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    deletingText?: string;
    disabled?: boolean;
}
export declare function ConfirmDelete({ children, onConfirm, title, description, confirmText, cancelText, deletingText, disabled, }: ConfirmDeleteProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=confirm-delete.d.ts.map