import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";
import { PageTransition, SlideIn } from "@/components/motion";
import { useTasks } from "@/hooks/api";
import { Task } from "@ordo-todo/api-client";
import { isCalendarDateToday, toCalendarDateString } from "@ordo-todo/core";

export function Calendar() {
  const { t } = (useTranslation as any)();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: tasks } = useTasks();

  const stats = useMemo(() => {
    const list: Task[] = tasks || [];
    const todayTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        (isCalendarDateToday(task.scheduledDate) ||
          isCalendarDateToday(task.dueDate))
    ).length;
    const scheduledTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        !!toCalendarDateString(task.scheduledDate || task.dueDate)
    ).length;
    const unscheduledTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        !task.scheduledDate &&
        !task.scheduledTime
    ).length;
    return { todayTasks, scheduledTasks, unscheduledTasks };
  }, [tasks]);

  return (
    <PageTransition>
      <div className="space-y-5 h-full flex flex-col min-h-0">
        {/* Header - Apple Style Unified Pattern */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm shadow-blue-500/25 shrink-0">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
                  {t("Calendar.title") || "Calendario"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  {t("Calendar.subtitle") ||
                    "Visualiza y gestiona tus tareas en el tiempo"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Summary Pills */}
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{t("Calendar.today") || "Hoy"}:</span>
                <span className="font-bold text-foreground">
                  {stats.todayTasks}
                </span>
                <span className="text-border">|</span>
                <span>En calendario:</span>
                <span className="font-bold text-foreground">
                  {stats.scheduledTasks}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/25 transition-all duration-200 hover:bg-blue-600 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Tasks.newTask") || "Nueva Tarea"}</span>
              </button>
            </div>
          </div>
        </SlideIn>

        {/* Main Workspace: Calendar + Apple Day Inspector & Unscheduled Tray */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-5 pb-2 overflow-hidden">
          <main className="flex-1 min-h-[520px] lg:min-h-0 border border-border/60 rounded-2xl bg-card shadow-xs overflow-hidden h-full">
            <TaskCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectTask={setSelectedTaskId}
            />
          </main>

          <aside className="w-full lg:w-80 xl:w-88 shrink-0 h-full min-h-0">
            <UnscheduledTasks
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectTask={setSelectedTaskId}
              onCreateTask={() => setShowCreateTask(true)}
            />
          </aside>
        </div>

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
        />

        {/* Task Detail Drawer */}
        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            open={!!selectedTaskId}
            onOpenChange={(open) => {
              if (!open) setSelectedTaskId(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
}

export default Calendar;
