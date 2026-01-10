"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flame, Clock, Trash2, GripVertical, Calendar, AlertTriangle, } from "lucide-react";
import { Card, Checkbox, Badge } from "../ui";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
const quadrants = [
    {
        id: "DO",
        title: "Hacer Primero",
        subtitle: "Urgente e Importante",
        icon: _jsx(Flame, { className: "h-5 w-5" }),
        color: "text-red-500",
        bgColor: "bg-red-500/5",
        borderColor: "border-red-500/30",
    },
    {
        id: "SCHEDULE",
        title: "Programar",
        subtitle: "Importante, No Urgente",
        icon: _jsx(Calendar, { className: "h-5 w-5" }),
        color: "text-blue-500",
        bgColor: "bg-blue-500/5",
        borderColor: "border-blue-500/30",
    },
    {
        id: "DELEGATE",
        title: "Delegar",
        subtitle: "Urgente, No Importante",
        icon: _jsx(Clock, { className: "h-5 w-5" }),
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/5",
        borderColor: "border-yellow-500/30",
    },
    {
        id: "DELETE",
        title: "Eliminar",
        subtitle: "Ni Urgente Ni Importante",
        icon: _jsx(Trash2, { className: "h-5 w-5" }),
        color: "text-gray-400",
        bgColor: "bg-gray-500/5",
        borderColor: "border-gray-500/30",
    },
];
// Determine quadrant based on task properties
function getTaskQuadrant(task) {
    const isUrgent = task.isUrgent ?? (task.priority === "URGENT" || task.priority === "HIGH" || isTaskDueSoon(task));
    const isImportant = task.isImportant ?? (task.priority === "URGENT" || task.priority === "HIGH" || task.priority === "MEDIUM");
    if (isUrgent && isImportant)
        return "DO";
    if (!isUrgent && isImportant)
        return "SCHEDULE";
    if (isUrgent && !isImportant)
        return "DELEGATE";
    return "DELETE";
}
function isTaskDueSoon(task) {
    if (!task.dueDate)
        return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
}
export function EisenhowerMatrix({ tasks, onTaskClick, onTaskComplete, onTaskMove, }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverQuadrant, setDragOverQuadrant] = useState(null);
    // Group tasks by quadrant
    const tasksByQuadrant = useMemo(() => {
        const grouped = {
            DO: [],
            SCHEDULE: [],
            DELEGATE: [],
            DELETE: [],
        };
        tasks.filter((t) => !t.completed).forEach((task) => {
            const quadrant = getTaskQuadrant(task);
            const quadrantArray = grouped[quadrant];
            if (quadrantArray) {
                quadrantArray.push(task);
            }
        });
        return grouped;
    }, [tasks]);
    const handleDragStart = (e, taskId) => {
        setDraggedTask(taskId);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
        }
    };
    const handleDragOver = (e, quadrantId) => {
        e.preventDefault();
        setDragOverQuadrant(quadrantId);
    };
    const handleDragLeave = () => {
        setDragOverQuadrant(null);
    };
    const handleDrop = (e, quadrantId) => {
        e.preventDefault();
        if (draggedTask && onTaskMove) {
            onTaskMove(draggedTask, quadrantId);
        }
        setDraggedTask(null);
        setDragOverQuadrant(null);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-primary" }), _jsx("h2", { className: "text-lg font-semibold", children: "Matriz de Eisenhower" })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-red-500" }), tasksByQuadrant.DO?.length ?? 0, " urgentes"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-blue-500" }), tasksByQuadrant.SCHEDULE?.length ?? 0, " importantes"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: quadrants.map((quadrant) => (_jsxs(Card, { className: cn("p-4 min-h-[200px] transition-all duration-200", quadrant.bgColor, quadrant.borderColor, dragOverQuadrant === quadrant.id && "ring-2 ring-primary scale-[1.02]"), onDragOver: (e) => handleDragOver(e, quadrant.id), onDragLeave: handleDragLeave, onDrop: (e) => handleDrop(e, quadrant.id), children: [_jsxs("div", { className: "flex items-center gap-2 mb-3 pb-2 border-b border-border/50", children: [_jsx("div", { className: cn("p-1.5 rounded-lg", quadrant.bgColor, quadrant.color), children: quadrant.icon }), _jsxs("div", { children: [_jsx("h3", { className: cn("font-semibold text-sm", quadrant.color), children: quadrant.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: quadrant.subtitle })] }), _jsx(Badge, { variant: "secondary", className: "ml-auto", children: tasksByQuadrant[quadrant.id]?.length ?? 0 })] }), _jsxs("div", { className: "space-y-2 max-h-[300px] overflow-y-auto pr-1", children: [_jsx(AnimatePresence, { children: (tasksByQuadrant[quadrant.id] ?? []).map((task) => (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.95 }, draggable: true, onDragStart: (e) => handleDragStart(e, task.id), className: cn("flex items-start gap-2 p-2 rounded-lg bg-card border cursor-grab", "hover:shadow-sm transition-all", draggedTask === task.id && "opacity-50"), children: [_jsx(GripVertical, { className: "h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" }), _jsx(Checkbox, { checked: task.completed, onCheckedChange: (checked) => onTaskComplete?.(task.id, checked), className: "mt-0.5" }), _jsxs("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: () => onTaskClick?.(task), children: [_jsx("p", { className: "text-sm font-medium truncate", children: task.title }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [task.project && (_jsx("span", { className: "text-xs px-1.5 py-0.5 rounded-full", style: {
                                                                    backgroundColor: `${task.project.color}20`,
                                                                    color: task.project.color
                                                                }, children: task.project.name })), task.dueDate && (_jsxs("span", { className: cn("text-xs flex items-center gap-1", isTaskDueSoon(task) ? "text-red-500" : "text-muted-foreground"), children: [isTaskDueSoon(task) && _jsx(AlertTriangle, { className: "h-3 w-3" }), format(new Date(task.dueDate), "d MMM", { locale: es })] }))] })] })] }, task.id))) }), (tasksByQuadrant[quadrant.id]?.length ?? 0) === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground text-sm", children: [_jsx("p", { children: "Sin tareas" }), _jsx("p", { className: "text-xs mt-1", children: "Arrastra tareas aqu\u00ED" })] }))] })] }, quadrant.id))) }), _jsxs("div", { className: "flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded bg-red-500/20 border-2 border-red-500" }), _jsx("span", { children: "Urgente + Importante = Hacer ahora" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded bg-blue-500/20 border-2 border-blue-500" }), _jsx("span", { children: "Solo Importante = Programar" })] })] })] }));
}
