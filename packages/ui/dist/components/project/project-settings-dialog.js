'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Button } from '../ui/button.js';
import { Palette, Check } from 'lucide-react';
import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';
/**
 * ProjectSettingsDialog - Platform-agnostic project settings edit dialog
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: project } = useProject(projectId);
 * const updateProject = useUpdateProject();
 *
 * <ProjectSettingsDialog
 *   project={project}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   isPending={updateProject.isPending}
 *   onSubmit={(data) => updateProject.mutate({ projectId, data })}
 *   labels={{ title: t('title') }}
 * />
 */
export function ProjectSettingsDialog({ project, open, onOpenChange, isPending = false, onSubmit, labels = {}, }) {
    const { title = 'Project Settings', description = 'Update project name, description and color', colorLabel = 'Color', nameLabel = 'Name', namePlaceholder = 'Project name', nameRequired = 'Name is required', descriptionLabel = 'Description', descriptionPlaceholder = 'Project description (optional)', cancel = 'Cancel', save = 'Save', saving = 'Saving...', } = labels;
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[3]);
    const formSchema = updateProjectSchema.extend({
        name: z.string().min(1, nameRequired),
    });
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(formSchema),
    });
    // Update form when project data loads
    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description || '',
                color: project.color || undefined,
            });
            setSelectedColor((project.color || PROJECT_COLORS[3]));
        }
    }, [project, reset]);
    const handleFormSubmit = (data) => {
        onSubmit?.({
            ...data,
            color: selectedColor,
        });
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-foreground", children: title }), _jsx(DialogDescription, { className: "text-muted-foreground", children: description })] }), _jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { className: "text-sm font-medium text-foreground flex items-center gap-2", children: [_jsx(Palette, { className: "w-4 h-4" }), " ", colorLabel] }), _jsx("div", { className: "flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20", children: PROJECT_COLORS.map((color) => (_jsx("button", { type: "button", onClick: () => setSelectedColor(color), className: `relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedColor === color
                                                ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                                                : 'hover:opacity-80'}`, style: { backgroundColor: color }, children: selectedColor === color && (_jsx(Check, { className: "w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" })) }, color))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-sm font-medium text-foreground", children: nameLabel }), _jsx(Input, { id: "name", ...register('name'), placeholder: namePlaceholder }), errors.name && _jsx("p", { className: "text-sm text-destructive", children: errors.name.message })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-foreground", children: descriptionLabel }), _jsx(Textarea, { id: "description", ...register('description'), placeholder: descriptionPlaceholder, className: "min-h-[100px] resize-none" })] }), _jsxs(DialogFooter, { className: "pt-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: cancel }), _jsx(Button, { type: "submit", disabled: isPending, children: isPending ? saving : save })] })] })] }) }) }));
}
