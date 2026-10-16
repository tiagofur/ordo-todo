"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@ordo-todo/ui";
import { useState } from "react";
import {
  ArrowLeft,
  Settings,
  Archive,
  Trash2,
  Plus,
  List,
  LayoutGrid,
  CheckSquare,
  MoreHorizontal,
  CheckCircle2,
  LayoutDashboard,
  FolderKanban,
  Clock,
  Paperclip,
  Settings2,
} from "lucide-react";
import {
  useProject,
  useTasks,
  useArchiveProject,
  useCompleteProject,
  useDeleteProject,
  useCreateTask,
  useUpdateProject,
  useDeleteTask,
} from "@/lib/api-hooks";
import { AppLayout } from "@/components/shared/app-layout";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { ProjectSettingsDialog } from "@/components/project/project-settings-dialog";
import { ProjectBoard } from "@/components/project/project-board";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { ProjectFiles } from "@/components/project/project-files";
import { CustomFieldsEditor } from "@/components/project/custom-fields-editor";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TaskPriority } from "@ordo-todo/api-client";

type ViewMode = "list" | "grid";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("ProjectDetail");
  const projectId = params.projectId as string;
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const updateProject = useUpdateProject();
  const { mutateAsync: createTask } = useCreateTask();

  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);
  const projectTasks = tasks || [];

  const archiveProject = useArchiveProject();
  const completeProject = useCompleteProject();
  const deleteProject = useDeleteProject();
  const deleteTask = useDeleteTask();

  const handleArchive = () => {
    if (!project) return;
    const action = project.archived
      ? t("actions.unarchive")
      : t("actions.archive");

    if (confirm(`${t("confirmArchive")} ${action}?`)) {
      archiveProject.mutate(projectId, {
        onSuccess: () => {
          notify.success(t("toast.archived"));
          if (!project.archived) {
            router.push("/projects");
          }
        },
        onError: () => {
          notify.error(t("toast.archiveError"));
        },
      });
    }
  };

  const handleComplete = () => {
    if (!project) return;
    const isCompleted = project.status === "COMPLETED";

    if (confirm(!isCompleted ? t("confirmComplete") : t("confirmUncomplete"))) {
      completeProject.mutate(projectId, {
        onSuccess: () => {
          notify.success(
            !isCompleted ? t("toast.completed") : t("toast.uncompleted")
          );
        },
        onError: () => {
          notify.error(t("toast.completeError"));
        },
      });
    }
  };

  const handleDelete = () => {
    if (!project) return;
    if (confirm(t("confirmDelete"))) {
      deleteProject.mutate(projectId, {
        onSuccess: () => {
          notify.success(t("toast.deleted"));
          router.push("/projects");
        },
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm(t("confirmDeleteTask") || "Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          notify.success(t("toast.taskDeleted") || "Task deleted successfully");
        },
        onError: () => {
          notify.error(t("toast.taskDeleteError") || "Failed to delete task");
        },
      });
    }
  };

  if (isLoadingProject) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold">{t("notFound")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("notFoundDescription")}
          </p>
          <Button onClick={() => router.push("/projects")} className="mt-4">
            {t("backToProjects")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Group tasks by status
  const todoTasks = projectTasks.filter((task: any) => task.status === "TODO");
  const inProgressTasks = projectTasks.filter(
    (task: any) => task.status === "IN_PROGRESS"
  );
  const completedTasks = projectTasks.filter(
    (task: any) => task.status === "COMPLETED"
  );

  const displayColor =
    project.archived || project.status === "COMPLETED" ? "#6b7280" : project.color;

  // Calculate progress
  const totalTasks = projectTasks.length;
  const completedCount = completedTasks.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t("breadcrumbs.projects"), href: "/projects" },
            { label: project.name },
          ]}
        />

        {/* Project Header */}
        <div
          className="rounded-2xl border bg-card p-6 shadow-sm overflow-hidden relative"
        >
          {/* Subtle Project Color Glow Background */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 blur-3xl -mr-32 -mt-32 rounded-full transition-colors duration-500" 
            style={{ backgroundColor: `${displayColor}15` }}
          />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 shrink-0"
                  style={{ 
                    backgroundColor: displayColor, 
                    color: 'white',
                    boxShadow: `0 10px 15px -3px ${displayColor}40`
                  }}
                >
                  <FolderKanban className="h-7 w-7" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight truncate">
                      {project.name}
                    </h1>
                    <div className="flex gap-2">
                      {project.archived && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                          <Archive className="h-3.5 w-3.5" />
                          {t("badges.archived")}
                        </span>
                      )}
                      {project.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("badges.completed")}
                        </span>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="mt-2 text-muted-foreground line-clamp-2 max-w-2xl">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: displayColor }} />
                      <span>
                        <span className="text-foreground">
                          {projectTasks.length}
                        </span>{" "}
                        {projectTasks.length === 1
                          ? t("stats.task")
                          : t("stats.tasks")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>
                        <span className="text-foreground">
                          {completedTasks.length}
                        </span>{" "}
                        {t("stats.completed")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {!project.archived && project.status !== "COMPLETED" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200"
                    style={{ 
                        backgroundColor: displayColor,
                        boxShadow: `0 10px 15px -3px ${displayColor}40`
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t("addTask")}
                  </motion.button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 hover:bg-muted/50 border-border/50">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-border/50">
                    <DropdownMenuItem onClick={() => setShowSettings(true)} className="rounded-lg gap-2 py-2.5">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      {t("menu.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleComplete} className="rounded-lg gap-2 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {project.status === "COMPLETED" ? t("menu.markIncomplete") : t("menu.markComplete")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} className="rounded-lg gap-2 py-2.5">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      {project.archived ? t("menu.unarchive") : t("menu.archive")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="rounded-lg gap-2 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("menu.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress Bar in Header */}
            <div className="mt-6 flex flex-col gap-2">
               <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Progreso del Proyecto</span>
                  <span className="font-bold" style={{ color: displayColor }}>{progressPercent}%</span>
               </div>
               <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                        backgroundColor: displayColor,
                        boxShadow: `0 0 10px ${displayColor}40`
                    }}
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <List className="w-4 h-4" />
              {t("tabs.list")}
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              {t("tabs.board")}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="w-4 h-4" />
              {t("tabs.timeline")}
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Paperclip className="w-4 h-4" />
              {t("tabs.files")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings2 className="w-4 h-4" />
              {t("tabs.settings") || "Settings"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Tasks */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    {t("stats.totalTasks")}
                  </h3>
                  <List className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </div>

              {/* Completed */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    {t("stats.completedTasks")}
                  </h3>
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedCount}
                </div>
              </div>

              {/* In Progress */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    {t("status.inProgress")}
                  </h3>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inProgressTasks.length}
                </div>
              </div>

              {/* Progress */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    {t("overview.progress")}
                  </h3>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{progressPercent}%</div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: displayColor,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Tasks Preview */}
            {projectTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("overview.recentTasks")}
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {projectTasks.slice(0, 6).map((task: any, index: number) => (
                    <TaskCardCompact
                      key={task.id}
                      task={task}
                      index={index}
                      viewMode="grid"
                      showProject={false}
                      showGradient={true}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab (List/Grid view) */}
          <TabsContent value="tasks" className="space-y-6">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("tasksSection")}</h2>
            <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-lg"
                  style={viewMode === "list" ? { backgroundColor: displayColor, color: 'white' } : {}}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg"
                  style={viewMode === "grid" ? { backgroundColor: displayColor, color: 'white' } : {}}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tasks Content */}
            {isLoadingTasks ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : projectTasks.length === 0 ? (
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
                  {t("emptyState.title")}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {project.archived
                    ? t("emptyState.archivedDescription")
                    : project.status === "COMPLETED"
                      ? t("emptyState.completedDescription")
                      : t("emptyState.description")}
                </p>
                {!project.archived && project.status !== "COMPLETED" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200"
                    style={{ 
                        backgroundColor: displayColor,
                        boxShadow: `0 10px 15px -3px ${displayColor}40`
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t("addTask")}
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* To Do */}
                {todoTasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("status.todo")} ({todoTasks.length})
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
                      )}
                    >
                      {todoTasks.map((task: any, index: number) => (
                        <TaskCardCompact
                          key={task.id}
                          task={task}
                          index={index}
                          viewMode={viewMode}
                          showProject={false}
                          showGradient={true}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* In Progress */}
                {inProgressTasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("status.inProgress")} ({inProgressTasks.length})
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
                      )}
                    >
                      {inProgressTasks.map((task: any, index: number) => (
                        <TaskCardCompact
                          key={task.id}
                          task={task}
                          index={index}
                          viewMode={viewMode}
                          showProject={false}
                          showGradient={true}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completedTasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("status.completed")} ({completedTasks.length})
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
                      )}
                    >
                      {completedTasks.map((task: any, index: number) => (
                        <TaskCardCompact
                          key={task.id}
                          task={task}
                          index={index}
                          viewMode={viewMode}
                          showProject={false}
                          showGradient={true}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Board Tab (Kanban) */}
          <TabsContent value="board">
            <ProjectBoard projectId={projectId} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <ProjectTimeline projectId={projectId} />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <ProjectFiles projectId={projectId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <CustomFieldsEditor projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={projectId}
        onSubmit={async (data) => {
            await createTask({
            ...data,
            priority: data.priority as TaskPriority,
            projectId: projectId,
            });
            setShowCreateTask(false);
        }}
        />

      <ProjectSettingsDialog
        project={project}
        open={showSettings}
        onOpenChange={setShowSettings}
        onSubmit={async (data) => {
          await updateProject.mutateAsync({
            projectId: projectId,
            data,
          });
          setShowSettings(false);
        }}
      />
    </AppLayout>
  );
}
