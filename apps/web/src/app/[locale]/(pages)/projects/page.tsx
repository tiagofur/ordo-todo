"use client";

import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import {
  FolderKanban,
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  useProjects,
  useCreateProject,
  useWorkflows,
  useCreateWorkflow,
  useCreateTask,
  useTasks,
} from "@/lib/api-hooks";
import { ProjectCard } from "@/components/project/project-card";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { TaskPriority } from "@ordo-todo/api-client";
import { cn } from "@/lib/utils";

const CreateProjectDialog = dynamic(
  () =>
    import("@/components/project/create-project-dialog").then(
      (mod) => mod.CreateProjectDialog
    ),
  { ssr: false }
);

type StatusFilter = "all" | "active" | "completed" | "archived";
type ViewMode = "grid" | "list";

export default function ProjectsPage() {
  const t = useTranslations("Projects");
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Opened via the command palette or Ctrl+Shift+N (?action=new).
  // Client-only read (no useSearchParams → no Suspense requirement).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "new") {
      setShowCreateProject(true);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { selectedWorkspaceId } = useWorkspaceStore();

  const { data: projects, isLoading: isLoadingProjects } = useProjects(
    selectedWorkspaceId as string
  );
  const { data: tasks, isLoading: isLoadingTasks } = useTasks();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createTask } = useCreateTask();

  const { data: workflows } = useWorkflows(selectedWorkspaceId || "");
  const { mutateAsync: createWorkflow } = useCreateWorkflow();

  const isLoading = isLoadingProjects || isLoadingTasks;

  // Compute live KPIs for header
  const stats = useMemo(() => {
    const list = projects || [];
    const total = list.length;
    const archived = list.filter((p: any) => p.archived).length;
    const activeList = list.filter((p: any) => !p.archived);

    let completed = 0;
    let active = 0;

    for (const p of activeList) {
      const pTasks = (tasks || []).filter(
        (t: any) => String(t.projectId) === String(p.id)
      );
      const totalT = pTasks.length;
      const compT = pTasks.filter(
        (t: any) => t.status === "COMPLETED" || t.status === "DONE"
      ).length;
      if (totalT > 0 && compT === totalT) {
        completed++;
      } else {
        active++;
      }
    }

    return { total, active, completed, archived };
  }, [projects, tasks]);

  // Filter projects by search query and status filter
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project: any) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = project.name?.toLowerCase().includes(q);
        const matchDesc = project.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // 2. Status filter
      if (statusFilter === "archived") {
        return !!project.archived;
      }
      if (project.archived) {
        return false; // hide archived in all other tabs
      }

      const pTasks = (tasks || []).filter(
        (t: any) => String(t.projectId) === String(project.id)
      );
      const totalT = pTasks.length;
      const compT = pTasks.filter(
        (t: any) => t.status === "COMPLETED" || t.status === "DONE"
      ).length;
      const isCompleted = totalT > 0 && compT === totalT;

      if (statusFilter === "completed") {
        return isCompleted;
      }
      if (statusFilter === "active") {
        return !isCompleted;
      }

      return true;
    });
  }, [projects, tasks, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header - Apple Style Unified Pattern (matching Tasks & Calendar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-sm shadow-pink-500/25 shrink-0">
              <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6" />
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
            {/* Live Summary Pills */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              <span>Total:</span>
              <span className="font-bold text-foreground">{stats.total}</span>
              <span className="text-border">|</span>
              <span>Activos:</span>
              <span className="font-bold text-foreground">{stats.active}</span>
              <span className="text-border">|</span>
              <span>Completados:</span>
              <span className="font-bold text-foreground">{stats.completed}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-pink-500/25 transition-all duration-200 hover:bg-pink-600 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("newProject")}</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Status Filter Tabs + View Mode Toggle */}
        {selectedWorkspaceId && !isLoading && projects && projects.length > 0 && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Bar - Generous width with min-w to never squish */}
            <div className="relative w-full lg:w-72 2xl:w-80 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar proyectos..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs & View Toggle */}
            <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap sm:flex-nowrap">
              <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                {(
                  [
                    { key: "all", label: "Todos" },
                    { key: "active", label: "Activos" },
                    { key: "completed", label: "Completados" },
                    { key: "archived", label: "Archivados" },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setStatusFilter(filter.key)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-lg transition-all",
                      statusFilter === filter.key
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* View Switcher: Grid vs List */}
              <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Cuadrícula"
                  aria-label="Cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Cuadrícula</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    viewMode === "list"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Lista"
                  aria-label="Lista"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        {!selectedWorkspaceId ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 mb-4">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("selectWorkspace")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("selectWorkspaceDescription")}
            </p>
          </motion.div>
        ) : isLoading ? (
          viewMode === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl border border-border/60 bg-card/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl border border-border/60 bg-card/60 animate-pulse"
                />
              ))}
            </div>
          )
        ) : filteredProjects.length > 0 ? (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
              >
                {filteredProjects.map((project: any, index: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={tasks}
                    viewMode="grid"
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                {filteredProjects.map((project: any, index: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={tasks}
                    viewMode="list"
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        ) : hasActiveFilters ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              No se encontraron proyectos
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              No hay proyectos que coincidan con los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 mb-4">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("noProjects")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {t("noProjectsDescription")}
            </p>
            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-pink-500/25 transition-all duration-200 hover:bg-pink-600 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("createProject")}</span>
            </button>
          </motion.div>
        )}

        {/* Create Project Modal */}
        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          workspaceId={selectedWorkspaceId || undefined}
          workflows={workflows?.map((w) => ({ id: w.id, name: w.name })) || []}
          onSubmit={async (data, templateTasks) => {
            let workflowId = data.workflowId;

            if (!workflowId || workflowId === "NEW") {
              if (workflows && workflows.length > 0) {
                workflowId = workflows[0].id;
              } else if (selectedWorkspaceId) {
                const newWorkflow = await createWorkflow({
                  name: "Default Workflow",
                  workspaceId: selectedWorkspaceId,
                });
                workflowId = newWorkflow.id;
              }
            }

            const newProject = await createProject({
              name: data.name,
              description: data.description,
              color: data.color,
              workspaceId: data.workspaceId,
              workflowId: workflowId || "",
            });

            if (templateTasks && templateTasks.length > 0 && newProject?.id) {
              await Promise.all(
                templateTasks.map((task) =>
                  createTask({
                    title: task.title,
                    description: task.description,
                    priority: (task.priority as TaskPriority) || "MEDIUM",
                    projectId: newProject.id,
                  })
                )
              );
            }

            setShowCreateProject(false);
          }}
          onCreateWorkflow={async (wsId) => {
            const newWorkflow = await createWorkflow({
              name: "Default Workflow",
              workspaceId: wsId,
            });
            return newWorkflow.id;
          }}
        />
      </div>
    </AppLayout>
  );
}
