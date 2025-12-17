import { useTasks, useUpdateTask } from "@/hooks/api/use-tasks";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
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
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "./board-column";
import { KanbanTaskCard } from "./kanban-task-card";
import { createPortal } from "react-dom";

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const { t } = (useTranslation as any)();
  const { data: serverTasks, isLoading } = useTasks(projectId);
  const updateTaskMutation = useUpdateTask();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

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
        id: "TODO",
        title: t("ProjectDetail.status.todo"),
        color: "bg-gray-500/10 border-gray-500/20",
      },
      {
        id: "IN_PROGRESS",
        title: t("ProjectDetail.status.inProgress"),
        color: "bg-blue-500/10 border-blue-500/20",
      },
      {
        id: "COMPLETED",
        title: t("ProjectDetail.status.completed"),
        color: "bg-green-500/10 border-green-500/20",
      },
    ],
    [t]
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
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

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

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
      updateTaskMutation.mutate({
        taskId: active.id as string,
        data: { status: currentTask.status },
      });
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
            onAddTask={() => setIsCreateTaskOpen(true)}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask && (
            <div className="w-80 opacity-80 rotate-2 cursor-grabbing">
              <KanbanTaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={projectId}
      />
    </DndContext>
  );
}
