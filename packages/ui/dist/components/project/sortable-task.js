"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTaskCard } from "./kanban-task-card.js";
export function SortableTask({ task, index, onTaskClick, onEditClick, onDeleteClick, labels }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: _jsx(KanbanTaskCard, { task: task, index: index, onTaskClick: onTaskClick, onEditClick: onEditClick, onDeleteClick: onDeleteClick, labels: labels }) }));
}
