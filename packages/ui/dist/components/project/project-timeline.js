'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/index.js';
export function ProjectTimeline({ tasks = [], isLoading = false, dateLocale, labels = {}, }) {
    const { emptyTitle = 'No tasks with due dates found.', emptyDescription = 'Add due dates to your tasks to see them here.', } = labels;
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    // Filter tasks with due dates and sort them
    const timelineTasks = tasks
        .filter((t) => t.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (timelineTasks.length === 0) {
        return (_jsx("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx(Calendar, { className: "w-8 h-8 opacity-50" }), _jsx("p", { children: emptyTitle }), _jsx("p", { className: "text-sm", children: emptyDescription })] }) }));
    }
    return (_jsx("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm p-6", children: _jsx("div", { className: "relative border-l-2 border-muted ml-3 space-y-8 py-2", children: timelineTasks.map((task) => {
                const date = new Date(task.dueDate);
                const isCompleted = task.status === 'COMPLETED';
                return (_jsxs("div", { className: "relative pl-8 group", children: [_jsx("div", { className: cn('absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-background transition-colors', isCompleted
                                ? 'border-green-500 bg-green-500'
                                : 'border-primary group-hover:bg-primary/20') }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: format(date, 'MMM d, yyyy', { locale: dateLocale }) }), _jsxs("div", { className: cn('p-4 rounded-lg border bg-card transition-all hover:shadow-md', isCompleted && 'opacity-60 bg-muted/30'), children: [_jsx("h4", { className: cn('font-medium', isCompleted && 'line-through text-muted-foreground'), children: task.title }), task.description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: task.description })), _jsx("div", { className: "flex items-center gap-2 mt-2", children: _jsx("span", { className: cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium border', task.priority === 'URGENT'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : task.priority === 'HIGH'
                                                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'), children: task.priority }) })] })] })] }, task.id));
            }) }) }));
}
