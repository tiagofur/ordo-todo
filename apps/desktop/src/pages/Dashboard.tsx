import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ListTodo,
  Target,
  Home,
  ArrowUpDown,
  Eye,
  EyeOff,
  List,
  LayoutGrid,
  Timer,
  FolderPlus,
  ListChecks,
} from "lucide-react";
import { Button, cn } from "@ordo-todo/ui";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { TaskCard } from "@/components/task/task-card";
import { useTasks } from "@/hooks/api/use-tasks";
import { useProjects } from "@/hooks/api/use-projects";
import { useDashboardStats, useDailyMetrics } from "@/hooks/api/use-analytics";
import { PageTransition, SlideIn, StaggerList, StaggerItem } from "@/components/motion";
import {
  StatsCard,
  ProductivityStreakWidget,
  UpcomingTasksWidget,
  TimerWidget,
  WeeklyActivityWidget,
  ActiveProjectsWidget,
} from "@/components/dashboard";

type SortOption = "priority" | "duration" | "created";
type ViewMode = "list" | "grid";

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // UI State
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Data hooks
  const { data: tasksData } = useTasks();
  const { data: projectsData } = useProjects();
  const { data: dashboardStats } = useDashboardStats();

  const tasks = tasksData ?? [];
  const projects = projectsData ?? [];

  // Accent color (matching Web)
  const accentColor = "#06b6d4"; // Cyan

  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Fetch daily metrics
  const { data: dailyMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const dailyMetrics = dailyMetricsArray?.[0];

  // Calculate stats
  const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t: any) => t.status !== "COMPLETED").length;

  // Filter today's tasks
  const todayStr = today.toISOString().split("T")[0];
  const todaysTasks = tasks.filter((t: any) => {
    // Check if task has dueDate = today
    if (t.dueDate) {
      const dueDate = new Date(t.dueDate);
      if (dueDate.toDateString() === today.toDateString()) {
        return true;
      }
    }

    // Check if task was completed today
    if (t.status === "COMPLETED") {
      if (t.completedAt) {
        const completedDate = new Date(t.completedAt);
        if (completedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
      if (t.updatedAt) {
        const updatedDate = new Date(t.updatedAt);
        if (updatedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
    }

    // Include pending tasks that are overdue or have no dueDate
    if (t.status === "TODO" || t.status === "IN_PROGRESS") {
      if (!t.dueDate) {
        return true;
      }
      const dueDate = new Date(t.dueDate);
      if (dueDate < startOfDay) {
        return true;
      }
    }

    return false;
  });

  // Get upcoming tasks (next 7 days, not completed)
  const upcomingTasks = tasks
    .filter((t: any) => {
      if (t.status === "COMPLETED" || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return dueDate >= startOfDay && dueDate <= sevenDaysFromNow;
    })
    .map((t: any) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority || "MEDIUM",
      project: t.project ? { name: t.project.name, color: t.project.color || "#6b7280" } : undefined,
    }));

  // Projects with progress
  const activeProjects = projects
    .filter((p: any) => !p.isArchived)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      color: p.color || "#6b7280",
      completedTasks: tasks.filter((t: any) => t.projectId === p.id && t.status === "COMPLETED").length,
      totalTasks: tasks.filter((t: any) => t.projectId === p.id).length,
    }));

  // Filter out completed tasks if showCompleted is false
  const filteredTasks = showCompleted
    ? todaysTasks
    : todaysTasks.filter((task: any) => task.status !== "COMPLETED");

  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a: any, b: any) => {
    // Completed tasks always go to the end
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;

    // Sort by selected option
    switch (sortBy) {
      case "priority": {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
        return aPriority - bPriority;
      }
      case "duration": {
        const aDuration = a.estimatedTime ?? Infinity;
        const bDuration = b.estimatedTime ?? Infinity;
        return aDuration - bDuration;
      }
      case "created": {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      default:
        return 0;
    }
  });

  // Count completed tasks for the toggle label
  const completedCount = todaysTasks.filter((task: any) => task.status === "COMPLETED").length;

  // Use metrics from backend
  const completedToday = dailyMetrics?.tasksCompleted ?? dashboardStats?.tasks ?? 0;
  const subtasksCompletedToday = (dailyMetrics as any)?.subtasksCompleted ?? 0;

  // Format time worked (from dashboardStats.minutes)
  const totalMinutesWorked = dashboardStats?.minutes ?? 0;
  const hoursWorked = Math.floor(totalMinutesWorked / 60);
  const minutesWorked = totalMinutesWorked % 60;
  const timeWorkedText =
    hoursWorked > 0
      ? `${hoursWorked}h ${minutesWorked}m`
      : minutesWorked > 0
        ? `${minutesWorked}m`
        : "0m";

  // Calculate productivity
  const productivity =
    dashboardStats && dashboardStats.pomodoros > 0
      ? `${Math.round((dashboardStats.tasks / (dashboardStats.tasks + 5)) * 100)}%`
      : totalTasks > 0 
        ? `${Math.round((completedTasks / totalTasks) * 100)}%`
        : "--";

  // Mock weekly data (TODO: integrate with real analytics)
  const weeklyData = [
    { date: "2025-12-01", completedTasks: 4, totalMinutes: 100, pomodoros: 4 },
    { date: "2025-12-02", completedTasks: 6, totalMinutes: 150, pomodoros: 6 },
    { date: "2025-12-03", completedTasks: 3, totalMinutes: 75, pomodoros: 3 },
    { date: "2025-12-04", completedTasks: 5, totalMinutes: 125, pomodoros: 5 },
    { date: "2025-12-05", completedTasks: completedToday, totalMinutes: totalMinutesWorked, pomodoros: dashboardStats?.pomodoros || 0 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
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
                  <Home className="h-6 w-6" />
                </div>
                {t("dashboard.today")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {new Date().toLocaleDateString(i18n.language, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </SlideIn>

        {/* Quick Stats */}
        <StaggerList className="grid gap-4 md:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title={t("dashboard.completed")}
              value={completedToday}
              icon={CheckCircle2}
              iconColor="text-cyan-500"
              iconBgColor="bg-cyan-500/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("dashboard.subtasks")}
              value={subtasksCompletedToday}
              icon={ListChecks}
              iconColor="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("dashboard.timeWorked")}
              value={timeWorkedText}
              icon={Clock}
              iconColor="text-amber-500"
              iconBgColor="bg-amber-500/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("dashboard.productivity")}
              value={productivity}
              icon={TrendingUp}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
            />
          </StaggerItem>
        </StaggerList>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Timer & Stats */}
          <div className="space-y-6 lg:col-span-2">
            {/* Timer Widget */}
            <SlideIn delay={0.1}>
              <TimerWidget onExpand={() => navigate("/timer")} />
            </SlideIn>

            {/* Weekly Activity */}
            <SlideIn delay={0.15}>
              <WeeklyActivityWidget days={weeklyData} />
            </SlideIn>
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            {/* Productivity Streak */}
            <SlideIn delay={0.1}>
              <ProductivityStreakWidget currentStreak={5} longestStreak={12} />
            </SlideIn>

            {/* Upcoming Tasks */}
            <SlideIn delay={0.15}>
              <UpcomingTasksWidget
                tasks={upcomingTasks}
                onTaskClick={(id) => navigate(`/tasks/${id}`)}
              />
            </SlideIn>

            {/* Active Projects */}
            <SlideIn delay={0.2}>
              <ActiveProjectsWidget
                projects={activeProjects}
                onProjectClick={(id) => navigate(`/projects/${id}`)}
                onViewAll={() => navigate("/projects")}
              />
            </SlideIn>
          </div>
        </div>

        {/* Today's Tasks Section */}
        <SlideIn delay={0.2}>
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Header with controls */}
            <div className="border-b p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">{t("dashboard.todaysTasks")}</h2>

              <div className="flex items-center gap-3">
                {/* View mode toggle */}
                <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 transition-all duration-200",
                      viewMode === "list"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                    title={t("dashboard.viewList")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 transition-all duration-200",
                      viewMode === "grid"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                    title={t("dashboard.viewGrid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="priority">{t("dashboard.sortOptions.priority")}</option>
                    <option value="duration">{t("dashboard.sortOptions.duration")}</option>
                    <option value="created">{t("dashboard.sortOptions.created")}</option>
                  </select>
                </div>

                {/* Show completed toggle */}
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border",
                    showCompleted
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {showCompleted ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {showCompleted ? t("dashboard.hideCompleted") : t("dashboard.showCompleted")}
                  </span>
                  {completedCount > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs font-medium",
                        showCompleted
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {completedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="p-6">
              {sortedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">
                    {!showCompleted && completedCount > 0
                      ? t("dashboard.allTasksCompleted")
                      : t("dashboard.noTasks")}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {!showCompleted && completedCount > 0
                      ? t("dashboard.tasksCompletedToday", { count: completedCount })
                      : t("dashboard.noTasksDescription")}
                  </p>
                  {!showCompleted && completedCount > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowCompleted(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {t("dashboard.showCompleted")}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowCreateTask(true)}
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                      }}
                      className="text-white hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("dashboard.createTask")}
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-3"
                  )}
                >
                  {sortedTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SlideIn>

        {/* Quick Actions FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          {showQuickActions && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setShowQuickActions(false)}
              />

              {/* Action buttons */}
              <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
                {/* Create Project */}
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    setShowCreateProject(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {t("dashboard.quickActionButtons.newProject")}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: "#8b5cf6" }}
                  >
                    <FolderPlus className="h-5 w-5" />
                  </div>
                </button>

                {/* Start Timer */}
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/timer");
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {t("dashboard.quickActionButtons.startTimer")}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    <Timer className="h-5 w-5" />
                  </div>
                </button>

                {/* Create Task */}
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    setShowCreateTask(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {t("dashboard.quickActionButtons.newTask")}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Main FAB Button */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300",
              showQuickActions ? "rotate-45" : "rotate-0"
            )}
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 25px -5px ${accentColor}60, 0 8px 10px -6px ${accentColor}40`,
            }}
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>

        {/* Dialogs */}
        <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
        />
      </div>
    </PageTransition>
  );
}
