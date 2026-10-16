"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Plus,
  CheckSquare,
  Tag as TagIcon,
  X,
  List,
  LayoutGrid,
  Grid2x2,
} from "lucide-react";
import { useTasks, useTags, useProjects, useCreateTask } from "@/lib/api-hooks";
import { TaskPriority } from "@ordo-todo/api-client";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { QuickFilters, useQuickFilters, FilterPreset } from "@/components/tasks/quick-filters";
import { ExportDataButton } from "@/components/data/export-data";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CreateTaskDialog = dynamic(
  () => import("@/components/task/create-task-dialog").then((mod) => mod.CreateTaskDialog),
  { ssr: false }
);

const EisenhowerMatrix = dynamic(
  () => import("@/components/tasks/eisenhower-matrix").then((mod) => mod.EisenhowerMatrix),
  { ssr: false }
);

type ViewMode = "list" | "grid" | "eisenhower";

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksPageContent />
    </Suspense>
  );
}

function TasksPageSkeleton() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-48" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function TasksPageContent() {
  const t = useTranslations("Tasks");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const initialView = searchParams.get("view") as ViewMode | null;
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialView === "eisenhower" ? "eisenhower" : "grid"
  );

  const tagId = searchParams.get("tag");
  const { data: tasks, isLoading } = useTasks();
  const { data: tags } = useTags(selectedWorkspaceId || "");
  const { data: projects, isLoading: isLoadingProjects } = useProjects(selectedWorkspaceId || "");
  const { mutateAsync: createTask } = useCreateTask();
  const queryClient = useQueryClient();
  const { filters, setFilters, applyFilters, hasActiveFilters } = useQuickFilters();

  const handleEisenhowerComplete = async (taskId: string, completed: boolean) => {
    try {
      await apiClient.updateTask(taskId, {
        status: completed ? "COMPLETED" : "TODO",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(completed ? t("taskCompleted") : t("taskReopened"));
    } catch {
      toast.error(t("taskUpdateError"));
    }
  };

  const handleEisenhowerMove = async (
    taskId: string,
    quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE"
  ) => {
    type TaskPriorityType = "HIGH" | "MEDIUM" | "LOW" | "URGENT";
    const priorityMap: Record<string, TaskPriorityType> = {
      DO: "URGENT",
      SCHEDULE: "HIGH",
      DELEGATE: "MEDIUM",
      DELETE: "LOW",
    };
    try {
      await apiClient.updateTask(taskId, { priority: priorityMap[quadrant] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("taskMoved"));
    } catch {
      toast.error(t("taskMoveError"));
    }
  };

  // Filter tasks by tag if tagId is present
  let filteredTasks = tagId && tasks
    ? tasks.filter((task: any) =>
        task.tags?.some((tag: any) => tag.id === tagId)
      )
    : tasks;

  // Filter tasks by workspace if selectedWorkspaceId is present
  if (filteredTasks && selectedWorkspaceId) {
    filteredTasks = filteredTasks.filter((task: any) => {
      const taskWorkspaceId = task.project?.workspace?.id || task.project?.workspaceId;
      if (taskWorkspaceId) {
        return taskWorkspaceId === selectedWorkspaceId;
      }
      if (projects && projects.length > 0) {
        return projects.some((p: any) => p.id === task.projectId);
      }
      return true;
    });
  }

  // Apply quick filters
  if (filteredTasks && hasActiveFilters) {
    filteredTasks = applyFilters(filteredTasks);
  }

  // Get the current tag info
  const currentTag =
    tagId && tags ? tags.find((tag: any) => tag.id === tagId) : null;

  const clearTagFilter = () => {
    router.push("/tasks");
  };

  const handlePresetSelect = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm shadow-purple-500/25"
              >
                <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{t("subtitle")}</p>

            {/* Active tag filter indicator */}
            {currentTag && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                style={{
                  borderColor: currentTag.color,
                }}
              >
                <TagIcon
                  className="h-4 w-4"
                  style={{ color: currentTag.color }}
                />
                <span
                  className="font-medium"
                  style={{ color: currentTag.color }}
                >
                  {currentTag.name}
                </span>
                <button
                  onClick={clearTagFilter}
                  className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                >
                  <X
                    className="h-3.5 w-3.5"
                    style={{ color: currentTag.color }}
                  />
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Export button */}
            <ExportDataButton
              data={{ tasks: tasks || [], projects: projects || [] }}
              filename="ordo-tasks"
            />

            {/* View mode toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card/60 p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "list"
                    ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={t("listView")}
                aria-label={t("listView")}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={t("gridView")}
                aria-label={t("gridView")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("eisenhower")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "eisenhower"
                    ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={t("eisenhowerView")}
                aria-label={t("eisenhowerView")}
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium bg-purple-500 text-white shadow-sm shadow-purple-500/25 hover:bg-purple-600 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("newTask")}</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Filters */}
        <QuickFilters
          activeFilters={filters}
          onFiltersChange={setFilters}
          onPresetSelect={handlePresetSelect}
        />

        {/* Eisenhower Matrix View */}
        {viewMode === "eisenhower" && !isLoading && filteredTasks ? (
          <EisenhowerMatrix
            tasks={(filteredTasks || []).map((t: any) => ({
              id: t.id,
              title: t.title,
              priority: t.priority || "LOW",
              dueDate: t.dueDate,
              isUrgent: t.isUrgent,
              isImportant: t.isImportant,
              completed: t.completed,
              project: t.project,
            }))}
            onTaskComplete={handleEisenhowerComplete}
            onTaskMove={handleEisenhowerMove}
          />
        ) : null}

        {/* Tasks Grid/List */}
        {viewMode !== "eisenhower" && isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            )}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl bg-muted animate-pulse",
                  viewMode === "grid" ? "h-48" : "h-20"
                )}
              />
            ))}
          </div>
        ) : viewMode !== "eisenhower" && filteredTasks && filteredTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            )}
          >
            {filteredTasks.map((task: any, index: number) => (
              <TaskCardCompact
                key={task.id}
                task={task}
                index={index}
                viewMode={viewMode}
                showProject={true}
                showGradient={true}
              />
            ))}
          </motion.div>
        ) : viewMode !== "eisenhower" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentTag ? t("noTasksWithTag") : hasActiveFilters ? t("noResults") : t("allClear")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {currentTag
                ? t("noTasksWithTagDescription", { tagName: currentTag.name })
                : hasActiveFilters
                ? t("noResultsDescription")
                : t("noPendingTasks")}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={() => setFilters({})}
                className="flex items-center gap-2 rounded-xl bg-muted text-foreground px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
                {t("clearFilters")}
              </button>
            ) : (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl bg-purple-500 text-white px-6 py-3 text-sm font-medium shadow-sm shadow-purple-500/25 transition-all duration-200 hover:bg-purple-600 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                {t("newTask")}
              </button>
            )}
          </motion.div>
        ) : null}
      </div>

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
    </AppLayout>
  );
}
