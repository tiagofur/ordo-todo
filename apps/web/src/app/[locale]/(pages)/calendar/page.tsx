"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Sparkles,
  GripVertical,
  Clock,
  LayoutGrid,
  Rocket,
  Plus,
} from "lucide-react";
import { type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { useTasks, useProjects, useCreateTask } from "@/lib/api-hooks";
import { TaskPriority, Task } from "@ordo-todo/api-client";
import { isCalendarDateToday, toCalendarDateString } from "@ordo-todo/core";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ConnectedTaskDetailPanel } from "@/components/task/task-card-compact";
import dynamic from "next/dynamic";

const CreateTaskDialog = dynamic(
  () =>
    import("@/components/task/create-task-dialog").then(
      (mod) => mod.CreateTaskDialog,
    ),
  { ssr: false },
);

const CALENDAR_ONBOARDING_KEY = "calendar-onboarding-seen";

export default function CalendarPage() {
  const t = useTranslations("Calendar");
  const router = useRouter();
  const { selectedWorkspaceId } = useWorkspaceStore();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: tasks } = useTasks();
  const { data: projects, isLoading: isLoadingProjects } = useProjects(
    selectedWorkspaceId || "",
  );
  const { mutateAsync: createTask } = useCreateTask();

  const stats = useMemo(() => {
    const list: Task[] = tasks || [];
    const todayTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        (isCalendarDateToday(task.scheduledDate) ||
          isCalendarDateToday(task.dueDate)),
    ).length;
    const scheduledTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        !!toCalendarDateString(task.scheduledDate || task.dueDate),
    ).length;
    const unscheduledTasks = list.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        !task.scheduledDate &&
        !task.scheduledTime,
    ).length;
    return { todayTasks, scheduledTasks, unscheduledTasks };
  }, [tasks]);

  const calendarOnboardingSteps: OnboardingStep[] = useMemo(
    () => [
      {
        id: "welcome",
        icon: Sparkles,
        color: "#3b82f6",
        title: t("onboarding.welcomeTitle"),
        description: t("onboarding.welcomeDesc"),
      },
      {
        id: "dragdrop",
        icon: GripVertical,
        color: "#3b82f6",
        title: t("onboarding.dragdropTitle"),
        description: t("onboarding.dragdropDesc"),
      },
      {
        id: "scheduling",
        icon: Clock,
        color: "#3b82f6",
        title: t("onboarding.schedulingTitle"),
        description: t("onboarding.schedulingDesc"),
      },
      {
        id: "views",
        icon: LayoutGrid,
        color: "#3b82f6",
        title: t("onboarding.viewsTitle"),
        description: t("onboarding.viewsDesc"),
      },
      {
        id: "getstarted",
        icon: Rocket,
        color: "#3b82f6",
        title: t("onboarding.getstartedTitle"),
        description: t("onboarding.getstartedDesc"),
      },
    ],
    [t],
  );

  return (
    <AppLayout>
      <div className="space-y-5 h-full flex flex-col min-h-0">
        {/* Header - Apple Style Unified Pattern */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-sm shadow-purple-600/25 shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Summary Pills */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span>{t("today")}:</span>
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
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-purple-600/25 transition-all duration-200 hover:bg-purple-700 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

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
      </div>

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <ConnectedTaskDetailPanel
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onOpenChange={(open) => {
            if (!open) setSelectedTaskId(null);
          }}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projects={projects?.map((p: any) => ({ id: p.id, name: p.name }))}
        isLoadingProjects={isLoadingProjects}
        onRequestCreateProject={() => {
          setShowCreateTask(false);
          router.push("/projects");
        }}
        onSubmit={async (data) => {
          await createTask({
            ...data,
            priority: data.priority as TaskPriority,
          });
          setShowCreateTask(false);
        }}
      />

      {/* Onboarding */}
      <FeatureOnboarding
        steps={calendarOnboardingSteps}
        storageKey={CALENDAR_ONBOARDING_KEY}
        skipText={t("onboarding.skip")}
        nextText={t("onboarding.next")}
        getStartedText={t("onboarding.getStarted")}
      />
    </AppLayout>
  );
}
