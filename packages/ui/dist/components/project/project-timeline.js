import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2, Calendar } from 'lucide-react';
import { cn } from '../../utils/index.js';
/**
 * ProjectTimeline - Platform-agnostic component for displaying tasks chronologically
 */
export function ProjectTimeline({ tasks = [], isLoading = false, labels = {}, className = '', }) {
    const { emptyTitle = 'No tasks with due dates found.', emptyDescription = 'Add due dates to your tasks to see them here.', } = labels;
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    if (tasks.length === 0) {
        return (_jsx("div", { className: cn("rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center", className), children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx(Calendar, { className: "w-8 h-8 opacity-50" }), _jsx("p", { children: emptyTitle }), _jsx("p", { className: "text-sm", children: emptyDescription })] }) }));
    }
    return (_jsx("div", { className: cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className), children: _jsx("div", { className: "relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8 py-2", children: tasks.map((task) => (_jsxs("div", { className: "relative pl-8 group", children: [_jsx("div", { className: cn('absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-black transition-colors', task.isCompleted
                            ? 'border-green-500 bg-green-500'
                            : 'border-primary group-hover:bg-slate-100 dark:group-hover:bg-slate-900') }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: task.formattedDate }), _jsxs("div", { className: cn('p-4 rounded-lg border bg-white dark:bg-slate-950 transition-all hover:shadow-md', task.isCompleted && 'opacity-80 bg-slate-50 dark:bg-slate-900'), children: [_jsx("h4", { className: cn('font-medium text-foreground', task.isCompleted && 'line-through text-muted-foreground'), children: task.title }), task.description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: task.description })), _jsx("div", { className: "flex items-center gap-2 mt-2", children: _jsx("span", { className: cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium border bg-slate-100 dark:bg-slate-800', task.priorityColorClass), children: task.priorityLabel }) })] })] })] }, task.id))) }) }));
}
