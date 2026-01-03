import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MoreVertical, Edit, Trash2, Flag, Calendar, } from "lucide-react";
import { cn } from "../../utils/index.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu.js";
export function KanbanTaskCard({ task, onTaskClick, onEditClick, onDeleteClick, children, formattedDueDate, isOverdue = false, priorityInfo, labels = {}, className = '', style, }) {
    const isCompleted = task.status === "COMPLETED";
    const priority = priorityInfo || {
        label: labels.priorityMedium ?? "Medium",
        colorClass: "text-blue-500",
        bgSolid: "#eff6ff", // blue-50
    };
    const accentColor = task.project?.color || "#8b5cf6";
    const moreOptionsLabel = labels.moreOptions || "More options";
    const handleCardClick = () => {
        if (onTaskClick && task.id)
            onTaskClick(String(task.id));
    };
    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEditClick && task.id)
            onEditClick(String(task.id));
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDeleteClick && task.id)
            onDeleteClick(String(task.id));
    };
    return (_jsxs("div", { onClick: handleCardClick, className: cn("group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all cursor-pointer", "hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900", isCompleted && "opacity-60 grayscale", className), style: {
            ...style,
            borderLeftWidth: "3px",
            borderLeftColor: accentColor,
        }, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: cn("font-medium text-sm leading-tight line-clamp-2 text-foreground", isCompleted && "line-through text-muted-foreground"), children: task.title }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx("button", { className: "transition-opacity p-1 hover:bg-muted rounded-md -mr-1 -mt-1 text-muted-foreground", "aria-label": moreOptionsLabel, children: _jsx(MoreVertical, { className: "h-3.5 w-3.5" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-40", children: [_jsxs(DropdownMenuItem, { onClick: handleEdit, children: [_jsx(Edit, { className: "mr-2 h-3.5 w-3.5" }), labels.viewEdit ?? "View/Edit"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleDelete, className: "text-destructive focus:text-destructive focus:bg-destructive-foreground", children: [_jsx(Trash2, { className: "mr-2 h-3.5 w-3.5" }), labels.delete ?? "Delete"] })] })] })] }), task.tags && task.tags.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1", children: [task.tags.slice(0, 3).map((tag) => (_jsx("div", { className: "text-[10px] px-1.5 py-0.5 rounded-full font-medium", style: {
                            backgroundColor: "#f3f4f6", // Solid neutral background
                            color: tag.color,
                        }, children: tag.name }, tag.id))), task.tags.length > 3 && (_jsxs("div", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground", children: ["+", task.tags.length - 3] }))] })), _jsxs("div", { className: "flex items-center justify-between mt-1 pt-2 border-t border-border", children: [_jsxs("div", { className: cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium", priority.colorClass), style: { backgroundColor: priority.bgSolid }, children: [_jsx(Flag, { className: "h-3 w-3" }), priority.label] }), formattedDueDate && (_jsxs("div", { className: cn("flex items-center gap-1 text-[10px]", isOverdue
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"), children: [_jsx(Calendar, { className: "h-3 w-3" }), formattedDueDate] }))] }), children] }));
}
