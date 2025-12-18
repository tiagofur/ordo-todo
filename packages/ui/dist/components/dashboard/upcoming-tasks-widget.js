'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/index.js';
const PRIORITY_COLORS = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    URGENT: '#ef4444',
};
const DEFAULT_LABELS = {
    title: 'Upcoming Tasks',
    empty: 'No tasks with upcoming due dates',
    overdueAgo: (days) => `Overdue by ${days} day${days > 1 ? 's' : ''}`,
    dueToday: 'Due today',
    dueTomorrow: 'Due tomorrow',
    inDays: (days) => `In ${days} days`,
};
export function UpcomingTasksWidget({ tasks, onTaskClick, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    // Sort by due date (soonest first)
    const sortedTasks = [...tasks]
        .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
    })
        .slice(0, 5);
    const getDaysUntilDue = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    const getDueDateLabel = (daysUntil) => {
        if (daysUntil < 0)
            return t.overdueAgo(Math.abs(daysUntil));
        if (daysUntil === 0)
            return t.dueToday;
        if (daysUntil === 1)
            return t.dueTomorrow;
        return t.inDays(daysUntil);
    };
    if (sortedTasks.length === 0) {
        return (_jsxs("div", { className: "rounded-2xl border border-border/50 bg-card p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary", children: _jsx(Calendar, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-lg font-semibold", children: t.title })] }), _jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: t.empty })] }));
    }
    return (_jsxs("div", { className: "rounded-2xl border border-border/50 bg-card p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary", children: _jsx(Calendar, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-lg font-semibold", children: t.title })] }), _jsx("div", { className: "space-y-3", children: sortedTasks.map((task) => {
                    const daysUntil = getDaysUntilDue(task.dueDate);
                    const isOverdue = daysUntil < 0;
                    const isDueToday = daysUntil === 0;
                    return (_jsxs("div", { className: cn('flex items-start gap-3 rounded-lg border p-3 transition-all duration-200', 'hover:bg-accent/50 hover:border-primary/20 cursor-pointer'), onClick: () => onTaskClick?.(task.id), children: [_jsx("div", { className: "h-full w-1 rounded-full shrink-0 self-stretch", style: { backgroundColor: PRIORITY_COLORS[task.priority] } }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: task.title }), task.project && (_jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [_jsx("div", { className: "h-2 w-2 rounded-full", style: { backgroundColor: task.project.color } }), _jsx("span", { className: "text-xs text-muted-foreground truncate", children: task.project.name })] })), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [(isOverdue || isDueToday) && (_jsx(AlertCircle, { className: cn('h-3 w-3', isOverdue ? 'text-destructive' : 'text-amber-500') })), _jsx("span", { className: cn('text-xs font-medium', isOverdue && 'text-destructive', isDueToday && 'text-amber-500', !isOverdue && !isDueToday && 'text-muted-foreground'), children: getDueDateLabel(daysUntil) })] })] })] }, task.id));
                }) })] }));
}
