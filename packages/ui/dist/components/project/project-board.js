'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { BoardColumn } from './board-column.js';
import { KanbanTaskCard } from './kanban-task-card.js';
export function ProjectBoard({ tasks: serverTasks = [], isLoading = false, onUpdateTask, onAddTaskClick, onTaskClick, onEditClick, onDeleteClick, labels = {}, }) {
    const { todo = 'To Do', inProgress = 'In Progress', completed = 'Completed', addTask = 'Add Task', priorityLow = 'Low', priorityMedium = 'Medium', priorityHigh = 'High', priorityUrgent = 'Urgent', viewEdit = 'View/Edit', delete: deleteLabel = 'Delete', } = labels;
    // Local state for optimistic updates
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [originalStatus, setOriginalStatus] = useState(null);
    // Sync server tasks to local state
    useEffect(() => {
        if (serverTasks) {
            setTasks(serverTasks);
        }
    }, [serverTasks]);
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Prevent accidental drags
        },
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    const columns = useMemo(() => [
        {
            id: 'TODO',
            title: todo,
            color: 'bg-gray-500/10 border-gray-500/20',
        },
        {
            id: 'IN_PROGRESS',
            title: inProgress,
            color: 'bg-blue-500/10 border-blue-500/20',
        },
        {
            id: 'COMPLETED',
            title: completed,
            color: 'bg-green-500/10 border-green-500/20',
        },
    ], [todo, inProgress, completed]);
    const onDragStart = (event) => {
        if (event.active.data.current?.type === 'Task') {
            const task = event.active.data.current.task;
            setActiveTask(task);
            setOriginalStatus(task.status); // Save original status for comparison in onDragEnd
        }
    };
    const onDragOver = (event) => {
        const { active, over } = event;
        if (!over)
            return;
        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId)
            return;
        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        if (!isActiveTask)
            return;
        // Dropping over a task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);
                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        status: tasks[overIndex].status,
                    };
                    return arrayMove(newTasks, activeIndex, overIndex);
                }
                return arrayMove(tasks, activeIndex, overIndex);
            });
        }
        // Dropping over a column
        const isOverColumn = columns.some((col) => col.id === overId);
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                if (tasks[activeIndex].status !== overId) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        status: overId,
                    };
                    return arrayMove(newTasks, activeIndex, activeIndex); // Just update status, position handled by sortable
                }
                return tasks;
            });
        }
    };
    const onDragEnd = (event) => {
        const { active, over } = event;
        // Get the current task from local state (with updated status from onDragOver)
        const currentTask = tasks.find((t) => t.id === active.id);
        // If status changed from original, persist to server
        if (currentTask &&
            originalStatus &&
            currentTask.status !== originalStatus) {
            onUpdateTask?.(active.id, { status: currentTask.status });
        }
        // Reset drag state
        setActiveTask(null);
        setOriginalStatus(null);
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    // Safe check for document to avoid SSR issues
    const overlayPortal = typeof document !== 'undefined'
        ? createPortal(_jsx(DragOverlay, { children: activeTask && (_jsx("div", { className: "w-80 opacity-80 rotate-2 cursor-grabbing", children: _jsx(KanbanTaskCard, { task: activeTask, labels: {
                        priorityLow,
                        priorityMedium,
                        priorityHigh,
                        priorityUrgent,
                        viewEdit,
                        delete: deleteLabel,
                    } }) })) }), document.body)
        : null;
    return (_jsxs(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragStart: onDragStart, onDragOver: onDragOver, onDragEnd: onDragEnd, children: [_jsx("div", { className: "flex h-full gap-6 overflow-x-auto pb-4", children: columns.map((column) => (_jsx(BoardColumn, { id: column.id, title: column.title, color: column.color, tasks: tasks.filter((task) => task.status === column.id), onAddTask: () => onAddTaskClick?.(column.id), onTaskClick: onTaskClick, onEditClick: onEditClick, onDeleteClick: onDeleteClick, labels: {
                        addTask,
                        priorityLow,
                        priorityMedium,
                        priorityHigh,
                        priorityUrgent,
                        viewEdit,
                        delete: deleteLabel,
                    } }, column.id))) }), overlayPortal] }));
}
