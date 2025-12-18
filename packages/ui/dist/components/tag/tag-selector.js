'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { TagBadge } from './tag-badge.js';
/**
 * TagSelector - Platform-agnostic tag selection component
 *
 * This component is designed to work in both web and desktop environments.
 * Data fetching and mutations are handled externally via props.
 *
 * @example
 * // In web app
 * const { data: tags, isLoading } = useTags(workspaceId);
 * const assignTag = useAssignTagToTask();
 *
 * <TagSelector
 *   selectedTags={task.tags}
 *   availableTags={tags ?? []}
 *   isLoading={isLoading}
 *   onTagToggle={(tag, isSelected) => {
 *     if (isSelected) {
 *       removeTag.mutate({ tagId: tag.id, taskId });
 *     } else {
 *       assignTag.mutate({ tagId: tag.id, taskId });
 *     }
 *   }}
 *   labels={{ addTag: t('addTag'), loading: t('loading') }}
 * />
 */
export function TagSelector({ selectedTags = [], availableTags = [], isLoading = false, onTagToggle, onTagRemove, isPending = false, labels = {}, className = '', }) {
    const [open, setOpen] = useState(false);
    const { addTag = 'Add tag', loading = 'Loading...', noTags = 'No tags available', } = labels;
    const isTagSelected = (tagId) => {
        return selectedTags.some((t) => t.id === tagId);
    };
    const handleToggleTag = (tag) => {
        if (!tag.id)
            return;
        const selected = isTagSelected(tag.id);
        onTagToggle(tag, selected);
    };
    const handleRemoveTag = (tag) => {
        if (onTagRemove) {
            onTagRemove(tag);
        }
        else if (tag.id) {
            onTagToggle(tag, true);
        }
    };
    return (_jsxs("div", { className: `flex flex-wrap items-center gap-2 ${className}`, children: [selectedTags.map((tag) => (_jsx(TagBadge, { tag: tag, removable: true, onRemove: () => handleRemoveTag(tag) }, tag.id))), _jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs("button", { className: "inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium hover:bg-accent transition-colors", children: [_jsx(Plus, { className: "h-3 w-3" }), addTag] }) }), _jsx(PopoverContent, { className: "w-64 p-2", align: "start", children: _jsx("div", { className: "space-y-1", children: isLoading ? (_jsx("div", { className: "p-2 text-sm text-muted-foreground", children: loading })) : availableTags.length > 0 ? (availableTags.map((tag) => (_jsxs("button", { onClick: () => handleToggleTag(tag), disabled: isPending, className: "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors", children: [_jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", style: {
                                            backgroundColor: `${tag.color}20`,
                                            color: tag.color,
                                        }, children: tag.name }), isTagSelected(tag.id) && _jsx(Check, { className: "h-4 w-4 text-primary" })] }, tag.id)))) : (_jsx("div", { className: "p-2 text-sm text-muted-foreground", children: noTags })) }) })] })] }));
}
