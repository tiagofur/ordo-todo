"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTask } from "./sortable-task.js";
import { Button } from "../ui/button.js";
import { Plus } from "lucide-react";
export function BoardColumn({ id, title, color, tasks, onAddTask, onTaskClick, onEditClick, onDeleteClick, labels = {} }) {
    const { setNodeRef } = useDroppable({
        id: id,
    });
    return (_jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${color}`, children: [_jsx("h3", { className: "font-semibold text-sm", children: title }), _jsx("span", { className: "text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full", children: tasks.length })] }), _jsxs("div", { ref: setNodeRef, className: "flex flex-col gap-3 min-h-[200px] flex-1", children: [_jsx(SortableContext, { items: tasks.map((t) => t.id), strategy: verticalListSortingStrategy, children: tasks.map((task, index) => (_jsx(SortableTask, { task: task, index: index, onTaskClick: onTaskClick, onEditClick: onEditClick, onDeleteClick: onDeleteClick, labels: {
                                priorityLow: labels.priorityLow,
                                priorityMedium: labels.priorityMedium,
                                priorityHigh: labels.priorityHigh,
                                priorityUrgent: labels.priorityUrgent,
                                viewEdit: labels.viewEdit,
                                delete: labels.delete,
                            } }, task.id))) }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5", onClick: onAddTask, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), labels.addTask ?? 'Add Task'] })] })] }));
}
