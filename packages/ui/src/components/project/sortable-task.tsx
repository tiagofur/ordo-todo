"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTaskCard } from "./kanban-task-card.js";

interface SortableTaskProps {
  task: any;
  index: number;
  onTaskClick?: (taskId: string) => void;
  onEditClick?: (taskId: string) => void;
  onDeleteClick?: (taskId: string) => void;
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
  };
}

export function SortableTask({ task, index, onTaskClick, onEditClick, onDeleteClick, labels }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanTaskCard
        task={task}
        index={index}
        onTaskClick={onTaskClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        labels={labels}
      />
    </div>
  );
}
