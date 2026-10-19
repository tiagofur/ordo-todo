"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import { Task } from "@ordo-todo/api-client";
import {
  parseCalendarDate,
  toCalendarDateString,
  serializeCalendarDateForApi,
} from "@ordo-todo/core";
import { cn } from "@/lib/utils";
import { Button } from "@ordo-todo/ui";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DragStore } from "@/lib/drag-store";
import { toast } from "sonner";
import { ConnectedTaskDetailPanel } from "@/components/task/task-card-compact";
import { useQueryClient } from "@tanstack/react-query";

const locales: Record<string, typeof es> = {
  es,
  en: enUS,
  "pt-br": ptBR,
};

type CalendarViewMode = "month" | "week" | "day";

const WORK_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 to 22:00

const PRIORITY_DOT_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
};

const PRIORITY_WEIGHT: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export interface TaskCalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onSelectTask?: (taskId: string) => void;
}

export function getTaskCalendarDateKey(task: Task): string | null {
  const rawDate = task.scheduledDate || task.dueDate;
  if (!rawDate) return null;
  const key = toCalendarDateString(rawDate);
  return key || null;
}

export function TaskCalendar({
  selectedDate: externalSelectedDate,
  onSelectDate,
  onSelectTask,
}: TaskCalendarProps = {}) {
  const t = useTranslations("Calendar");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locales[locale] || es;
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();

  const [view, setView] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(() => new Date());
  const [internalSelectedTaskId, setInternalSelectedTaskId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const selectedDate = externalSelectedDate ?? internalSelectedDate;

  const handleSelectDate = (day: Date) => {
    setInternalSelectedDate(day);
    onSelectDate?.(day);
  };

  const handleSelectTask = (taskId: string) => {
    if (onSelectTask) {
      onSelectTask(taskId);
    } else {
      setInternalSelectedTaskId(taskId);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Group all tasks with scheduledDate OR dueDate by local YYYY-MM-DD key
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    if (!tasks) return map;

    for (const task of tasks) {
      const dateKey = getTaskCalendarDateKey(task);
      if (!dateKey) continue;
      const list = map.get(dateKey) || [];
      list.push(task);
      map.set(dateKey, list);
    }

    for (const [key, list] of map.entries()) {
      list.sort((a, b) => {
        const aDone = a.status === "COMPLETED" ? 1 : 0;
        const bDone = b.status === "COMPLETED" ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;

        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime && !b.scheduledTime) return -1;
        if (!a.scheduledTime && b.scheduledTime) return 1;

        return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
      });
      map.set(key, list);
    }

    return map;
  }, [tasks]);

  // Days for Month grid
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Days for Week grid
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Weekday headers (Mon - Sun)
  const weekdayHeaders = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), "EEE", { locale: dateLocale }).replace(".", "")
    );
  }, [dateLocale]);

  const navigatePrevious = () => {
    if (view === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else if (view === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      const prevDay = subDays(currentDate, 1);
      setCurrentDate(prevDay);
      handleSelectDate(prevDay);
    }
  };

  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else if (view === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      const nextDay = addDays(currentDate, 1);
      setCurrentDate(nextDay);
      handleSelectDate(nextDay);
    }
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    handleSelectDate(today);
  };

  const getDraggedTaskFromEvent = (e: React.DragEvent): Task | null => {
    const storeTask = DragStore.getDraggedTask();
    if (storeTask) return storeTask;
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (raw) return JSON.parse(raw) as Task;
    } catch {
      // Ignore invalid JSON payload
    }
    return null;
  };

  const scheduleTaskOnDay = async (
    task: Task,
    targetDay: Date,
    hour?: number
  ) => {
    const isoDate = serializeCalendarDateForApi(targetDay);
    if (!isoDate) return;

    const data: Record<string, unknown> = {
      scheduledDate: isoDate,
    };

    if (!task.dueDate) {
      data.dueDate = isoDate;
    }

    if (typeof hour === "number") {
      const startHour = String(hour).padStart(2, "0");
      const endHour = String(Math.min(hour + 1, 23)).padStart(2, "0");
      data.scheduledTime = `${startHour}:00`;
      data.scheduledEndTime = `${endHour}:00`;
      data.isTimeBlocked = true;
    } else if (task.scheduledTime) {
      data.scheduledTime = task.scheduledTime;
      data.scheduledEndTime = task.scheduledEndTime;
      data.isTimeBlocked = true;
    }

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: data as any,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "available"] });
      DragStore.setDraggedTask(null);
      handleSelectDate(targetDay);
      toast.success(t("taskScheduled"));
    } catch {
      toast.error(t("taskScheduleError"));
    }
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "move";
    DragStore.setDraggedTask(task);
  };

  const periodLabel = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: dateLocale });
    }
    if (view === "week") {
      const start = weekDays[0]!;
      const end = weekDays[6]!;
      if (isSameMonth(start, end)) {
        return `${format(start, "d", { locale: dateLocale })} – ${format(
          end,
          "d MMM yyyy",
          { locale: dateLocale }
        )}`;
      }
      return `${format(start, "d MMM", { locale: dateLocale })} – ${format(
        end,
        "d MMM yyyy",
        { locale: dateLocale }
      )}`;
    }
    return format(currentDate, "EEEE, d MMMM yyyy", { locale: dateLocale });
  }, [currentDate, view, weekDays, dateLocale]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-9 w-64 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-7 gap-2 flex-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted/50 animate-pulse min-h-[84px]" />
          ))}
        </div>
      </div>
    );
  }

  const currentHourFloat = now.getHours() + now.getMinutes() / 60;
  const showCurrentTimeLine = currentHourFloat >= 6 && currentHourFloat <= 23;
  const currentTimeTopPercent = ((currentHourFloat - 6) / 17) * 100;

  return (
    <div className="h-full flex flex-col bg-card text-foreground select-none overflow-hidden">
      {/* Apple-Style Calendar Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60 bg-card/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight capitalize text-foreground tabular-nums">
            {periodLabel}
          </h2>

          <div className="flex items-center rounded-xl border border-border/60 bg-muted/40 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={navigatePrevious}
              aria-label={t("previous")}
              className="h-7 w-7 rounded-lg hover:bg-background hover:shadow-2xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToday}
              className={cn(
                "h-7 px-3 text-xs font-semibold rounded-lg transition-all",
                isToday(currentDate) && isToday(selectedDate)
                  ? "text-blue-600 dark:text-blue-400 bg-background shadow-2xs"
                  : "text-foreground hover:bg-background hover:shadow-2xs"
              )}
            >
              {t("today")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateNext}
              aria-label={t("next")}
              className="h-7 w-7 rounded-lg hover:bg-background hover:shadow-2xs text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Segmented Control: Month / Week / Day */}
        <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40">
          {(["month", "week", "day"] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setView(mode);
                if (mode === "day") {
                  setCurrentDate(selectedDate);
                }
              }}
              className={cn(
                "px-3.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150",
                view === mode
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: APPLE CALENDAR MONTH GRID */}
      {view === "month" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20 shrink-0">
            {weekdayHeaders.map((dayName, idx) => (
              <div
                key={dayName + idx}
                className={cn(
                  "py-2.5 px-3 text-right text-[11px] font-semibold uppercase tracking-wider",
                  idx >= 5 ? "text-muted-foreground/70" : "text-muted-foreground"
                )}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border/40 gap-px min-h-0 overflow-y-auto">
            {monthDays.map((day) => {
              const dateKey = toCalendarDateString(day);
              const dayTasks = tasksByDate.get(dateKey) || [];
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);
              const selected = isSameDay(day, selectedDate);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isDragOver = dragOverKey === dateKey;

              const pendingTasksCount = dayTasks.filter(
                (item) => item.status !== "COMPLETED"
              ).length;

              return (
                <div
                  key={dateKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectDate(day)}
                  onDoubleClick={() => {
                    handleSelectDate(day);
                    setCurrentDate(day);
                    setView("day");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectDate(day);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverKey !== dateKey) setDragOverKey(dateKey);
                  }}
                  onDragLeave={() => {
                    if (dragOverKey === dateKey) setDragOverKey(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverKey(null);
                    const dragged = getDraggedTaskFromEvent(e);
                    if (dragged) {
                      void scheduleTaskOnDay(dragged, day);
                    }
                  }}
                  className={cn(
                    "group relative flex flex-col p-2 min-h-[96px] transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
                    inMonth
                      ? isWeekend
                        ? "bg-card/95 dark:bg-card/80"
                        : "bg-card"
                      : "bg-muted/25 text-muted-foreground/50",
                    today && "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]",
                    selected &&
                      "ring-2 ring-inset ring-blue-500 bg-blue-500/[0.05] dark:bg-blue-500/[0.10] z-10",
                    isDragOver &&
                      "ring-2 ring-inset ring-blue-500 bg-blue-500/15 z-20",
                    !selected && !today && "hover:bg-accent/30"
                  )}
                >
                  {/* Top Bar inside Day Cell: Activity Dots + Day Number */}
                  <div className="flex items-center justify-between gap-1 mb-1.5 shrink-0">
                    {/* Left: Task count & priority dots so busy days stand out immediately */}
                    <div className="flex items-center gap-1 min-w-0">
                      {today && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 leading-none">
                          {t("today")}
                        </span>
                      )}
                      {dayTasks.length > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/70">
                          <div className="flex items-center -space-x-0.5">
                            {dayTasks.slice(0, 3).map((taskItem) => (
                              <span
                                key={taskItem.id}
                                className="h-1.5 w-1.5 rounded-full ring-1 ring-card"
                                style={{
                                  backgroundColor:
                                    taskItem.status === "COMPLETED"
                                      ? "#10b981"
                                      : PRIORITY_DOT_COLORS[taskItem.priority] ||
                                        PRIORITY_DOT_COLORS.LOW,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground tabular-nums leading-none">
                            {pendingTasksCount > 0 ? pendingTasksCount : dayTasks.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Apple Calendar Date Badge */}
                    <span
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums transition-transform shrink-0",
                        today
                          ? "bg-blue-500 text-white font-bold shadow-xs shadow-blue-500/30"
                          : selected
                          ? "bg-foreground text-background font-bold"
                          : inMonth
                          ? "text-foreground group-hover:bg-muted"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Task Chips inside Day Cell */}
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isCompleted = task.status === "COMPLETED";
                      const dotColor =
                        PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.LOW;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleTaskDragStart(e, task)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDate(day);
                            handleSelectTask(task.id);
                          }}
                          className={cn(
                            "group/chip flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border border-border/60 bg-background/90 hover:bg-accent/60 hover:border-border transition-all cursor-pointer shadow-2xs",
                            isCompleted && "opacity-60"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: dotColor }}
                            />
                          )}
                          {task.scheduledTime && (
                            <span className="text-[10px] font-semibold text-muted-foreground tabular-nums shrink-0">
                              {task.scheduledTime}
                            </span>
                          )}
                          <span
                            className={cn(
                              "font-medium truncate text-foreground",
                              isCompleted && "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline tabular-nums">
                        +{dayTasks.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2 & 3: APPLE CALENDAR WEEK & DAY TIMELINE (NO SPREADSHEET!) */}
      {(view === "week" || view === "day") && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Day Column Headers */}
          <div
            className={cn(
              "grid border-b border-border/60 bg-muted/15 shrink-0",
              view === "week" ? "grid-cols-[64px_repeat(7,minmax(0,1fr))]" : "grid-cols-[64px_1fr]"
            )}
          >
            <div className="p-2 border-r border-border/40 flex items-center justify-center text-[10px] font-semibold text-muted-foreground uppercase">
              GMT
            </div>
            {(view === "week" ? weekDays : [currentDate]).map((day) => {
              const today = isToday(day);
              const selected = isSameDay(day, selectedDate);
              const dateKey = toCalendarDateString(day);
              const dayTasks = tasksByDate.get(dateKey) || [];

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={cn(
                    "py-2.5 px-2 flex flex-col items-center justify-center gap-1 border-r last:border-r-0 border-border/40 transition-colors",
                    today && "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]",
                    selected && "bg-blue-500/[0.06]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-wider",
                      today ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )}
                  >
                    {format(day, "EEE", { locale: dateLocale }).replace(".", "")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold tabular-nums",
                        today
                          ? "bg-blue-500 text-white shadow-xs shadow-blue-500/30"
                          : selected
                          ? "bg-foreground text-background"
                          : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground tabular-nums">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All-Day / Due Date Tasks Strip */}
          <div
            className={cn(
              "grid border-b border-border/60 bg-muted/10 shrink-0",
              view === "week" ? "grid-cols-[64px_repeat(7,minmax(0,1fr))]" : "grid-cols-[64px_1fr]"
            )}
          >
            <div className="p-2 border-r border-border/40 flex items-center justify-center text-[10px] font-medium text-muted-foreground text-center leading-tight">
              Todo el día
            </div>
            {(view === "week" ? weekDays : [currentDate]).map((day) => {
              const dateKey = toCalendarDateString(day);
              const allDayTasks = (tasksByDate.get(dateKey) || []).filter(
                (taskItem) => !taskItem.scheduledTime
              );
              const isDragOver = dragOverKey === `allday-${dateKey}`;

              return (
                <div
                  key={`allday-${dateKey}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverKey(`allday-${dateKey}`);
                  }}
                  onDragLeave={() => {
                    if (dragOverKey === `allday-${dateKey}`) setDragOverKey(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverKey(null);
                    const dragged = getDraggedTaskFromEvent(e);
                    if (dragged) {
                      void scheduleTaskOnDay(dragged, day);
                    }
                  }}
                  className={cn(
                    "p-1.5 min-h-[42px] border-r last:border-r-0 border-border/40 flex flex-wrap gap-1 content-start transition-colors",
                    isDragOver && "bg-blue-500/15"
                  )}
                >
                  {allDayTasks.map((task) => {
                    const isCompleted = task.status === "COMPLETED";
                    const dotColor =
                      PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.LOW;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleTaskDragStart(e, task)}
                        onClick={() => {
                          handleSelectDate(day);
                          handleSelectTask(task.id);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border border-border/60 bg-card hover:bg-accent/60 shadow-2xs cursor-pointer max-w-full",
                          isCompleted && "opacity-60 line-through"
                        )}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Focused Hourly Timeline (06:00 - 22:00) */}
          <div className="flex-1 overflow-y-auto relative">
            <div
              className={cn(
                "grid relative min-h-[952px]",
                view === "week"
                  ? "grid-cols-[64px_repeat(7,minmax(0,1fr))]"
                  : "grid-cols-[64px_1fr]"
              )}
            >
              {/* Left Hour Gutter */}
              <div className="border-r border-border/40 bg-muted/10">
                {WORK_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-14 pr-2 pt-1 text-right text-[11px] font-medium text-muted-foreground tabular-nums"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Day Timeline Columns */}
              {(view === "week" ? weekDays : [currentDate]).map((day) => {
                const dateKey = toCalendarDateString(day);
                const today = isToday(day);
                const timedTasks = (tasksByDate.get(dateKey) || []).filter(
                  (taskItem) => !!taskItem.scheduledTime
                );

                return (
                  <div
                    key={`timeline-${dateKey}`}
                    className={cn(
                      "relative border-r last:border-r-0 border-border/40",
                      today && "bg-blue-500/[0.02]"
                    )}
                  >
                    {/* Current Time Indicator Line */}
                    {today && showCurrentTimeLine && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{ top: `${currentTimeTopPercent}%` }}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 -ml-1.5 shadow-xs shadow-blue-500/50" />
                        <div className="h-[1.5px] w-full bg-blue-500" />
                      </div>
                    )}

                    {WORK_HOURS.map((hour) => {
                      const slotKey = `${dateKey}-${hour}`;
                      const isSlotDragOver = dragOverKey === slotKey;
                      const slotTasks = timedTasks.filter((taskItem) => {
                        const [h] = (taskItem.scheduledTime || "09:00")
                          .split(":")
                          .map(Number);
                        return h === hour;
                      });

                      return (
                        <div
                          key={slotKey}
                          onClick={() => handleSelectDate(day)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverKey !== slotKey) setDragOverKey(slotKey);
                          }}
                          onDragLeave={() => {
                            if (dragOverKey === slotKey) setDragOverKey(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverKey(null);
                            const dragged = getDraggedTaskFromEvent(e);
                            if (dragged) {
                              void scheduleTaskOnDay(dragged, day, hour);
                            }
                          }}
                          className={cn(
                            "h-14 border-b border-border/30 p-1 flex flex-col gap-1 transition-colors",
                            isSlotDragOver ? "bg-blue-500/15" : "hover:bg-accent/20"
                          )}
                        >
                          {slotTasks.map((task) => {
                            const isCompleted = task.status === "COMPLETED";
                            const dotColor =
                              PRIORITY_DOT_COLORS[task.priority] ||
                              PRIORITY_DOT_COLORS.LOW;

                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleTaskDragStart(e, task)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDate(day);
                                  handleSelectTask(task.id);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-border/70 bg-card hover:bg-accent/60 shadow-xs cursor-pointer transition-all",
                                  isCompleted && "opacity-60 line-through"
                                )}
                              >
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums shrink-0">
                                  {task.scheduledTime}
                                  {task.scheduledEndTime
                                    ? ` – ${task.scheduledEndTime}`
                                    : ""}
                                </span>
                                <span className="truncate text-foreground">
                                  {task.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fallback Task Details Modal if not handled by parent */}
      {!onSelectTask && internalSelectedTaskId && (
        <ConnectedTaskDetailPanel
          taskId={internalSelectedTaskId}
          open={!!internalSelectedTaskId}
          onOpenChange={(open) => {
            if (!open) setInternalSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
}
