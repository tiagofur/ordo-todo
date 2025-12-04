import { CheckCircle2, Clock, TrendingUp, Plus, ListTodo, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/api/use-tasks";
import { useProjects } from "@/hooks/api/use-projects";
import {
  StatsCard,
  ProductivityStreakWidget,
  UpcomingTasksWidget,
  TimerWidget,
  WeeklyActivityWidget,
  ActiveProjectsWidget,
} from "@/components/dashboard";

export function Dashboard() {
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { data: tasksData } = useTasks();
  const { data: projectsData } = useProjects();

  const tasks = tasksData?.data ?? [];
  const projects = projectsData?.data ?? [];

  // Calculate stats
  const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t: any) => t.status !== "COMPLETED").length;

  // Filter today's tasks
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t: any) => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate).toISOString().split("T")[0];
    return taskDate === today;
  });

  // Tasks with due date for upcoming widget
  const upcomingTasks = tasks
    .filter((t: any) => t.dueDate && t.status !== "COMPLETED")
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

  // Mock weekly data (TODO: integrate with real analytics)
  const weeklyData = [
    { date: "2025-11-28", completedTasks: 3, totalMinutes: 75, pomodoros: 3 },
    { date: "2025-11-29", completedTasks: 5, totalMinutes: 125, pomodoros: 5 },
    { date: "2025-11-30", completedTasks: 2, totalMinutes: 50, pomodoros: 2 },
    { date: "2025-12-01", completedTasks: 4, totalMinutes: 100, pomodoros: 4 },
    { date: "2025-12-02", completedTasks: 6, totalMinutes: 150, pomodoros: 6 },
    { date: "2025-12-03", completedTasks: 3, totalMinutes: 75, pomodoros: 3 },
    { date: "2025-12-04", completedTasks: 0, totalMinutes: 0, pomodoros: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hoy</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Timer & Stats */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              title="Completadas"
              value={completedTasks}
              icon={CheckCircle2}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
            />
            <StatsCard
              title="Pendientes"
              value={pendingTasks}
              icon={ListTodo}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
            <StatsCard
              title="Para Hoy"
              value={todayTasks.length}
              icon={Target}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-500/10"
            />
            <StatsCard
              title="Productividad"
              value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
              icon={TrendingUp}
              iconColor="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />
          </div>

          {/* Timer Widget */}
          <TimerWidget onExpand={() => navigate("/timer")} />

          {/* Weekly Activity */}
          <WeeklyActivityWidget days={weeklyData} />
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-6">
          {/* Productivity Streak */}
          <ProductivityStreakWidget currentStreak={5} longestStreak={12} />

          {/* Upcoming Tasks */}
          <UpcomingTasksWidget
            tasks={upcomingTasks}
            onTaskClick={(id) => navigate(`/tasks/${id}`)}
          />

          {/* Active Projects */}
          <ActiveProjectsWidget
            projects={activeProjects}
            onProjectClick={(id) => navigate(`/projects/${id}`)}
            onViewAll={() => navigate("/projects")}
          />
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="rounded-2xl border bg-card">
        <div className="border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tareas de Hoy</h2>
          <span className="text-sm text-muted-foreground">
            {todayTasks.filter((t: any) => t.status === "COMPLETED").length}/{todayTasks.length} completadas
          </span>
        </div>
        <div className="p-6">
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No hay tareas para hoy</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Comienza creando tu primera tarea
              </p>
              <Button onClick={() => setShowCreateTask(true)}>Crear Tarea</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
    </div>
  );
}
