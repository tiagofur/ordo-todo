'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskSchema } from '@ordo-todo/core';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Button } from '../ui/button.js';
import { EmptyState } from '../ui/empty-state.js';
import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag, Clock } from 'lucide-react';
import { RecurrenceSelector } from './recurrence-selector.js';
const DEFAULT_LABELS = {
    title: 'Create Task',
    description: 'Add a new task to your project.',
    aiMagic: 'AI Magic',
    aiGenerating: 'Generating...',
    formTitle: 'Title',
    formTitlePlaceholder: 'What needs to be done?',
    formProject: 'Project',
    formSelectProject: 'Select a project',
    formDescription: 'Description',
    formDescriptionPlaceholder: 'Add details...',
    formPriority: 'Priority',
    formEstimatedMinutes: 'Est. Minutes',
    formDueDate: 'Due Date',
    priorities: { low: 'Low', medium: 'Medium', high: 'High' },
    buttons: { cancel: 'Cancel', create: 'Create Task', creating: 'Creating...' },
    emptyState: {
        title: 'No Projects Found',
        description: 'You need a project to create tasks.',
        action: 'Create Project',
    },
    validation: { titleRequired: 'Title is required', projectRequired: 'Project is required' },
};
export function CreateTaskDialog({ open, onOpenChange, projectId, projects = [], isLoadingProjects = false, onRequestCreateProject, onSubmit, onGenerateAIDescription, isPending = false, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const [isGenerating, setIsGenerating] = useState(false);
    // Schema extension for form validation
    const formSchema = createTaskSchema.extend({
        title: z.string().min(1, t.validation.titleRequired),
        projectId: z.string().min(1, t.validation.projectRequired),
        recurrence: z.object({
            pattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
            interval: z.number().optional(),
            daysOfWeek: z.array(z.number()).optional(),
            dayOfMonth: z.number().optional(),
            endDate: z.date().optional(),
        }).optional(),
    });
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            priority: 'MEDIUM',
            projectId: projectId || '',
            recurrence: undefined,
        },
    });
    const currentPriority = watch('priority');
    const handleFormSubmit = async (data) => {
        // Adapter for form data to output data
        const outputData = {
            title: data.title,
            description: data.description || undefined,
            projectId: data.projectId,
            priority: data.priority,
            estimatedMinutes: data.estimatedMinutes || undefined,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            recurrence: data.recurrence,
        };
        try {
            await onSubmit(outputData);
            reset();
            onOpenChange(false);
        }
        catch (error) {
            console.error(error);
        }
    };
    const handleAIMagic = async () => {
        const title = watch('title');
        if (!title || !onGenerateAIDescription)
            return;
        setIsGenerating(true);
        try {
            const description = await onGenerateAIDescription(title);
            setValue('description', description);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const priorities = [
        { value: 'LOW', label: t.priorities.low, bg: 'bg-blue-500', border: 'border-blue-500' },
        { value: 'MEDIUM', label: t.priorities.medium, bg: 'bg-yellow-500', border: 'border-yellow-500' },
        { value: 'HIGH', label: t.priorities.high, bg: 'bg-red-500', border: 'border-red-500' },
    ];
    const showEmptyState = !projectId && !isLoadingProjects && projects.length === 0;
    if (showEmptyState) {
        return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border", children: _jsx("div", { className: "p-6", children: _jsx(EmptyState, { icon: Briefcase, title: t.emptyState.title, description: t.emptyState.description, actionLabel: t.emptyState.action, onAction: () => {
                            onOpenChange(false);
                            onRequestCreateProject?.();
                        } }) }) }) }));
    }
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-foreground", children: t.title }), onGenerateAIDescription && (_jsxs("button", { type: "button", onClick: handleAIMagic, disabled: isGenerating, className: "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50", children: [_jsx(Sparkles, { className: `w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'animate-pulse'}` }), isGenerating ? t.aiGenerating : t.aiMagic] }))] }), _jsx(DialogDescription, { className: "text-muted-foreground", children: t.description })] }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            handleSubmit(handleFormSubmit)(e);
                        }, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", className: "text-sm font-medium text-foreground", children: t.formTitle }), _jsx(Input, { id: "title", ...register('title'), placeholder: t.formTitlePlaceholder, autoFocus: true }), errors.title && _jsx("p", { className: "text-sm text-destructive", children: errors.title.message })] }), !projectId && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "projectId", className: "text-sm font-medium text-foreground", children: t.formProject }), _jsxs("select", { id: "projectId", ...register('projectId'), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", children: [_jsx("option", { value: "", children: t.formSelectProject }), projects.map((project) => (_jsx("option", { value: project.id, children: project.name }, project.id)))] }), errors.projectId && (_jsx("p", { className: "text-sm text-red-500", children: errors.projectId.message }))] })), projectId && _jsx("input", { type: "hidden", ...register('projectId') }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-foreground", children: t.formDescription }), _jsx(Textarea, { id: "description", ...register('description'), className: "min-h-[100px] resize-none", placeholder: t.formDescriptionPlaceholder })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.formPriority }), _jsx("div", { className: "flex gap-2", children: priorities.map((p) => {
                                            const isSelected = currentPriority === p.value;
                                            return (_jsxs("button", { type: "button", onClick: () => setValue('priority', p.value), className: `flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors duration-200 ${isSelected
                                                    ? `${p.bg} text-white shadow-md shadow-black/10 scale-105`
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`, children: [isSelected && _jsx(Flag, { className: "w-3 h-3 fill-current" }), p.label] }, p.value));
                                        }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "estimatedMinutes", className: "text-sm font-medium text-foreground", children: t.formEstimatedMinutes }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "number", id: "estimatedMinutes", ...register('estimatedMinutes', { valueAsNumber: true }), min: 1, placeholder: "30", className: "pr-10" }), _jsx(Clock, { className: "absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dueDate", className: "text-sm font-medium text-foreground", children: t.formDueDate }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "date", id: "dueDate", ...register('dueDate'), autoComplete: "off", className: "pr-10", onKeyDown: (e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }
                                                        } }), _jsx(CalendarIcon, { className: "absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" })] })] })] }), _jsx(RecurrenceSelector, { value: watch('recurrence'), onChange: (val) => setValue('recurrence', val) }), _jsxs(DialogFooter, { className: "pt-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: t.buttons.cancel }), _jsx(Button, { type: "submit", disabled: isPending, children: isPending ? t.buttons.creating : t.buttons.create })] })] })] }) }) }));
}
