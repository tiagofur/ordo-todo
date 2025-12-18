'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { Input } from '../ui/input.js';
import { Textarea } from '../ui/textarea.js';
import { Button } from '../ui/button.js';
import { EmptyState } from '../ui/empty-state.js';
import { ScrollArea } from '../ui/scroll-area.js';
import { Briefcase, Check, Palette, LayoutTemplate } from 'lucide-react';
import { PROJECT_COLORS, createProjectSchema } from '@ordo-todo/core';
/**
 * CreateProjectDialog - Platform-agnostic project creation dialog
 *
 * Handles project creation with optional templates.
 * Data fetching and mutations are handled externally via props.
 */
export function CreateProjectDialog({ open, onOpenChange, workspaceId, workspaces = [], isLoadingWorkspaces = false, workflows = [], templates = [], isPending = false, onSubmit, onCreateWorkflow, labels = {}, }) {
    const { title = 'Create Project', description = 'Create a new project to start tracking your tasks.', descriptionPlaceholder = 'Project description (optional)', nameRequired = 'Project name is required', workspaceRequired = 'Workspace is required', createWorkspace = 'Please create a workspace first', emptyTitle = 'No Workspaces Found', emptyDescription = 'You need a workspace to create projects.', emptyAction = 'Create Workspace', templatesTitle = 'Start with a Template', tasksCount = (count) => `${count} Tasks`, hideTemplates = 'Hide Templates', useTemplate = 'Use Template', colorLabel = 'Color', nameLabel = 'Name', namePlaceholder = 'Project Name', workspaceLabel = 'Workspace', descriptionLabel = 'Description', cancel = 'Cancel', create = 'Create Project', creating = 'Creating...', } = labels;
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[3]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    // Schema with validation messages
    const formSchema = createProjectSchema.extend({
        name: z.string().min(1, nameRequired),
        workspaceId: z.string().min(1, workspaceRequired),
    });
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            workspaceId: workspaceId || '',
            color: PROJECT_COLORS[3],
            workflowId: '',
        },
    });
    const selectedWorkspaceId = watch('workspaceId');
    // Update default workflow when workflows change
    useEffect(() => {
        // If workflows are provided, try to select the first one or logic handled by parent
        // Here we mainly rely on the parent or the onSubmit handler to deal with "NEW" workflow logic if needed
        if (workflows && workflows.length > 0) {
            const firstWorkflow = workflows[0];
            if (firstWorkflow?.id) {
                setValue('workflowId', String(firstWorkflow.id));
            }
        }
        else {
            // Logic for "NEW" workflow should ideally be handled in onSubmit wrapper in parent
            setValue('workflowId', 'NEW');
        }
    }, [workflows, setValue]);
    // Set default workspace if none selected
    useEffect(() => {
        if (!workspaceId && workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
            if (workspaces[0]?.id)
                setValue('workspaceId', String(workspaces[0].id));
        }
    }, [workspaces, workspaceId, selectedWorkspaceId, setValue]);
    // Sync workspaceId prop to form value
    useEffect(() => {
        if (workspaceId) {
            setValue('workspaceId', workspaceId);
        }
    }, [workspaceId, setValue]);
    const handleTemplateSelect = (template) => {
        setValue('name', template.name);
        setValue('description', template.description);
        setSelectedColor(template.color);
        setSelectedTemplate(template);
        setShowTemplates(false);
    };
    const handleFormSubmit = async (data) => {
        // Logic for creating workflow if needed should be handled by logic passed in `onSubmit` 
        // or by expanding the `onSubmit` to separate async steps. 
        // For simplicity/agnosticism, we pass the data up. 
        // The parent component is responsible for:
        // 1. Checking if workflowId is valid or needs creation
        // 2. Calling createProject
        // 3. Creating tasks from template if provided
        onSubmit({ ...data, color: selectedColor }, selectedTemplate?.tasks);
        // We don't reset here immediately, usually parent handles success/close
    };
    const showEmptyState = !workspaceId && !isLoadingWorkspaces && workspaces.length === 0;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-background border-border", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-foreground", children: title }), _jsxs("button", { type: "button", onClick: () => setShowTemplates(!showTemplates), className: "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200", children: [_jsx(LayoutTemplate, { className: "w-3.5 h-3.5" }), showTemplates ? hideTemplates : useTemplate] })] }), _jsx(DialogDescription, { className: "text-muted-foreground", children: description })] }), showEmptyState ? (_jsx(EmptyState, { icon: Briefcase, title: emptyTitle, description: emptyDescription, actionLabel: emptyAction, onAction: () => {
                            onOpenChange(false);
                        } })) : (_jsxs(_Fragment, { children: [showTemplates && templates.length > 0 && (_jsxs("div", { className: "bg-muted/30 rounded-lg border border-border p-4 mb-4", children: [_jsx("h4", { className: "text-sm font-medium mb-3", children: templatesTitle }), _jsx(ScrollArea, { className: "h-[200px] pr-4", children: _jsx("div", { className: "grid grid-cols-2 gap-3", children: templates.map((template) => (_jsxs("button", { onClick: () => handleTemplateSelect(template), className: "flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group", children: [_jsxs("div", { className: "flex items-center gap-2 w-full", children: [_jsx("div", { className: "w-8 h-8 rounded-md flex items-center justify-center shrink-0", style: {
                                                                    backgroundColor: `${template.color}20`,
                                                                    color: template.color,
                                                                }, children: _jsx(template.icon, { className: "w-4 h-4" }) }), _jsx("span", { className: "font-medium text-sm truncate", children: template.name })] }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: template.description }), _jsx("div", { className: "text-xs text-primary/70 font-medium", children: tasksCount(template.tasks.length) })] }, template.id))) }) })] })), _jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { className: "text-sm font-medium text-foreground flex items-center gap-2", children: [_jsx(Palette, { className: "w-4 h-4" }), " ", colorLabel] }), _jsx("div", { className: "flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20", children: PROJECT_COLORS.map((color) => (_jsx("button", { type: "button", onClick: () => setSelectedColor(color), className: `relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedColor === color
                                                        ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                                                        : 'hover:opacity-80'}`, style: { backgroundColor: color }, children: selectedColor === color && (_jsx(Check, { className: "w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" })) }, color))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-sm font-medium text-foreground", children: nameLabel }), _jsx(Input, { id: "name", ...register('name'), placeholder: namePlaceholder }), errors.name && (_jsx("p", { className: "text-sm text-destructive", children: errors.name.message }))] }), !workspaceId && workspaces.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "workspaceId", className: "text-sm font-medium text-foreground", children: workspaceLabel }), _jsx("select", { id: "workspaceId", ...register('workspaceId'), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", children: workspaces.map((ws) => (_jsx("option", { value: ws.id, children: ws.name }, ws.id))) }), errors.workspaceId && (_jsx("p", { className: "text-sm text-destructive", children: errors.workspaceId.message }))] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-foreground", children: descriptionLabel }), _jsx(Textarea, { id: "description", ...register('description'), placeholder: descriptionPlaceholder, className: "min-h-[100px] resize-none" })] }), workspaceId && _jsx("input", { type: "hidden", ...register('workspaceId') }), _jsxs(DialogFooter, { className: "pt-2", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: cancel }), _jsx(Button, { type: "submit", disabled: isPending, children: isPending ? creating : create })] })] })] }))] }) }) }));
}
