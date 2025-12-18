'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, } from '../ui/sheet.js';
import { Checkbox } from '../ui/checkbox.js';
import { Separator } from '../ui/separator.js';
import { Calendar, Flag, Clock } from 'lucide-react';
import { format } from 'date-fns';
const PRIORITY_COLORS = {
    URGENT: 'text-red-500',
    HIGH: 'text-orange-500',
    MEDIUM: 'text-blue-500',
    LOW: 'text-gray-500',
};
/**
 * TaskDetailView - Platform-agnostic task detail sheet
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: task, isLoading } = useTask(taskId);
 * const completeTask = useCompleteTask();
 *
 * <TaskDetailView
 *   task={task}
 *   open={!!taskId}
 *   onOpenChange={(open) => !open && setTaskId(null)}
 *   isLoading={isLoading}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   labels={{ title: t('title') }}
 * />
 */
export function TaskDetailView({ task, open, onOpenChange, isLoading = false, onComplete, dateLocale, labels = {}, }) {
    const { title = 'Task Details', description = 'View and manage task information', noDate = 'No due date', subtasksTitle = 'Subtasks', subtasksEmpty = 'No subtasks yet', timeTitle = 'Time Tracking', timeComingSoon = 'Time tracking data will appear here', notFound = 'Task not found', } = labels;
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, children: _jsxs(SheetContent, { className: "w-[400px] sm:w-[540px] overflow-y-auto", children: [_jsxs(SheetHeader, { children: [_jsx(SheetTitle, { children: title }), _jsx(SheetDescription, { children: description })] }), isLoading ? (_jsxs("div", { className: "space-y-4 py-4", children: [_jsx("div", { className: "h-8 w-3/4 animate-pulse rounded bg-muted" }), _jsx("div", { className: "h-32 w-full animate-pulse rounded bg-muted" })] })) : task ? (_jsxs("div", { className: "space-y-6 py-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Checkbox, { checked: task.status === 'COMPLETED', onCheckedChange: () => onComplete?.(task.id), className: "mt-1" }), _jsxs("div", { className: "space-y-1", children: [_jsx("h2", { className: `text-xl font-semibold ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`, children: task.title }), task.description && (_jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: task.description }))] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx(Flag, { className: `h-4 w-4 ${PRIORITY_COLORS[task.priority] || 'text-gray-500'}` }), _jsx("span", { children: task.priority })] }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { children: task.dueDate
                                                ? format(new Date(task.dueDate), 'PPP', dateLocale ? { locale: dateLocale } : undefined)
                                                : noDate })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h3", { className: "font-medium", children: subtasksTitle }) }), task.subTasks && task.subTasks.length > 0 ? (_jsx("div", { className: "space-y-2", children: task.subTasks.map((subtask) => (_jsxs("div", { className: "flex items-center gap-2 rounded-lg border p-2 text-sm", children: [_jsx(Checkbox, { checked: subtask.status === 'COMPLETED', disabled: true }), _jsx("span", { className: subtask.status === 'COMPLETED' ? 'line-through text-muted-foreground' : '', children: subtask.title })] }, subtask.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground italic", children: subtasksEmpty }))] }), _jsxs("div", { className: "rounded-lg bg-muted/50 p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("h3", { className: "font-medium", children: timeTitle })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: timeComingSoon })] })] })) : (_jsx("div", { className: "py-8 text-center text-muted-foreground", children: notFound }))] }) }));
}
