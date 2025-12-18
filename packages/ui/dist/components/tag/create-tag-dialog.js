'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TAG_COLORS } from '@ordo-todo/core';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { Input } from '../ui/input.js';
import { Button } from '../ui/button.js';
/**
 * CreateTagDialog - Platform-agnostic tag creation/edit dialog
 *
 * Uses @ordo-todo/core for TAG_COLORS constant.
 * Form submission and API calls are handled externally via onSubmit.
 *
 * @example
 * const createTag = useCreateTag();
 *
 * <CreateTagDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   workspaceId={workspaceId}
 *   onSubmit={(data, isEdit) => {
 *     if (isEdit) {
 *       updateTag.mutate({ tagId, data });
 *     } else {
 *       createTag.mutate(data);
 *     }
 *   }}
 *   isPending={createTag.isPending}
 *   labels={{ titleCreate: t('title.create'), ... }}
 * />
 */
export function CreateTagDialog({ open, onOpenChange, workspaceId, tagToEdit, onSubmit, isPending = false, labels = {}, }) {
    const [name, setName] = useState(tagToEdit?.name || '');
    const [selectedColor, setSelectedColor] = useState(tagToEdit?.color || TAG_COLORS[0]);
    const [error, setError] = useState('');
    const { titleCreate = 'Create Tag', titleEdit = 'Edit Tag', descriptionCreate = 'Create a new tag to organize your tasks.', descriptionEdit = 'Modify tag name or color.', colorLabel = 'Color', nameLabel = 'Name', namePlaceholder = 'Tag name', nameRequired = 'Name is required', previewLabel = 'Preview', previewDefault = 'Tag name', cancel = 'Cancel', save = 'Save', saving = 'Saving...', create = 'Create', creating = 'Creating...', } = labels;
    // Reset form when dialog opens/closes or tagToEdit changes
    useEffect(() => {
        if (open) {
            setName(tagToEdit?.name || '');
            setSelectedColor(tagToEdit?.color || TAG_COLORS[0]);
            setError('');
        }
    }, [open, tagToEdit]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(nameRequired);
            return;
        }
        const data = {
            name: name.trim(),
            color: selectedColor,
            workspaceId: workspaceId || tagToEdit?.workspaceId,
        };
        onSubmit(data, !!tagToEdit);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[450px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: tagToEdit ? titleEdit : titleCreate }), _jsx(DialogDescription, { children: tagToEdit ? descriptionEdit : descriptionCreate })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: colorLabel }), _jsx("div", { className: "flex flex-wrap gap-2", children: TAG_COLORS.map((color) => (_jsx("button", { type: "button", onClick: () => setSelectedColor(color), className: `h-10 w-10 rounded-lg transition-all ${selectedColor === color
                                            ? 'scale-110 ring-2 ring-offset-2 ring-primary'
                                            : 'hover:scale-105'}`, style: { backgroundColor: color }, "aria-label": `Select color ${color}` }, color))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "tag-name", children: nameLabel }), _jsx(Input, { id: "tag-name", value: name, onChange: (e) => {
                                        setName(e.target.value);
                                        setError('');
                                    }, placeholder: namePlaceholder, autoFocus: true }), error && (_jsx("p", { className: "text-sm text-destructive", children: error }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: previewLabel }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", style: {
                                            backgroundColor: `${selectedColor}20`,
                                            color: selectedColor,
                                        }, children: name || previewDefault }) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: cancel }), _jsx(Button, { type: "submit", disabled: isPending, children: tagToEdit
                                        ? (isPending ? saving : save)
                                        : (isPending ? creating : create) })] })] })] }) }));
}
