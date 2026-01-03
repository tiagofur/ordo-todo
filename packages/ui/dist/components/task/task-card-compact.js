'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { CheckCircle2, MoreVertical, Trash2, Calendar, Edit, Circle, AlertCircle, Flame, Clock, PlayCircle, PauseCircle, ListTodo, ChevronDown, } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel, } from '../ui/dropdown-menu.js';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
import { Badge } from '../ui/badge.js';
export function TaskCardCompact({ task, index = 0, viewMode = 'list', showProject = false, showGradient = false, onTaskClick, onStatusChange, onDelete, DetailPanel, onToggleDetail, dateLocale, labels = {}, }) {
    const { statusTodo = 'To Do', statusInProgress = 'In Progress', statusCompleted = 'Completed', statusOnHold = 'On Hold', statusLabel = 'Status', changeStatus = 'Change Status', priorityUrgent = 'Urgent', priorityHigh = 'High', priorityMedium = 'Medium', priorityLow = 'Low', priorityNormal = 'Normal', viewDetails = 'View Details', delete: deleteLabel = 'Delete', } = labels;
    const [showDetailInternal, setShowDetailInternal] = useState(false);
    const isCompleted = task.status === 'COMPLETED';
    // Helper to handle detail opening
    const openDetail = () => {
        if (onToggleDetail) {
            onToggleDetail(true);
        }
        else {
            setShowDetailInternal(true);
        }
    };
    // Status configuration
    const getStatusConfig = (status) => {
        switch (status) {
            case 'TODO':
                return {
                    color: '#6b7280',
                    bgColor: '#6b728015',
                    icon: ListTodo,
                    label: statusTodo,
                };
            case 'IN_PROGRESS':
                return {
                    color: '#3b82f6',
                    bgColor: '#3b82f615',
                    icon: PlayCircle,
                    label: statusInProgress,
                };
            case 'COMPLETED':
                return {
                    color: '#22c55e',
                    bgColor: '#22c55e15',
                    icon: CheckCircle2,
                    label: statusCompleted,
                };
            case 'ON_HOLD':
                return {
                    color: '#f59e0b',
                    bgColor: '#f59e0b15',
                    icon: PauseCircle,
                    label: statusOnHold,
                };
            default:
                return {
                    color: '#6b7280',
                    bgColor: '#6b728015',
                    icon: Circle,
                    label: status,
                };
        }
    };
    // Priority configuration with icons
    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'URGENT':
                return {
                    color: '#ef4444',
                    bgColor: '#ef444420',
                    icon: Flame,
                    label: priorityUrgent,
                };
            case 'HIGH':
                return {
                    color: '#f97316',
                    bgColor: '#f9731620',
                    icon: AlertCircle,
                    label: priorityHigh,
                };
            case 'MEDIUM':
                return {
                    color: '#3b82f6',
                    bgColor: '#3b82f620',
                    icon: Circle,
                    label: priorityMedium,
                };
            case 'LOW':
                return {
                    color: '#3b82f6',
                    bgColor: '#3b82f620',
                    icon: Circle,
                    label: priorityLow,
                };
            default:
                return {
                    color: '#6b7280',
                    bgColor: '#6b728020',
                    icon: Circle,
                    label: priorityNormal,
                };
        }
    };
    const priorityConfig = getPriorityConfig(task.priority);
    const PriorityIcon = priorityConfig.icon;
    const statusConfig = getStatusConfig(task.status);
    const StatusIcon = statusConfig.icon;
    const accentColor = task.project?.color || priorityConfig.color;
    const handleStatusChange = (newStatus) => {
        if (task.id) {
            onStatusChange?.(String(task.id), newStatus);
        }
    };
    const formatDueDate = (date) => {
        if (!date)
            return null;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, 'd MMM', dateLocale ? { locale: dateLocale } : undefined);
    };
    const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
    const handleClick = () => {
        if (onTaskClick && task.id) {
            onTaskClick(String(task.id));
        }
        else {
            openDetail();
        }
    };
    const handleMenuClick = (e) => {
        e.stopPropagation();
    };
    const renderStatusDropdown = (align = 'end') => (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: handleMenuClick, children: _jsxs("button", { className: cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200', 'hover:ring-2 hover:ring-offset-1 hover:ring-offset-background', isCompleted && 'opacity-80'), style: {
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                    }, children: [_jsx(StatusIcon, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: statusConfig.label }), _jsx(ChevronDown, { className: "h-3.5 w-3.5 opacity-60" })] }) }), _jsxs(DropdownMenuContent, { align: align, className: "w-44", children: [_jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground", children: changeStatus }), _jsx(DropdownMenuSeparator, {}), [
                        {
                            value: 'TODO',
                            label: statusTodo,
                            icon: ListTodo,
                            color: '#6b7280',
                        },
                        {
                            value: 'IN_PROGRESS',
                            label: statusInProgress,
                            icon: PlayCircle,
                            color: '#3b82f6',
                        },
                        {
                            value: 'COMPLETED',
                            label: statusCompleted,
                            icon: CheckCircle2,
                            color: '#22c55e',
                        },
                        {
                            value: 'ON_HOLD',
                            label: statusOnHold,
                            icon: PauseCircle,
                            color: '#f59e0b',
                        },
                    ].map((status) => {
                        const Icon = status.icon;
                        return (_jsxs(DropdownMenuItem, { onClick: (e) => {
                                e.stopPropagation();
                                handleStatusChange(status.value);
                            }, className: cn('gap-2', task.status === status.value && 'bg-accent'), children: [_jsx(Icon, { className: "h-4 w-4", style: { color: status.color } }), _jsx("span", { children: status.label }), task.status === status.value && (_jsx(CheckCircle2, { className: "h-3 w-3 ml-auto text-primary" }))] }, status.value));
                    })] })] }));
    const renderActionsMenu = () => (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: handleMenuClick, children: _jsx("button", { className: cn('opacity-0 group-hover:opacity-100 transition-opacity duration-150', 'rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0'), children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-44", children: [_jsxs(DropdownMenuItem, { onClick: (e) => {
                            e.stopPropagation();
                            openDetail();
                        }, children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), viewDetails] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: (e) => {
                            e.stopPropagation();
                            if (task.id)
                                onDelete?.(String(task.id));
                        }, className: "text-destructive focus:text-destructive focus:bg-destructive/10", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), deleteLabel] })] })] }));
    // List View - Diseño mejorado más legible
    if (viewMode === 'list') {
        return (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2, delay: index * 0.02 }, onClick: handleClick, className: cn('group relative flex items-center rounded-xl border px-4 py-4 transition-all duration-200 cursor-pointer', isCompleted
                        ? 'border-border/30 bg-muted/20 opacity-70 hover:opacity-90'
                        : 'border-border/40 bg-card hover:border-border/60 hover:bg-accent/5 hover:shadow-md'), style: {
                        borderLeftWidth: '4px',
                        borderLeftColor: isCompleted ? '#22c55e' : accentColor,
                    }, children: [_jsxs("div", { className: "flex-1 min-w-0 pr-4", children: [_jsx("p", { className: cn('font-semibold text-[17px] mb-1.5', isCompleted
                                        ? 'line-through text-muted-foreground'
                                        : 'text-foreground'), children: task.title }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [showProject && task.project && (_jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: task.project.color } }), _jsx("span", { className: "truncate max-w-[150px]", children: task.project.name })] })), task.dueDate && (_jsxs("span", { className: cn('flex items-center gap-1.5 text-sm', isOverdue
                                                ? 'text-destructive font-medium'
                                                : 'text-muted-foreground'), children: [_jsx(Calendar, { className: "h-4 w-4" }), formatDueDate(task.dueDate)] })), task.estimatedTime && !isCompleted && (_jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [_jsx(Clock, { className: "h-4 w-4" }), task.estimatedTime, "m"] })), task.tags && task.tags.length > 0 && !isCompleted && (_jsxs("div", { className: "flex items-center gap-1.5", children: [task.tags.slice(0, 2).map((tag) => (_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full font-medium", style: {
                                                        backgroundColor: tag.color + '20',
                                                        color: tag.color,
                                                    }, children: tag.name }, tag.id))), task.tags.length > 2 && (_jsxs("span", { className: "text-sm text-muted-foreground", children: ["+", task.tags.length - 2] }))] }))] })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [renderStatusDropdown(), _jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0", style: {
                                        backgroundColor: priorityConfig.bgColor,
                                        color: priorityConfig.color,
                                    }, title: priorityConfig.label, children: [_jsx(PriorityIcon, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: priorityConfig.label })] }), renderActionsMenu()] })] }), DetailPanel &&
                    (onToggleDetail
                        ? DetailPanel
                        : showDetailInternal && DetailPanel)] }));
    }
    // Grid View
    return (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: index * 0.03 }, onClick: handleClick, className: cn('group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer h-full flex flex-col', 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20', isCompleted
                    ? 'border-border/30 bg-muted/30 opacity-60 hover:opacity-80'
                    : 'border-border/50 bg-card hover:border-border'), style: {
                    borderTopWidth: '3px',
                    borderTopColor: isCompleted ? '#22c55e' : accentColor,
                }, children: [_jsx("div", { className: "relative z-10 flex items-center justify-end mb-3", children: renderActionsMenu() }), _jsx("h3", { className: cn('relative z-10 font-semibold text-base leading-tight mb-2 line-clamp-2', isCompleted && 'line-through text-muted-foreground'), children: task.title }), task.description && !isCompleted && (_jsx("p", { className: "relative z-10 text-sm text-muted-foreground line-clamp-2 mb-3", children: task.description })), task.tags && task.tags.length > 0 && !isCompleted && (_jsxs("div", { className: "relative z-10 flex flex-wrap gap-1.5 mb-3", children: [task.tags.slice(0, 2).map((tag) => (_jsx(Badge, { variant: "secondary", className: "text-xs px-2 py-0.5 border-0 font-medium", style: {
                                    backgroundColor: tag.color + '20',
                                    color: tag.color,
                                }, children: tag.name }, tag.id))), task.tags.length > 2 && (_jsxs("span", { className: "text-xs text-muted-foreground", children: ["+", task.tags.length - 2] }))] })), _jsx("div", { className: "relative z-10 mt-auto pt-3 border-t border-dashed border-border/50", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-3 text-muted-foreground", children: [showProject && task.project && (_jsxs("span", { className: "flex items-center gap-1.5 truncate max-w-24", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: task.project.color } }), _jsx("span", { className: "truncate", children: task.project.name })] })), task.dueDate && (_jsxs("span", { className: cn('flex items-center gap-1', isOverdue ? 'text-destructive font-medium' : ''), children: [_jsx(Calendar, { className: "h-3.5 w-3.5" }), formatDueDate(task.dueDate)] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [renderStatusDropdown('end'), _jsxs("div", { className: "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium", style: {
                                                backgroundColor: priorityConfig.bgColor,
                                                color: priorityConfig.color,
                                            }, children: [_jsx(PriorityIcon, { className: "h-3.5 w-3.5" }), _jsx("span", { children: priorityConfig.label })] })] })] }) })] }), DetailPanel &&
                (onToggleDetail
                    ? DetailPanel
                    : showDetailInternal && DetailPanel)] }));
}
