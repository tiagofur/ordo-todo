import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
const DEFAULT_LABELS = {
    title: 'Confirm Delete',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirm: 'Delete',
    cancel: 'Cancel',
    deleting: 'Deleting...',
};
export function ConfirmDelete({ children, onConfirm, onCancel, open, onOpenChange, isLoading = false, title, description, confirmText, cancelText, deletingText, disabled = false, }) {
    return (_jsxs(Dialog, { open: open, onOpenChange: onOpenChange, children: [children ? (_jsx(DialogTrigger, { asChild: true, disabled: disabled, children: children })) : null, _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-left", children: title || DEFAULT_LABELS.title }), _jsx(DialogDescription, { className: "text-left", children: description || DEFAULT_LABELS.description })] }), _jsxs(DialogFooter, { className: "gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                    if (onCancel)
                                        onCancel();
                                    if (onOpenChange)
                                        onOpenChange(false);
                                }, disabled: isLoading, className: "w-full sm:w-auto", children: cancelText || DEFAULT_LABELS.cancel }), _jsx(Button, { type: "button", variant: "destructive", onClick: () => onConfirm(), disabled: isLoading, className: "w-full sm:w-auto", children: isLoading
                                    ? deletingText || DEFAULT_LABELS.deleting
                                    : confirmText || DEFAULT_LABELS.confirm })] })] })] }));
}
