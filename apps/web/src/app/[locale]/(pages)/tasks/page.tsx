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
} from "lucide-react";
import { useTasks, useTags, useProjects } from "@/lib/api-hooks";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { QuickFilters, useQuickFilters, FilterPreset } from "@/components/tasks/quick-filters";
import { ExportDataButton } from "@/components/data/export-data";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const CreateTaskDialog = dynamic(
  () => import("@/components/task/create-task-dialog").then((mod) => mod.CreateTaskDialog),
  { ssr: false }
);

type ViewMode = "list" | "grid";

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
        <div className="h-12 w-48 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted/50 animate-pulse h-48" />
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const tagId = searchParams.get("tag");
  const { data: tasks, isLoading } = useTasks();
  const { data: tags } = useTags(selectedWorkspaceId || "");
  const { data: projects } = useProjects(selectedWorkspaceId || "");
  const { filters, setFilters, applyFilters, hasActiveFilters } = useQuickFilters();

  // Filter tasks by tag if tagId is present
  let filteredTasks = tagId && tasks
    ? tasks.filter((task: any) =>
        task.tags?.some((tag: any) => tag.id === tagId)
      )
    : tasks;

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
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: "#a855f7",
                  boxShadow: `0 10px 15px -3px #a855f740, 0 4px 6px -4px #a855f740`,
                }}
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
                  backgroundColor: `${currentTag.color}10`,
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
                  className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
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
            <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-all duration-200",
                  viewMode === "list"
                    ? "bg-purple-500/10 text-purple-500"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
                title="Vista de lista"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-purple-500/10 text-purple-500"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
                title="Vista de cuadrícula"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
              style={{
                backgroundColor: "#a855f7",
                boxShadow: `0 10px 15px -3px #a855f740, 0 4px 6px -4px #a855f740`,
              }}
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

        {/* Tasks Grid/List */}
        {isLoading ? (
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
                  "rounded-2xl bg-muted/50 animate-pulse",
                  viewMode === "grid" ? "h-48" : "h-20"
                )}
              />
            ))}
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentTag ? t("noTasksWithTag") : hasActiveFilters ? "Sin resultados" : t("allClear")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {currentTag
                ? t("noTasksWithTagDescription", { tagName: currentTag.name })
                : hasActiveFilters
                ? "No hay tareas que coincidan con los filtros seleccionados"
                : t("noPendingTasks")}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={() => setFilters({})}
                className="flex items-center gap-2 rounded-xl bg-purple-500/10 text-purple-500 px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-purple-500/20"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            ) : (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:bg-purple-600 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                {t("newTask")}
              </button>
            )}
          </motion.div>
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </AppLayout>
  );
}

