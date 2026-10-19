import { useTasks, useUpdateTask } from "@/hooks/api";
import { useProject } from "@/lib/shared-hooks";
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
  const { data: project } = useProject(projectId);
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

  const hasCancelledTasks = useMemo(() => {
    return tasks.some((t) => t.status === "CANCELLED");
  }, [tasks]);

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

  const columns = useMemo(() => {
    const projectSettings = (project as any)?.settings;
    const wipLimits = projectSettings?.wipLimits || {};
    const columnTitles = projectSettings?.columnTitles || {};

    const configuredStages = projectSettings?.stages as
      | Array<{ id: string; title: string; color?: string; wipLimit?: number }>
      | undefined;

    if (
      configuredStages &&
      Array.isArray(configuredStages) &&
      configuredStages.length > 0
    ) {
      return configuredStages;
    }

    const inProgressWip =
      typeof wipLimits.IN_PROGRESS === "number" ? wipLimits.IN_PROGRESS : 5;
    const todoWip =
      typeof wipLimits.TODO === "number" ? wipLimits.TODO : undefined;
    const completedWip =
      typeof wipLimits.COMPLETED === "number" ? wipLimits.COMPLETED : undefined;

    const cols = [
      {
        id: "TODO",
        title: columnTitles.TODO || t("ProjectDetail.status.todo", "Por hacer"),
        color: "bg-gray-500/10 border-gray-500/20",
        wipLimit: todoWip,
      },
      {
        id: "IN_PROGRESS",
        title:
          columnTitles.IN_PROGRESS ||
          t("ProjectDetail.status.inProgress", "En progreso"),
        color: "bg-blue-500/10 border-blue-500/20",
        wipLimit: inProgressWip,
      },
      {
        id: "COMPLETED",
        title:
          columnTitles.COMPLETED ||
          t("ProjectDetail.status.completed", "Completadas"),
        color: "bg-green-500/10 border-green-500/20",
        wipLimit: completedWip,
      },
    ];

    if (hasCancelledTasks) {
      cols.push({
        id: "CANCELLED",
        title:
          columnTitles.CANCELLED ||
          t("ProjectDetail.status.cancelled", "Canceladas"),
        color: "bg-rose-500/10 border-rose-500/20",
        wipLimit:
          typeof wipLimits.CANCELLED === "number"
            ? wipLimits.CANCELLED
            : undefined,
      });
    }

    return cols;
  }, [project, t, hasCancelledTasks]);

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
            color={column.color || "bg-gray-500/10 border-gray-500/20"}
            wipLimit={column.wipLimit}
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
