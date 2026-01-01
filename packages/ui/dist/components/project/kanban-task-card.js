import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Flag, Calendar, MoreVertical, Edit, Trash2, } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "../../utils/index.js";
import { TaskDetailPanel } from "../task/task-detail-panel.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu.js";
export function KanbanTaskCard({ task, index = 0, onTaskClick, onEditClick, onDeleteClick, onDetailOpenChange, isDetailOpen = false, labels = {}, }) {
    const isCompleted = task.status === "COMPLETED";
    const priorityConfig = {
        LOW: {
            label: labels.priorityLow ?? "Low",
            color: "text-gray-500",
            bg: "bg-gray-500/10",
        },
        MEDIUM: {
            label: labels.priorityMedium ?? "Medium",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        HIGH: {
            label: labels.priorityHigh ?? "High",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        URGENT: {
            label: labels.priorityUrgent ?? "Urgent",
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
    };
    const priority = priorityConfig[task.priority] ||
        priorityConfig.MEDIUM;
    const accentColor = task.project?.color || "#8b5cf6";
    const formatDueDate = (date) => {
        if (!date)
            return null;
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return format(dateObj, "d MMM", { locale: es });
    };
    const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
    return (_jsxs(_Fragment, { children: [_jsxs(motion.div, { layoutId: `task-${task.id}`, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, whileHover: { y: -2, scale: 1.01 }, onClick: () => {
                    if (onTaskClick)
                        onTaskClick(String(task.id));
                    if (onDetailOpenChange && task.id)
                        onDetailOpenChange(String(task.id), true);
                }, className: cn("group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all cursor-pointer", "hover:shadow-md hover:border-primary/20", isCompleted && "opacity-60"), style: {
                    borderLeftWidth: "3px",
                    borderLeftColor: accentColor,
                }, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: cn("font-medium text-sm leading-tight line-clamp-2", isCompleted && "line-through text-muted-foreground"), children: task.title }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx("button", { className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md -mr-1 -mt-1", children: _jsx(MoreVertical, { className: "h-3.5 w-3.5 text-muted-foreground" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-40", children: [_jsxs(DropdownMenuItem, { onClick: (e) => {
                                                    e.stopPropagation();
                                                    if (onEditClick)
                                                        onEditClick(String(task.id));
                                                    if (onDetailOpenChange && task.id)
                                                        onDetailOpenChange(String(task.id), true);
                                                }, children: [_jsx(Edit, { className: "mr-2 h-3.5 w-3.5" }), labels.viewEdit ?? "View/Edit"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: (e) => {
                                                    e.stopPropagation();
                                                    if (onDeleteClick)
                                                        onDeleteClick(String(task.id));
                                                }, className: "text-destructive focus:text-destructive", children: [_jsx(Trash2, { className: "mr-2 h-3.5 w-3.5" }), labels.delete ?? "Delete"] })] })] })] }), task.tags && task.tags.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1", children: [task.tags.slice(0, 3).map((tag) => (_jsx("div", { className: "text-[10px] px-1.5 py-0.5 rounded-full font-medium", style: {
                                    backgroundColor: tag.color + "15",
                                    color: tag.color,
                                }, children: tag.name }, tag.id))), task.tags.length > 3 && (_jsxs("div", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground", children: ["+", task.tags.length - 3] }))] })), _jsxs("div", { className: "flex items-center justify-between mt-1 pt-2 border-t border-border/30", children: [_jsxs("div", { className: cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium", priority.bg, priority.color), children: [_jsx(Flag, { className: "h-3 w-3" }), priority.label] }), task.dueDate && (_jsxs("div", { className: cn("flex items-center gap-1 text-[10px]", isOverdue
                                    ? "text-red-500 font-medium"
                                    : "text-muted-foreground"), children: [_jsx(Calendar, { className: "h-3 w-3" }), formatDueDate(task.dueDate)] }))] })] }), _jsx(TaskDetailPanel, { taskId: task.id ? String(task.id) : null, open: isDetailOpen, onOpenChange: (open) => {
                    if (onDetailOpenChange && task.id) {
                        onDetailOpenChange(String(task.id), open);
                    }
                } })] }));
}
