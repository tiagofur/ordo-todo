"use client";

import { useMemo, useState } from "react";
import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import { format, isToday } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import {
  GripVertical,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { ScrollArea, Badge, Button } from "@ordo-todo/ui";
import { DragStore } from "@/lib/drag-store";
import { useLocale, useTranslations } from "next-intl";
import { Task } from "@ordo-todo/api-client";
import {
  isCalendarDateOverdue,
  toCalendarDateString,
  serializeCalendarDateForApi,
} from "@ordo-todo/core";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const dateLocaleMap: Record<string, typeof es> = {
  es,
  en: enUS,
  "pt-br": ptBR,
};

const priorityColors: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
};

export interface UnscheduledTasksProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onSelectTask?: (taskId: string) => void;
  onCreateTask?: () => void;
}

export function UnscheduledTasks({
  selectedDate = new Date(),
  onSelectDate,
  onSelectTask,
  onCreateTask,
}: UnscheduledTasksProps) {
  const t = useTranslations("Calendar");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = dateLocaleMap[locale] || es;
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const [isAgendaDragOver, setIsAgendaDragOver] = useState(false);

  const selectedDateKey = toCalendarDateString(selectedDate);
  const selectedIsToday = isToday(selectedDate);

  // Tasks for the currently selected day (either scheduledDate or dueDate)
  const selectedDayTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task: Task) => {
        const key = toCalendarDateString(task.scheduledDate || task.dueDate);
        return key === selectedDateKey;
      })
      .sort((a: Task, b: Task) => {
        const aDone = a.status === "COMPLETED" ? 1 : 0;
        const bDone = b.status === "COMPLETED" ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        return a.scheduledTime ? -1 : 1;
      });
  }, [tasks, selectedDateKey]);

  // Tasks without a scheduledDate and not completed
  const unscheduledTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (task: Task) =>
        !task.scheduledDate &&
        !task.scheduledTime &&
        task.status !== "COMPLETED"
    );
  }, [tasks]);

  const onDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "move";
    DragStore.setDraggedTask(task);
  };

  const handleAssignToSelectedDate = async (task: Task) => {
    const isoDate = serializeCalendarDateForApi(selectedDate);
    if (!isoDate) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: {
          scheduledDate: isoDate,
          dueDate: task.dueDate || isoDate,
          isTimeBlocked: true,
        } as any,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "available"] });
      DragStore.setDraggedTask(null);
      toast.success(t("taskScheduled"));
    } catch {
      toast.error(t("taskScheduleError"));
    }
  };

  const handleToggleComplete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const nextStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: { status: nextStatus as any },
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "available"] });
    } catch {
      toast.error(t("taskMoveError"));
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="h-56 rounded-2xl border border-border/60 bg-card p-4 animate-pulse" />
        <div className="flex-1 rounded-2xl border border-border/60 bg-card p-4 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* SECTION 1: Selected Day Inspector (Apple Agenda Style) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isAgendaDragOver) setIsAgendaDragOver(true);
        }}
        onDragLeave={() => setIsAgendaDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsAgendaDragOver(false);
          const dragged = DragStore.getDraggedTask();
          if (dragged) {
            void handleAssignToSelectedDate(dragged);
          }
        }}
        className={cn(
          "flex flex-col rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden transition-all max-h-[48%] min-h-[210px]",
          isAgendaDragOver && "ring-2 ring-blue-500 bg-blue-500/[0.04]"
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between gap-2 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs tabular-nums shrink-0",
                selectedIsToday
                  ? "bg-blue-500 text-white shadow-xs shadow-blue-500/25"
                  : "bg-muted text-foreground"
              )}
            >
              {format(selectedDate, "d")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold capitalize text-foreground truncate">
                  {format(selectedDate, "EEEE, d MMM", { locale: dateLocale })}
                </h3>
                {selectedIsToday && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    {t("today")}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {selectedDayTasks.length === 0
                  ? "Sin tareas para este día"
                  : `${selectedDayTasks.length} ${
                      selectedDayTasks.length === 1 ? "tarea" : "tareas"
                    }`}
              </p>
            </div>
          </div>

          {!selectedIsToday && onSelectDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectDate(new Date())}
              className="h-7 px-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg shrink-0"
            >
              {t("today")}
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {selectedDayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Día despejado
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[210px]">
                  Arrastra una tarea aquí o usa el botón rápido para asignarla a este día.
                </p>
                {onCreateTask && (
                  <button
                    type="button"
                    onClick={onCreateTask}
                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Crear tarea
                  </button>
                )}
              </div>
            ) : (
              selectedDayTasks.map((task: Task) => {
                const isCompleted = task.status === "COMPLETED";
                const dotColor =
                  priorityColors[task.priority] || priorityColors.LOW;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask?.(task.id)}
                    className={cn(
                      "group flex items-start gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background hover:bg-accent/40 transition-all cursor-pointer",
                      isCompleted && "opacity-60"
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleToggleComplete(e, task)}
                      className="mt-0.5 text-muted-foreground hover:text-blue-500 transition-colors shrink-0"
                      aria-label={isCompleted ? "Reabrir tarea" : "Completar tarea"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        <p
                          className={cn(
                            "text-xs font-semibold text-foreground truncate",
                            isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground tabular-nums">
                        {task.scheduledTime ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <Clock className="h-2.5 w-2.5" />
                            {task.scheduledTime}
                            {task.scheduledEndTime
                              ? ` – ${task.scheduledEndTime}`
                              : ""}
                          </span>
                        ) : (
                          <span>Todo el día</span>
                        )}
                        {(task as any).project && (
                          <span className="truncate max-w-[100px]">
                            • {(task as any).project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* SECTION 2: Unscheduled Tasks Tray */}
      <div className="flex-1 flex flex-col rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden min-h-0">
        <div className="py-3 px-4 border-b border-border/60 flex items-center gap-2 bg-muted/15 shrink-0">
          <CalendarClock className="h-4 w-4 text-blue-500 shrink-0" />
          <h3 className="text-xs font-bold tracking-tight text-foreground truncate">
            {t("unscheduledTasks")}
          </h3>
          <Badge
            variant="secondary"
            className="ml-auto h-5 px-1.5 min-w-[20px] justify-center text-[11px] font-semibold tabular-nums"
          >
            {unscheduledTasks.length}
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {unscheduledTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {t("noUnscheduledTasks")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("noUnscheduledTasksDescription")}
                </p>
              </div>
            ) : (
              unscheduledTasks.map((task: Task) => (
                <div
                  key={task.id}
                  draggable="true"
                  onDragStart={(e) => onDragStart(e, task)}
                  onClick={() => onSelectTask?.(task.id)}
                  className="group relative flex items-start gap-2 p-2.5 rounded-xl border border-border/60 bg-background hover:bg-accent/40 hover:border-border transition-all cursor-grab active:cursor-grabbing shadow-2xs"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 group-hover:text-muted-foreground transition-colors shrink-0" />
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{
                      backgroundColor:
                        priorityColors[task.priority] || priorityColors.LOW,
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2 text-foreground">
                      {task.title}
                    </p>
                    <div className="flex items-center flex-wrap gap-1.5 mt-1 text-[10px] text-muted-foreground tabular-nums">
                      {(task as any).project && (
                        <div className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                (task as any).project.color || "#666",
                            }}
                          />
                          <span className="truncate max-w-[90px]">
                            {(task as any).project.name}
                          </span>
                        </div>
                      )}
                      {task.estimatedMinutes && (
                        <span>• {task.estimatedMinutes}m</span>
                      )}
                      {task.dueDate && (
                        <span
                          className={
                            isCalendarDateOverdue(task.dueDate)
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          •{" "}
                          {format(new Date(task.dueDate), "d MMM", {
                            locale: dateLocale,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick 1-Click Assign to Selected Day */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleAssignToSelectedDate(task);
                    }}
                    title={`Programar el ${format(selectedDate, "d MMM", {
                      locale: dateLocale,
                    })}`}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-all shrink-0"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
