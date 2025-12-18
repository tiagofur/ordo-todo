'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
const DEFAULT_LABELS = {
    title: 'Confirm Delete',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirm: 'Delete',
    cancel: 'Cancel',
    deleting: 'Deleting...',
};
export function ConfirmDelete({ children, onConfirm, title, description, confirmText, cancelText, deletingText, disabled = false, }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            setOpen(false);
        }
        catch (error) {
            console.error('Error deleting:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        if (!loading) {
            setOpen(false);
        }
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, disabled: disabled, children: children }), _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-left", children: title || DEFAULT_LABELS.title }), _jsx(DialogDescription, { className: "text-left", children: description || DEFAULT_LABELS.description })] }), _jsxs(DialogFooter, { className: "gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleCancel, disabled: loading, className: "w-full sm:w-auto", children: cancelText || DEFAULT_LABELS.cancel }), _jsx(Button, { type: "button", variant: "destructive", onClick: handleConfirm, disabled: loading, className: "w-full sm:w-auto", children: loading
                                    ? deletingText || DEFAULT_LABELS.deleting
                                    : confirmText || DEFAULT_LABELS.confirm })] })] })] }));
}
