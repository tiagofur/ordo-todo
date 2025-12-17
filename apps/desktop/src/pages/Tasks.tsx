import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Plus, CheckSquare, Tag as TagIcon, X, List, LayoutGrid } from "lucide-react";
import { TaskCard } from "@/components/task/task-card";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { useTasks, useTags } from "@/hooks/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";

export function Tasks() {
  const { t } = (useTranslation as any)();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const tagId = searchParams.get("tag");
  // Filters are handled client-side or pending backend update for workspace scoping
  const { data: tasks, isLoading } = useTasks();
  const { data: tags } = useTags(selectedWorkspaceId || "");

  // Accent color (purple like Web)
  const accentColor = "#a855f7"; // Purple-500

  // Filter tasks by tag if tagId is present
  const filteredTasks = tagId && tasks
    ? tasks.filter((task: any) =>
        task.tags?.some((tag: any) => tag.id === tagId)
      )
    : tasks;

  // Get the current tag info
  const currentTag = tagId && tags 
    ? tags.find((tag: any) => tag.id === tagId) 
    : null;

  const clearTagFilter = () => {
    searchParams.delete("tag");
    setSearchParams(searchParams);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Styled like Web */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <CheckSquare className="h-6 w-6" />
                </div>
                {t("Tasks.title") || "Tareas"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Tasks.subtitle") || "Gestiona tus tareas diarias"}
              </p>

              {/* Active tag filter indicator */}
              {currentTag && (
                <div
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
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
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
                  title={t("Tasks.listView") || "Vista de lista"}
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
                  title={t("Tasks.gridView") || "Vista de cuadrícula"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("Tasks.newTask") || "Nueva Tarea"}
              </button>
            </div>
          </div>
        </SlideIn>

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
          <FadeIn delay={0.1}>
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-3"
              )}
            >
              {filteredTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <CheckSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {currentTag
                  ? t("Tasks.noTasksWithTag") || "No hay tareas con esta etiqueta"
                  : t("Tasks.allClear") || "¡Todo listo!"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {currentTag
                  ? t("Tasks.noTasksWithTagDescription") || `No hay tareas con la etiqueta "${currentTag.name}"`
                  : t("Tasks.noPendingTasks") || "No tienes tareas pendientes. ¡Buen trabajo!"}
              </p>
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("Tasks.createTask") || "Crear Tarea"}
              </button>
            </div>
          </FadeIn>
        )}

        <CreateTaskDialog
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
        />
      </div>
    </PageTransition>
  );
}
