'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Flag, Clock, CheckSquare, MessageSquare, Paperclip, Activity, Layout, Share2, Copy, Link as LinkIcon, Tag as TagIcon, Plus } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Sheet, SheetContent, SheetTitle, } from '../ui/sheet.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Textarea } from '../ui/textarea.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select.js';
import { Badge } from '../ui/badge.js';
import { Separator } from '../ui/separator.js';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { Skeleton } from '../ui/skeleton.js';
const DEFAULT_LABELS = {
    title: 'Task Details',
    titlePlaceholder: 'Task Title',
    descriptionLabel: 'DESCRIPTION',
    descriptionPlaceholder: 'Add a description...',
    descriptionEmpty: 'No description provided.',
    statusTodo: 'To Do',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    priorityUrgent: 'Urgent',
    dueDate: 'Due Date',
    estimation: 'Estimated Time (min)',
    detailsTitle: 'Details',
    tabsSubtasks: 'Subtasks',
    tabsComments: 'Comments',
    tabsAttachments: 'Attachments',
    tabsActivity: 'Activity',
    tagsNone: 'No tags',
    tagsAdd: 'Add Tag',
    tagsAvailable: 'Available Tags',
    tagsNoAvailable: 'No tags available',
    tagsCreate: 'Create New Tag',
    btnSave: 'Save',
    btnDelete: 'Delete Task',
    footerCreated: 'Created on',
    confirmDelete: 'Are you sure you want to delete this task?',
    toastUpdated: 'Task updated successfully',
    toastDeleted: 'Task deleted successfully',
    toastTagAssigned: (name) => `Tag ${name} assigned`,
    shareTitle: 'Share Task',
    shareDescription: 'Share this link with others to view this task.',
};
export function TaskDetailPanel({ taskId, open, onOpenChange, task, isLoading = false, availableTags = [], onUpdate, onDelete, onAssignTag, onRemoveTag, onShare, renderSubtaskList, renderComments, renderAttachments, renderActivity, renderAssigneeSelector, renderCreateTagDialog, labels = {}, }) {
    // Merge labels
    const t = { ...DEFAULT_LABELS, ...labels };
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('subtasks');
    const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedTime: '',
    });
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'TODO',
                priority: task.priority || 'MEDIUM',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] ?? '' : '',
                estimatedTime: task.estimatedTime?.toString() || '',
            });
        }
    }, [task]);
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleSave = async () => {
        if (!taskId || !onUpdate)
            return;
        setIsUpdating(true);
        try {
            await onUpdate(taskId, {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                estimatedTime: formData.estimatedTime ? parseInt(String(formData.estimatedTime)) : undefined,
            });
            setIsEditing(false);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsUpdating(false);
        }
    };
    const handleDelete = async () => {
        if (!taskId || !onDelete)
            return;
        if (window.confirm(t.confirmDelete)) {
            await onDelete(taskId);
            onOpenChange(false);
        }
    };
    const handleShare = async () => {
        if (!taskId)
            return;
        if (task?.publicToken) {
            setShowShareDialog(true);
        }
        else if (onShare) {
            await onShare(taskId);
            setShowShareDialog(true);
        }
    };
    const copyShareLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${origin}/share/task/${task?.publicToken}`;
        navigator.clipboard.writeText(url);
        // toast logic handled by parent if needed or simple alert, 
        // but ideally we should have a `onNotify` prop if we want to trigger toasts from here
    };
    if (!taskId && !open)
        return null;
    const PRIORITY_CONFIG = {
        LOW: { label: t.priorityLow, color: 'bg-slate-500', textColor: 'text-slate-600', icon: Flag },
        MEDIUM: { label: t.priorityMedium, color: 'bg-blue-500', textColor: 'text-blue-600', icon: Flag },
        HIGH: { label: t.priorityHigh, color: 'bg-orange-500', textColor: 'text-orange-600', icon: Flag },
        URGENT: { label: t.priorityUrgent, color: 'bg-red-500', textColor: 'text-red-600', icon: Activity },
    };
    const STATUS_CONFIG = {
        TODO: { label: t.statusTodo, color: 'bg-slate-500' },
        IN_PROGRESS: { label: t.statusInProgress, color: 'bg-blue-500' },
        COMPLETED: { label: t.statusCompleted, color: 'bg-green-500' },
        CANCELLED: { label: t.statusCancelled, color: 'bg-red-500' },
    };
    return (_jsxs(Sheet, { open: open, onOpenChange: onOpenChange, children: [_jsxs(SheetContent, { side: "right", className: "w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background transition-colors", hideCloseButton: true, children: [_jsx(SheetTitle, { className: "sr-only", children: task?.title || t.title }), isLoading ? (_jsxs("div", { className: "flex flex-col h-full animate-pulse p-6 space-y-4", children: [_jsx(Skeleton, { className: "h-8 w-1/3" }), _jsx(Skeleton, { className: "h-32 w-full" }), _jsx(Skeleton, { className: "h-64 w-full" })] })) : (_jsxs("div", { className: "flex flex-col h-full animate-in fade-in duration-300", children: [_jsx("div", { className: "px-6 py-5 border-b bg-muted/10", children: _jsxs("div", { className: "flex items-start justify-between gap-6", children: [_jsxs("div", { className: "flex-1 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: formData.status, onValueChange: (val) => {
                                                                handleFieldChange('status', val);
                                                                if (onUpdate && taskId)
                                                                    onUpdate(taskId, { status: val });
                                                            }, children: [_jsx(SelectTrigger, { className: "h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(STATUS_CONFIG).map(([key, config]) => (_jsx(SelectItem, { value: key, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: cn('w-2 h-2 rounded-full', config.color) }), config.label] }) }, key))) })] }), _jsxs(Select, { value: formData.priority, onValueChange: (val) => {
                                                                handleFieldChange('priority', val);
                                                                if (onUpdate && taskId)
                                                                    onUpdate(taskId, { priority: val });
                                                            }, children: [_jsx(SelectTrigger, { className: "h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(PRIORITY_CONFIG).map(([key, config]) => (_jsx(SelectItem, { value: key, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(config.icon, { className: cn('w-3 h-3', config.textColor) }), config.label] }) }, key))) })] })] }), isEditing ? (_jsx(Input, { value: formData.title, onChange: (e) => handleFieldChange("title", e.target.value), className: "text-2xl font-bold h-auto py-2 px-3 -ml-3 bg-transparent border-transparent hover:bg-accent/50 focus:bg-background focus:border-input transition-colors", placeholder: t.titlePlaceholder, autoFocus: true })) : (_jsx("h2", { className: "text-2xl font-bold cursor-text hover:bg-accent/20 rounded px-2 -ml-2 py-1 transition-colors", onClick: () => setIsEditing(true), children: formData.title })), _jsxs("div", { className: "flex flex-wrap items-center gap-2 -ml-2 px-2", children: [_jsx(TagIcon, { className: "w-4 h-4 text-muted-foreground" }), task?.tags && task.tags.length > 0 ? (task.tags.map((tag) => (_jsxs(Badge, { variant: "secondary", className: "gap-1.5 pr-1 border hover:shadow-sm transition-shadow", style: {
                                                                backgroundColor: tag.color + '20',
                                                                color: tag.color,
                                                                borderColor: tag.color + '40'
                                                            }, children: [tag.name, _jsx("button", { onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        if (taskId && onRemoveTag)
                                                                            onRemoveTag(taskId, tag.id);
                                                                    }, className: "hover:bg-background/30 rounded-full p-0.5 transition-colors", children: _jsx(X, { className: "w-3 h-3" }) })] }, tag.id)))) : (_jsx("span", { className: "text-xs text-muted-foreground italic", children: t.tagsNone })), _jsxs(Popover, { open: tagPopoverOpen, onOpenChange: setTagPopoverOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs gap-1 rounded-full px-2 hover:bg-accent", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), t.tagsAdd] }) }), _jsx(PopoverContent, { className: "p-2 w-64", align: "start", children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground", children: t.tagsAvailable }), availableTags.length > 0 ? (availableTags.map((tag) => {
                                                                                const isAssigned = task?.tags?.some(t => t.id === tag.id);
                                                                                if (isAssigned)
                                                                                    return null;
                                                                                return (_jsxs("button", { onClick: (e) => {
                                                                                        e.preventDefault();
                                                                                        if (taskId && onAssignTag) {
                                                                                            onAssignTag(taskId, tag.id);
                                                                                            setTagPopoverOpen(false);
                                                                                        }
                                                                                    }, className: "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer", children: [_jsx("div", { className: "w-3 h-3 rounded-full flex-shrink-0", style: { backgroundColor: tag.color } }), _jsx("span", { className: "flex-1 text-left", children: tag.name })] }, tag.id));
                                                                            })) : (_jsx("div", { className: "text-center py-4 text-sm text-muted-foreground", children: t.tagsNoAvailable })), _jsx(Separator, { className: "my-1" }), _jsxs("button", { onClick: () => {
                                                                                    setTagPopoverOpen(false);
                                                                                    setShowCreateTagDialog(true);
                                                                                }, className: "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-primary transition-colors cursor-pointer font-medium", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: t.tagsCreate })] })] }) })] })] })] }), _jsx("div", { className: "flex items-start gap-2 pt-1", children: isEditing ? (_jsxs(Button, { size: "sm", onClick: handleSave, disabled: isUpdating, className: "h-9", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), t.btnSave] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsEditing(true), className: "h-9 w-9", children: _jsx(Layout, { className: "w-4 h-4 text-muted-foreground" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleShare, className: "h-9 w-9", children: _jsx(Share2, { className: "w-4 h-4 text-muted-foreground" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => onOpenChange(false), className: "h-9 w-9", children: _jsx(X, { className: "w-4 h-4 text-muted-foreground" }) })] })) })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "md:col-span-2 space-y-3 flex flex-col", children: [_jsx(Label, { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: t.descriptionLabel }), isEditing ? (_jsx(Textarea, { value: formData.description, onChange: (e) => handleFieldChange("description", e.target.value), placeholder: t.descriptionPlaceholder, className: "flex-1 resize-none text-sm" })) : (_jsx("div", { className: cn("prose prose-sm dark:prose-invert max-w-none flex-1 p-4 rounded-lg border-2 border-dashed transition-all", formData.description
                                                                ? "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30"
                                                                : "border-border/30 bg-muted/10 hover:border-border/50 hover:bg-muted/20", "cursor-text"), onClick: () => setIsEditing(true), children: formData.description ? (_jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: formData.description })) : (_jsx("p", { className: "text-muted-foreground italic text-sm", children: t.descriptionEmpty })) }))] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "space-y-4 p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 shadow-sm", children: [_jsxs("h3", { className: "font-bold text-sm mb-3 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-4 bg-primary rounded-full" }), t.detailsTitle] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.dueDate }), _jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors", children: [_jsx(Calendar, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx(Input, { type: "date", value: formData.dueDate, onChange: (e) => {
                                                                                            handleFieldChange("dueDate", e.target.value);
                                                                                            if (!isEditing && taskId && onUpdate) {
                                                                                                onUpdate(taskId, { dueDate: e.target.value ? new Date(e.target.value) : undefined });
                                                                                            }
                                                                                        }, className: "h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" })] })] }), _jsx(Separator, { className: "my-3" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.estimation }), _jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors", children: [_jsx(Clock, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }), _jsx(Input, { type: "number", value: formData.estimatedTime, onChange: (e) => {
                                                                                            handleFieldChange("estimatedTime", e.target.value);
                                                                                            if (!isEditing && taskId && onUpdate && e.target.value) {
                                                                                                onUpdate(taskId, { estimatedTime: parseFloat(e.target.value) });
                                                                                            }
                                                                                        }, placeholder: "0", className: "h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" })] })] }), _jsx(Separator, { className: "my-3" }), renderAssigneeSelector && taskId && renderAssigneeSelector(taskId, task?.assignee)] })] }) })] }), _jsx(Separator, { className: "my-6" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-lg w-fit border border-border/30", children: [_jsx(TabButton, { active: activeTab === 'subtasks', onClick: () => setActiveTab('subtasks'), icon: CheckSquare, label: t.tabsSubtasks, count: task?.subTasks?.length }), _jsx(TabButton, { active: activeTab === 'comments', onClick: () => setActiveTab('comments'), icon: MessageSquare, label: t.tabsComments, count: task?.comments?.length }), _jsx(TabButton, { active: activeTab === 'attachments', onClick: () => setActiveTab('attachments'), icon: Paperclip, label: t.tabsAttachments, count: task?.attachments?.length }), _jsx(TabButton, { active: activeTab === 'activity', onClick: () => setActiveTab('activity'), icon: Activity, label: t.tabsActivity })] }), _jsxs("div", { className: "min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300", children: [activeTab === 'subtasks' && taskId && renderSubtaskList && renderSubtaskList(taskId, task?.subTasks || []), activeTab === 'comments' && taskId && renderComments && renderComments(taskId), activeTab === 'attachments' && taskId && renderAttachments && renderAttachments(taskId), activeTab === 'activity' && taskId && renderActivity && renderActivity(taskId)] })] })] }) }), _jsxs("div", { className: "p-5 border-t bg-muted/10 flex justify-between items-center", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors", onClick: handleDelete, children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), t.btnDelete] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [t.footerCreated, " ", task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'] })] })] }))] }), renderCreateTagDialog && renderCreateTagDialog(showCreateTagDialog, setShowCreateTagDialog), _jsx(Dialog, { open: showShareDialog, onOpenChange: setShowShareDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: t.shareTitle }), _jsx(DialogDescription, { children: t.shareDescription })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsxs("div", { className: "grid flex-1 gap-2", children: [_jsx(Label, { htmlFor: "link", className: "sr-only", children: "Link" }), _jsxs("div", { className: "flex items-center gap-2 p-2 rounded-md border bg-muted/50", children: [_jsx(LinkIcon, { className: "w-4 h-4 text-muted-foreground" }), _jsx("input", { id: "link", className: "flex-1 bg-transparent border-none text-sm focus:outline-none text-muted-foreground", value: task?.publicToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/task/${task.publicToken}` : '', readOnly: true })] })] }), _jsxs(Button, { size: "sm", className: "px-3", onClick: copyShareLink, children: [_jsx("span", { className: "sr-only", children: "Copy" }), _jsx(Copy, { className: "h-4 w-4" })] })] })] }) })] }));
}
function TabButton({ active, onClick, icon: Icon, label, count }) {
    return (_jsxs("button", { onClick: onClick, className: cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all", active
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"), children: [_jsx(Icon, { className: "w-4 h-4" }), label, count !== undefined && count > 0 && (_jsx("span", { className: "bg-muted-foreground/10 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full", children: count }))] }));
}
