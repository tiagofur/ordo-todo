'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { BoardColumn } from './board-column.js';
import { KanbanTaskCard } from './kanban-task-card.js';

interface ProjectBoardProps {
  /** Tasks to display */
  tasks?: any[]; // Using any for flexibility as task structure can vary, ideally use Task interface
  /** Whether loading */
  isLoading?: boolean;
  /** Called when task is moved/updated */
  onUpdateTask?: (taskId: string, data: any) => void;
  /** Called when add task button is clicked in a column */
  onAddTaskClick?: (status: string) => void;
  /** Callback when task card is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Callback when edit is clicked */
  onEditClick?: (taskId: string) => void;
  /** Callback when delete is clicked */
  onDeleteClick?: (taskId: string) => void;
  /** Custom labels */
  labels?: {
    todo?: string;
    inProgress?: string;
    completed?: string;
    addTask?: string;
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
  };
}

export function ProjectBoard({
  tasks: serverTasks = [],
  isLoading = false,
  onUpdateTask,
  onAddTaskClick,
  onTaskClick,
  onEditClick,
  onDeleteClick,
  labels = {},
}: ProjectBoardProps) {
  const {
    todo = 'To Do',
    inProgress = 'In Progress',
    completed = 'Completed',
    addTask = 'Add Task',
    priorityLow = 'Low',
    priorityMedium = 'Medium',
    priorityHigh = 'High',
    priorityUrgent = 'Urgent',
    viewEdit = 'View/Edit',
    delete: deleteLabel = 'Delete',
  } = labels;

  // Local state for optimistic updates
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  // Sync server tasks to local state
  useEffect(() => {
    if (serverTasks) {
      setTasks(serverTasks);
    }
  }, [serverTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(
    () => [
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
    ],
    [todo, inProgress, completed]
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      const task = event.active.data.current.task;
      setActiveTask(task);
      setOriginalStatus(task.status); // Save original status for comparison in onDragEnd
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

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

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Get the current task from local state (with updated status from onDragOver)
    const currentTask = tasks.find((t) => t.id === active.id);

    // If status changed from original, persist to server
    if (
      currentTask &&
      originalStatus &&
      currentTask.status !== originalStatus
    ) {
      onUpdateTask?.(active.id as string, { status: currentTask.status });
    }

    // Reset drag state
    setActiveTask(null);
    setOriginalStatus(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Safe check for document to avoid SSR issues
  const overlayPortal = typeof document !== 'undefined' 
    ? createPortal(
        <DragOverlay>
          {activeTask && (
            <div className="w-80 opacity-80 rotate-2 cursor-grabbing">
              <KanbanTaskCard
                task={activeTask}
                labels={{
                  priorityLow,
                  priorityMedium,
                  priorityHigh,
                  priorityUrgent,
                  viewEdit,
                  delete: deleteLabel,
                }}
              />
            </div>
          )}
        </DragOverlay>,
        document.body
      )
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasks.filter((task) => task.status === column.id)}
            onAddTask={() => onAddTaskClick?.(column.id)}
            onTaskClick={onTaskClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            labels={{
              addTask,
              priorityLow,
              priorityMedium,
              priorityHigh,
              priorityUrgent,
              viewEdit,
              delete: deleteLabel,
            }}
          />
        ))}
      </div>

      {overlayPortal}
    </DndContext>
  );
}
