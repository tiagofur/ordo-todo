'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertCircle, User, Users } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.js';
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';
/**
 * TaskList - Platform-agnostic simple task list with checkboxes
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: tasks, isLoading, error, refetch } = useTasks(projectId);
 * const completeTask = useCompleteTask();
 *
 * <TaskList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   isCompleting={completeTask.isPending}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   onRetry={refetch}
 *   labels={{ allTasks: t('allTasks') }}
 * />
 */
export function TaskList({ tasks = [], isLoading = false, error, isCompleting = false, onComplete, onRetry, showFilter = true, showMyTasks: controlledShowMyTasks, onFilterChange, labels = {}, className = '', }) {
    const [internalShowMyTasks, setInternalShowMyTasks] = useState(false);
    // Support both controlled and uncontrolled filter state
    const showMyTasks = controlledShowMyTasks ?? internalShowMyTasks;
    const handleFilterChange = (value) => {
        if (onFilterChange) {
            onFilterChange(value);
        }
        else {
            setInternalShowMyTasks(value);
        }
    };
    const { allTasks = 'All Tasks', myTasks = 'My Tasks', empty = 'No tasks found', emptyMyTasks = 'No tasks assigned to you', error: errorLabel = (msg) => `Error loading tasks: ${msg}`, retry = 'Retry', } = labels;
    if (isLoading) {
        return (_jsx("div", { className: cn('space-y-2 mt-4', className), children: [...Array(3)].map((_, i) => (_jsxs("div", { className: "p-4 border rounded-lg shadow-sm flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsx(Skeleton, { className: "h-5 w-5 rounded" }), _jsxs("div", { className: "space-y-2 w-full", children: [_jsx(Skeleton, { className: "h-5 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" })] })] }), _jsx(Skeleton, { className: "h-4 w-16 ml-4" })] }, i))) }));
    }
    if (error) {
        return (_jsxs("div", { className: cn('p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center gap-2 mt-4', className), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx("p", { className: "font-medium", children: errorLabel(error) })] }), onRetry && (_jsx(Button, { variant: "outline", size: "sm", onClick: onRetry, className: "bg-background hover:bg-accent", children: retry }))] }));
    }
    return (_jsxs("div", { className: cn('space-y-4 mt-4', className), children: [showFilter && (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "inline-flex rounded-lg border p-1 bg-muted/30", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleFilterChange(false), className: cn('gap-2 transition-colors', !showMyTasks && 'bg-background shadow-sm'), children: [_jsx(Users, { className: "h-4 w-4" }), allTasks] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleFilterChange(true), className: cn('gap-2 transition-colors', showMyTasks && 'bg-background shadow-sm'), children: [_jsx(User, { className: "h-4 w-4" }), myTasks] })] }) })), tasks.length === 0 ? (_jsx("div", { className: "text-muted-foreground text-center py-8", children: showMyTasks ? emptyMyTasks : empty })) : (_jsx("div", { className: "space-y-2", children: tasks.map((task) => (_jsxs("div", { className: cn('p-4 border rounded-lg shadow-sm flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300', task.status === 'COMPLETED' && 'bg-muted/50'), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: task.status === 'COMPLETED', onChange: () => onComplete?.(String(task.id)), disabled: isCompleting || task.status === 'COMPLETED', className: "h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" }), _jsxs("div", { children: [_jsx("h3", { className: cn('font-medium', task.status === 'COMPLETED' && 'line-through text-muted-foreground'), children: task.title }), task.description && (_jsx("p", { className: "text-sm text-muted-foreground", children: task.description }))] })] }), _jsx("div", { className: "text-sm text-muted-foreground", children: task.status })] }, task.id))) }))] }));
}
