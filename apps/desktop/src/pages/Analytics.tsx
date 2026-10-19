import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Timer,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  Brain,
  BarChart3,
  FileText,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Clock,
  Activity,
} from "lucide-react";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
  ReportCard,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@ordo-todo/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { parseCalendarDate, toCalendarDateString } from "@ordo-todo/core";
import {
  WeeklyChart,
  PeakHoursHeatmap,
  FocusScoreGauge,
  ProductivityInsights,
  generateInsights,
  ProjectTimeChart,
  TaskStatusChart,
} from "@/components/analytics";
import {
  AIWeeklyReport,
  GenerateReportDialog,
  ReportDetail,
} from "@/components/ai";
import { PageTransition, SlideIn } from "@/components/motion";
import {
  useDailyMetrics,
  useWeeklyMetrics,
  useDashboardStats,
  useHeatmapData,
  useProjectDistribution,
  useTaskStatusDistribution,
  useProductivityStreak,
  useReports,
} from "@/hooks/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/lib/shared-hooks";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function Analytics() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "analytics";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const queryClient = useQueryClient();

  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "wellbeing") {
      navigate("/wellbeing");
      return;
    }
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, navigate, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  // Fetch Real Analytics Data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weeklyMetrics, isLoading: weeklyLoading } = useWeeklyMetrics();
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData();
  const { data: projectData } = useProjectDistribution();
  const { data: statusData } = useTaskStatusDistribution();
  const { data: streakData } = useProductivityStreak();
  const { data: reports, isLoading: reportsLoading } = useReports({ limit: 20 });
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Transform Weekly Metrics
  const weeklyData =
    weeklyMetrics?.map((m: any) => {
      const calendarDate = parseCalendarDate(m.date) || new Date(m.date);
      return {
        date: toCalendarDateString(m.date),
        dayName: format(calendarDate, "EEE", { locale: es }),
        pomodoros: m.pomodorosCount || 0,
        focusMinutes: m.focusDuration || 0,
        tasksCompleted: m.tasksCompletedCount || 0,
      };
    }) || [];

  const totalPomodoros = stats?.pomodoros || 0;
  const totalTasks = stats?.tasks || 0;
  const totalMinutes = stats?.minutes || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const formattedFocusTime =
    totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`;
  const avgPomodoros = stats?.avgPerDay || 0;

  // Focus score calculation
  const focusScore = Math.min(100, Math.round((totalPomodoros / 35) * 100));

  // Calculate Peak Hour from Heatmap
  const peakHour =
    heatmapData?.reduce(
      (max: any, current: any) => (current.value > max.value ? current : max),
      { value: -1, hour: 10 }
    ).hour || 10;

  // Calculate Top Project
  const topProjectData = projectData?.reduce(
    (max: any, current: any) => (current.value > max.value ? current : max),
    { name: "-", value: 0 }
  );

  const topProject = {
    name: topProjectData?.name || "N/A",
    tasks: topProjectData?.value || 0,
  };

  // Generate insights
  const insights = generateInsights({
    completedPomodoros: totalPomodoros,
    completedTasks: totalTasks,
    avgSessionLength:
      totalPomodoros > 0 ? Math.round(totalMinutes / totalPomodoros) : 0,
    peakHour,
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
  });

  // AI Report data
  const aiReportData = {
    totalPomodoros,
    totalTasks: totalTasks + 10,
    completedTasks: totalTasks,
    streak: streakData?.currentStreak || 0,
    avgPomodorosPerDay: avgPomodoros,
    peakHour,
    topProject,
    weeklyData: weeklyData.map((d: any) => ({
      day: d.dayName,
      pomodoros: d.pomodoros,
      tasks: d.tasksCompleted,
    })),
  };

  const streakDays = streakData?.currentStreak || 0;
  const isLoading = statsLoading || weeklyLoading || heatmapLoading;

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6 pb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-2xl w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-card rounded-2xl border border-border/60"
                />
              ))}
            </div>
            <div className="h-96 bg-card rounded-2xl border border-border/60" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("Analytics.title") || "Insights"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                  <span>
                    {t("Analytics.subtitle") ||
                      "Visualiza tu productividad y progreso a lo largo del tiempo"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Workspace Selector */}
              {workspaces.length > 0 && (
                <div className="relative inline-flex items-center">
                  <select
                    aria-label="Seleccionar espacio de trabajo"
                    value={activeWorkspaceId || ""}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors cursor-pointer shadow-xs"
                  >
                    {workspaces.map((ws: any) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
                </div>
              )}

              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 shadow-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                  <span>{t("Analytics.thisWeek") || "Esta semana"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* 4 Apple-grade KPI Cards with Micro-Halo Hover Effects */}
        <SlideIn direction="top" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Tiempo Enfocado */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#06b6d470";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(6, 182, 212, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Tiempo Enfocado
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 transition-transform duration-300 group-hover:scale-110">
                  <Timer className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {formattedFocusTime}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                ~{Math.round(totalMinutes / 7)}m promedio / día
              </p>
            </div>

            {/* Card 2: Tareas Completadas */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#10b98170";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Analytics.tasksCompleted") || "Tareas Completadas"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {totalTasks}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                Completadas con éxito
              </p>
            </div>

            {/* Card 3: Focus Score */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#8b5cf670";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Focus Score
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                  <Brain className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {focusScore}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {focusScore >= 80
                  ? "Excelente concentración"
                  : focusScore >= 50
                  ? "Rendimiento óptimo"
                  : "En desarrollo"}
              </p>
            </div>

            {/* Card 4: Racha Activa */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f9731670";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(249, 115, 22, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Analytics.streak") || "Racha Activa"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-transform duration-300 group-hover:scale-110">
                  <Flame className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {streakDays} {streakDays === 1 ? "día" : "días"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {streakDays > 0 ? "¡Mantén el impulso!" : "Inicia tu racha hoy"}
              </p>
            </div>
          </div>
        </SlideIn>

        {/* 3 Main Tabs: Analíticas, Reportes, Bienestar */}
        <SlideIn direction="top" delay={0.2}>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="bg-card border border-border/60 p-1 rounded-2xl shadow-xs">
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                {t("Analytics.tabs.analytics") || "Analíticas"}
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4 text-purple-500" />
                {t("Analytics.tabs.reports") || "Reportes"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ANALÍTICAS */}
            <TabsContent value="analytics" className="space-y-6">
              {/* AI Report Card */}
              <AIWeeklyReport data={aiReportData} />

              {/* Main Charts & Score Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <WeeklyChart data={weeklyData} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <ProjectTimeChart data={projectData || []} />
                    <TaskStatusChart data={statusData || []} />
                  </div>
                </div>

                <div className="space-y-6">
                  <FocusScoreGauge
                    score={focusScore}
                    previousScore={Math.max(0, focusScore - 5)}
                  />
                  <ProductivityInsights insights={insights} />
                </div>
              </div>

              {/* Peak Hours Heatmap */}
              <PeakHoursHeatmap data={(heatmapData || []) as any} />

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                  <h3 className="text-xs sm:text-sm text-muted-foreground font-medium mb-1.5">
                    Tiempo Total Enfocado
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{Math.round(totalMinutes / 7)}min promedio por día
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                  <h3 className="text-xs sm:text-sm text-muted-foreground font-medium mb-1.5">
                    Mejor Día
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {
                      weeklyData.reduce(
                        (prev: any, current: any) =>
                          prev.pomodoros > current.pomodoros ? prev : current,
                        { dayName: "-" }
                      ).dayName
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.max(...weeklyData.map((d: any) => d.pomodoros), 0)}{" "}
                    pomodoros completados
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                  <h3 className="text-xs sm:text-sm text-muted-foreground font-medium mb-1.5">
                    Eficiencia Estimada
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {Math.min(98, Math.max(70, focusScore + 10))}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sesiones completadas con consistencia
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: REPORTES IA */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex justify-end">
                <GenerateReportDialog
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["reports"] });
                  }}
                />
              </div>

              {reportsLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {reports.map((report: any) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onClick={() => setSelectedReport(report)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-2xl bg-card">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                    <FileText className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("Analytics.reports.emptyTitle") ||
                      "No hay reportes todavía"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md text-sm">
                    {t("Analytics.reports.emptyDesc") ||
                      "Genera tu primer reporte de productividad para obtener insights personalizados sobre tu trabajo."}
                  </p>
                  <GenerateReportDialog
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["reports"] });
                    }}
                  />
                </div>
              )}

              {/* Report Detail Dialog */}
              <Dialog
                open={!!selectedReport}
                onOpenChange={() => setSelectedReport(null)}
              >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
                  <DialogHeader>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(null)}
                        className="mr-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <DialogTitle>
                        {t("Analytics.reports.detailTitle") ||
                          "Detalle del Reporte"}
                      </DialogTitle>
                    </div>
                  </DialogHeader>
                  {selectedReport && <ReportDetail report={selectedReport} />}
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
