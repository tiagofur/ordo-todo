'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Button } from '../ui/button.js';
import { Building2, Home, Users } from 'lucide-react';
import { createWorkspaceSchema, generateSlug } from '@ordo-todo/core';
const DEFAULT_LABELS = {
    title: 'Create Workspace',
    description: 'Create a new workspace to organize your projects and tasks.',
    form: {
        type: 'Workspace Type',
        name: 'Name',
        namePlaceholder: 'Enter workspace name',
        description: 'Description',
        descriptionPlaceholder: 'Optional description...',
    },
    types: {
        personal: 'Personal',
        personalDesc: 'For personal projects',
        work: 'Work',
        workDesc: 'For professional work',
        team: 'Team',
        teamDesc: 'For team collaboration',
    },
    buttons: {
        cancel: 'Cancel',
        create: 'Create Workspace',
        creating: 'Creating...',
    },
    validation: {
        nameRequired: 'Name is required',
    },
};
export function CreateWorkspaceDialog({ open, onOpenChange, onSubmit, isPending = false, labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        form: { ...DEFAULT_LABELS.form, ...labels.form },
        types: { ...DEFAULT_LABELS.types, ...labels.types },
        buttons: { ...DEFAULT_LABELS.buttons, ...labels.buttons },
        validation: { ...DEFAULT_LABELS.validation, ...labels.validation },
    };
    const [selectedType, setSelectedType] = useState('PERSONAL');
    const formSchema = createWorkspaceSchema.extend({
        name: z.string().min(1, t.validation.nameRequired),
    });
    const { register, handleSubmit, reset, setValue, formState: { errors }, } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'PERSONAL',
        },
    });
    const handleFormSubmit = async (data) => {
        try {
            const slug = generateSlug(data.name);
            await onSubmit({
                ...data,
                slug,
                type: selectedType,
            });
            reset();
        }
        catch (error) {
            console.error(error);
        }
    };
    const workspaceTypes = [
        {
            value: 'PERSONAL',
            label: t.types.personal,
            description: t.types.personalDesc,
            icon: Home,
            color: '#06b6d4',
            bgColor: 'bg-cyan-500/10',
            textColor: 'text-cyan-500',
            borderColor: 'border-cyan-500',
        },
        {
            value: 'WORK',
            label: t.types.work,
            description: t.types.workDesc,
            icon: Building2,
            color: '#a855f7',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-500',
            borderColor: 'border-purple-500',
        },
        {
            value: 'TEAM',
            label: t.types.team,
            description: t.types.teamDesc,
            icon: Users,
            color: '#ec4899',
            bgColor: 'bg-pink-500/10',
            textColor: 'text-pink-500',
            borderColor: 'border-pink-500',
        },
    ];
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-foreground", children: t.title }), _jsx(DialogDescription, { className: "text-muted-foreground", children: t.description })] }), _jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.form.type }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: workspaceTypes.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = selectedType === type.value;
                                            return (_jsxs("button", { type: "button", onClick: () => {
                                                    setSelectedType(type.value);
                                                    setValue('type', type.value);
                                                }, className: `flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${isSelected
                                                    ? `${type.borderColor} ${type.bgColor} shadow-lg`
                                                    : 'border-border hover:bg-accent'}`, children: [_jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${isSelected ? type.bgColor : 'bg-muted'}`, style: isSelected ? { backgroundColor: `${type.color}20` } : {}, children: _jsx(Icon, { className: `w-6 h-6 transition-all duration-200 ${isSelected ? type.textColor : 'text-muted-foreground'}`, style: isSelected ? { color: type.color } : {} }) }), _jsxs("div", { className: "text-center space-y-1", children: [_jsx("p", { className: `text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`, children: type.label }), _jsx("p", { className: "text-[10px] text-muted-foreground leading-tight px-1", children: type.description })] })] }, type.value));
                                        }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-sm font-medium text-foreground", children: t.form.name }), _jsx(Input, { id: "name", ...register('name'), placeholder: t.form.namePlaceholder }), errors.name && (_jsx("p", { className: "text-sm text-destructive", children: errors.name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-foreground", children: t.form.description }), _jsx(Textarea, { id: "description", ...register('description'), placeholder: t.form.descriptionPlaceholder, className: "min-h-[100px] resize-none" })] }), _jsxs(DialogFooter, { className: "pt-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: t.buttons.cancel }), _jsx(Button, { type: "submit", disabled: isPending, children: isPending ? t.buttons.creating : t.buttons.create })] })] })] }) }) }));
}
