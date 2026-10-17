"use client";

import { useTasks, useUpdateTask, useCreateTask, useProject } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { cn } from "@/lib/utils";
import { 
  ProjectBoard as ProjectBoardLayout, 
  BoardColumn, 
  KanbanTaskCard 
} from "@ordo-todo/ui";
import type { UpdateTaskDto, Task } from "@ordo-todo/api-client";
import { TaskPriority } from "@ordo-todo/api-client";
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
import { sortableKeyboardCoordinates, arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { SortableTask } from "./sortable-task";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { parseCalendarDate, isCalendarDateOverdue } from "@ordo-todo/core";

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const t = useTranslations("ProjectBoard");
  const tCard = useTranslations("TaskCard");
  const { data: project } = useProject(projectId);
  const { data: serverTasks, isLoading } = useTasks(projectId);
  const updateTaskMutation = useUpdateTask();
  const { mutateAsync: createTask } = useCreateTask();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState<string>("TODO");

  // Local state for optimistic updates
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const hasCancelledTasks = useMemo(() => {
    return tasks.some((t) => t.status === "CANCELLED");
  }, [tasks]);

  useEffect(() => {
    if (serverTasks) {
      setTasks(serverTasks as Task[]);
    }
  }, [serverTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => {
    const projectSettings = (project as any)?.settings;
    const wipLimits = projectSettings?.wipLimits || {};
    const columnTitles = projectSettings?.columnTitles || {};

    // Base workflow stages from project settings if configured, otherwise standard statuses
    const configuredStages = projectSettings?.stages as Array<{ id: string; title: string; color?: string; wipLimit?: number }> | undefined;

    if (configuredStages && Array.isArray(configuredStages) && configuredStages.length > 0) {
      return configuredStages;
    }

    const inProgressWip = typeof wipLimits.IN_PROGRESS === 'number' ? wipLimits.IN_PROGRESS : 5;
    const todoWip = typeof wipLimits.TODO === 'number' ? wipLimits.TODO : undefined;
    const completedWip = typeof wipLimits.COMPLETED === 'number' ? wipLimits.COMPLETED : undefined;

    const cols = [
      { id: "TODO", title: columnTitles.TODO || t("columns.todo"), color: "border-slate-200", wipLimit: todoWip },
      { id: "IN_PROGRESS", title: columnTitles.IN_PROGRESS || t("columns.inProgress"), color: "border-blue-200", wipLimit: inProgressWip },
      { id: "COMPLETED", title: columnTitles.COMPLETED || t("columns.completed"), color: "border-green-200", wipLimit: completedWip },
    ];
    if (showCancelled || hasCancelledTasks) {
      cols.push({
        id: "CANCELLED",
        title: columnTitles.CANCELLED || (t as any)("columns.cancelled") || "Canceladas",
        color: "border-rose-200 dark:border-rose-900/50",
        wipLimit: typeof wipLimits.CANCELLED === 'number' ? wipLimits.CANCELLED : undefined,
      });
    }
    return cols;
  }, [t, showCancelled, hasCancelledTasks, project]);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      setOriginalStatus(event.active.data.current.task.status);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIdx = prev.findIndex((t) => t.id === active.id);
        const overIdx = prev.findIndex((t) => t.id === over.id);

        if (prev[activeIdx].status !== prev[overIdx].status) {
          const updated = [...prev];
          updated[activeIdx] = { ...updated[activeIdx], status: prev[overIdx].status };
          return arrayMove(updated, activeIdx, overIdx);
        }
        return arrayMove(prev, activeIdx, overIdx);
      });
    }

    const isOverColumn = columns.some((col) => col.id === over.id);
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIdx = prev.findIndex((t) => t.id === active.id);
        if (prev[activeIdx].status !== over.id) {
          const updated = [...prev];
          updated[activeIdx] = { ...updated[activeIdx], status: over.id as any };
          return arrayMove(updated, activeIdx, activeIdx);
        }
        return prev;
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const currentTask = tasks.find((t) => t.id === event.active.id);
    if (currentTask && originalStatus && currentTask.status !== originalStatus) {
      updateTaskMutation.mutate({ 
        taskId: String(event.active.id), 
        data: { status: currentTask.status } 
      });
    }
    setActiveTask(null);
    setOriginalStatus(null);
  };

  const handleAddTask = (status: string) => {
    setAddTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const labels = {
    priorityLow: tCard("priority.LOW"),
    priorityMedium: tCard("priority.MEDIUM"),
    priorityHigh: tCard("priority.HIGH"),
    priorityUrgent: tCard("priority.URGENT"),
    viewEdit: tCard("actions.viewEdit"),
    delete: tCard("actions.delete"),
    moreOptions: tCard("actions.moreOptions"),
  };

  const getPriorityInfo = (priority: string) => {
    const configs: Record<string, any> = {
      LOW: { label: labels.priorityLow, colorClass: "text-slate-500", bgSolid: "#f8fafc" },
      MEDIUM: { label: labels.priorityMedium, colorClass: "text-blue-500", bgSolid: "#eff6ff" },
      HIGH: { label: labels.priorityHigh, colorClass: "text-orange-500", bgSolid: "#fff7ed" },
      URGENT: { label: labels.priorityUrgent, colorClass: "text-red-500", bgSolid: "#fef2f2" },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = parseCalendarDate(date);
    if (!dateObj) return null;
    return format(dateObj, "d MMM", { locale: es });
  };

  const isOverdue = (task: Task) => {
    return isCalendarDateOverdue(task.dueDate, task.status === "COMPLETED");
  };

  const overlayPortal = typeof document !== "undefined" && activeTask
    ? createPortal(
        <DragOverlay>
          <div className="w-80 opacity-80 rotate-2 cursor-grabbing">
            <KanbanTaskCard 
              task={activeTask as any} 
              formattedDueDate={formatDueDate(activeTask.dueDate)}
              isOverdue={isOverdue(activeTask) ?? false}
              priorityInfo={getPriorityInfo(activeTask.priority)}
              labels={labels}
            />
          </div>
        </DragOverlay>,
        document.body
      )
    : null;

  return (
    <>
      <div className="flex items-center justify-end mb-3 px-1">
        <button
          type="button"
          onClick={() => setShowCancelled((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-muted cursor-pointer"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              showCancelled || hasCancelledTasks
                ? "bg-rose-500"
                : "bg-muted-foreground/30"
            )}
          />
          {showCancelled || hasCancelledTasks
            ? (t as any)("columns.cancelled") || "Canceladas"
            : (t as any)("toggleCancelled") || "Mostrar canceladas"}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <ProjectBoardLayout isLoading={isLoading}>
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color || "border-slate-200"}
              wipLimit={column.wipLimit}
              tasksCount={tasks.filter((t) => t.status === column.id).length}
              onAddTask={() => handleAddTask(column.id)}
              labels={{ addTask: t("addTask") }}
              setNodeRef={(node) => {/* dnd-kit uses useDroppable internally in its own components, but here we pass ref manually if needed */}}
            >
              <SortableContext 
                items={tasks.filter((t) => t.status === column.id).map(t => t.id)} 
                strategy={verticalListSortingStrategy}
              >
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      formattedDueDate={formatDueDate(task.dueDate)}
                      isOverdue={!!isOverdue(task)}
                      priorityInfo={getPriorityInfo(task.priority)}
                      labels={labels}
                    />
                  ))}
              </SortableContext>
            </BoardColumn>
          ))}
        </ProjectBoardLayout>
        {overlayPortal}
      </DndContext>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={projectId}
        onSubmit={async (data) => {
          try {
            const newTask = await createTask({
              ...data,
              priority: data.priority as TaskPriority,
              projectId: projectId,
            });

            // Update status if it's not the default
            const targetStatus = (data as any).status || addTaskStatus;
            if (targetStatus && targetStatus !== 'TODO') {
               await updateTaskMutation.mutateAsync({
                  taskId: newTask.id,
                  data: { status: targetStatus } as UpdateTaskDto
               });
            }
            setIsCreateTaskOpen(false);
          } catch {
            toast.error('Error al crear tarea');
          }
        }}
      />
    </>
  );
}
