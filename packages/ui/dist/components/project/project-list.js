'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2, CheckCircle2, Calendar, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/index.js';
import { EmptyState } from '../ui/empty-state.js';
const PRIORITY_COLORS = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
};
/**
 * ProjectList - Platform-agnostic task list for a project
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: tasks, isLoading } = useTasks(projectId);
 * const updateTask = useUpdateTask();
 *
 * <ProjectList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   onStatusToggle={(task) => updateTask.mutate({
 *     taskId: task.id,
 *     data: { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }
 *   })}
 *   onTaskClick={(task) => setSelectedTaskId(task.id)}
 *   labels={{ columnTask: t('task') }}
 * />
 */
export function ProjectList({ tasks = [], isLoading = false, isUpdating = false, onStatusToggle, onTaskClick, onCreateTask, TaskDetailPanel, CreateTaskDialog, dateLocale, labels = {}, className = '', }) {
    const { columnTask = 'Task', columnDueDate = 'Due Date', columnPriority = 'Priority', emptyTitle = 'No tasks yet', emptyDescription = 'Create your first task to get started', emptyAction = 'Create Task', } = labels;
    if (isLoading) {
        return (_jsx("div", { className: cn('flex items-center justify-center h-64', className), children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    if (tasks.length === 0) {
        return (_jsxs(_Fragment, { children: [_jsx(EmptyState, { icon: ListTodo, title: emptyTitle, description: emptyDescription, actionLabel: emptyAction, onAction: onCreateTask }), CreateTaskDialog] }));
    }
    return (_jsxs("div", { className: cn('space-y-2', className), children: [_jsxs("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden", children: [_jsxs("div", { className: "grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider", children: [_jsx("div", { className: "w-6" }), _jsx("div", { children: columnTask }), _jsx("div", { children: columnDueDate }), _jsx("div", { children: columnPriority })] }), _jsx("div", { className: "divide-y divide-border", children: tasks.map((task) => (_jsxs("div", { className: "grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group", onClick: () => onTaskClick?.(task), children: [_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        onStatusToggle?.(task);
                                    }, disabled: isUpdating, className: cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors', task.status === 'COMPLETED'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-muted-foreground/40 hover:border-primary'), children: task.status === 'COMPLETED' && _jsx(CheckCircle2, { className: "w-3.5 h-3.5" }) }), _jsx("div", { className: cn('font-medium', task.status === 'COMPLETED' && 'line-through text-muted-foreground'), children: task.title }), _jsx("div", { className: "text-sm text-muted-foreground flex items-center gap-2", children: task.dueDate && (_jsxs(_Fragment, { children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), format(new Date(task.dueDate), 'MMM d', dateLocale ? { locale: dateLocale } : undefined)] })) }), _jsx("div", { className: cn('text-xs font-medium px-2 py-1 rounded-full bg-muted', PRIORITY_COLORS[task.priority] || 'text-gray-500'), children: task.priority })] }, task.id))) })] }), TaskDetailPanel] }));
}
