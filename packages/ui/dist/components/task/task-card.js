import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CheckSquare, MoreVertical, Trash2, Flag, Calendar, Edit, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
import { Badge } from '../ui/badge.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../ui/dropdown-menu.js';
/**
 * TaskCard - Platform-agnostic task display card
 *
 * Shows task with priority, due date, tags, and subtask progress.
 * All state and complex logic (dates, progress) should be handled by the caller.
 */
export function TaskCard({ task, index = 0, isExpanded = false, onToggleExpand, onEdit, onDelete, DetailPanel, formattedDueDate, isOverdue = false, priorityInfo, labels = {}, className = '', }) {
    const { priorityMedium = 'Medium', viewEdit = 'View/Edit', delete: deleteLabel = 'Delete', completed = 'Completed', moreOptions = 'More options', } = labels;
    const isCompleted = task.status === 'COMPLETED';
    const priority = priorityInfo || {
        label: priorityMedium,
        colorClass: 'text-blue-500',
    };
    const accentColor = task.project?.color || '#8b5cf6';
    // Subtask progress calculations (simple math is okay in pure component)
    const subtasks = task.subTasks || [];
    const completedSubtasks = subtasks.filter((st) => st.status === 'COMPLETED').length;
    const totalSubtasks = subtasks.length;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const handleCardClick = () => {
        onToggleExpand?.(task);
    };
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(task);
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(task);
    };
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: index * 0.05 }, whileHover: { y: -5, scale: 1.02 }, onClick: handleCardClick, className: cn('group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm', 'hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800', isCompleted && 'grayscale opacity-80', className), style: {
                    borderLeftWidth: '4px',
                    borderLeftColor: accentColor,
                }, children: _jsxs("div", { className: "relative z-10 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", style: {
                                                backgroundColor: '#f3f4f6', // Solid light gray background
                                                color: accentColor,
                                            }, children: _jsx(CheckSquare, { className: "h-7 w-7" }) }), _jsx("h3", { className: cn('font-bold text-xl leading-tight truncate max-w-[180px]', isCompleted && 'line-through text-muted-foreground'), children: task.title })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx("button", { className: cn('transition-opacity duration-200', 'rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground'), "aria-label": moreOptions, children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsxs(DropdownMenuItem, { onClick: handleEdit, children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), viewEdit] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleDelete, className: "text-destructive focus:text-destructive focus:bg-destructive-foreground dark:focus:bg-destructive/10", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), deleteLabel] })] })] })] }), task.tags && task.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mb-3", children: task.tags.map((tag) => (_jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0 h-5 border-0 font-medium bg-muted text-muted-foreground", children: tag.name }, tag.id))) })), task.description && (_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow", children: task.description })), totalSubtasks > 0 && (_jsxs("div", { className: "flex items-center gap-2 mb-4", onClick: (e) => e.stopPropagation(), children: [_jsx(ListTodo, { className: "h-3.5 w-3.5 text-muted-foreground" }), _jsx("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary transition-all duration-300 ease-out", style: { width: `${subtaskProgress}%` } }) }), _jsxs("span", { className: "text-xs text-muted-foreground font-medium", children: [completedSubtasks, "/", totalSubtasks] })] })), _jsx("div", { className: "mt-auto pt-4 border-t border-dashed border-border", children: _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-3 text-muted-foreground", children: [_jsxs("div", { className: cn('flex items-center gap-1.5', priority.colorClass), children: [_jsx(Flag, { className: "h-3.5 w-3.5" }), _jsx("span", { children: priority.label })] }), formattedDueDate && (_jsxs("div", { className: cn('flex items-center gap-1.5', isOverdue ? 'text-destructive font-semibold' : ''), children: [_jsx(Calendar, { className: "h-3.5 w-3.5" }), _jsx("span", { children: formattedDueDate })] }))] }), isCompleted && (_jsx("div", { className: "text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", children: completed }))] }) })] }) }), DetailPanel && isExpanded && DetailPanel] }));
}
