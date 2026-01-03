"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTaskCard } from "@ordo-todo/ui";

interface SortableTaskProps {
  task: any;
  onTaskClick?: (taskId: string) => void;
  onEditClick?: (taskId: string) => void;
  onDeleteClick?: (taskId: string) => void;
  formattedDueDate?: string | null;
  isOverdue?: boolean;
  priorityInfo?: {
    label: string;
    colorClass: string;
    bgSolid: string;
  };
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
    moreOptions?: string;
  };
}

export function SortableTask({ 
  task, 
  onTaskClick, 
  onEditClick, 
  onDeleteClick, 
  formattedDueDate,
  isOverdue,
  priorityInfo,
  labels 
}: SortableTaskProps) {
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
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanTaskCard
        task={task}
        onTaskClick={onTaskClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        formattedDueDate={formattedDueDate}
        isOverdue={isOverdue}
        priorityInfo={priorityInfo}
        labels={labels}
      />
    </div>
  );
}
