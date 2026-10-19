"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ordo-todo/ui";
import {
  BarChart3,
  FileText,
  TrendingUp,
  Target,
  Brain,
  Timer,
  CheckCircle2,
  Flame,
  Sparkles,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";

// Analytics components
import { DailyMetricsCard } from "@/components/analytics/daily-metrics-card";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { ProductivityInsights } from "@/components/analytics/productivity-insights";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import {
  ProjectTimeChart,
  TaskStatusChart,
} from "@/components/analytics/distribution-charts";

// Reports components
import { ReportCard } from "@/components/ai/report-card";
import { ReportDetail } from "@/components/ai/report-detail";
import { GenerateReportDialog } from "@/components/ai/generate-report-dialog";

// Hooks
import {
  useDailyMetrics,
  useDashboardStats,
  useProjectDistribution,
  useTaskStatusDistribution,
  useReports,
  useProductivityStreak,
  useWorkspaces,
} from "@/lib/api-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Skeleton,
} from "@ordo-todo/ui";

export default function InsightsPage() {
  const t = useTranslations("Analytics");
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "analytics";
  const [activeTab, setActiveTab] = useState(defaultTab);

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
      router.replace("/wellbeing");
      return;
    }
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, router, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/insights?tab=${val}`, { scroll: false });
  };

  // Analytics data
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  const { data: todayMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const todayMetrics = todayMetricsArray?.[0];
  const { data: dashboardStats } = useDashboardStats();
  const { data: projectData } = useProjectDistribution();
  const { data: statusData } = useTaskStatusDistribution();
  const { data: streakData } = useProductivityStreak();

  // Reports data
  const { data: reports, isLoading: reportsLoading } = useReports({
    limit: 20,
  });
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Derived KPI calculations
  const totalMinutes = dashboardStats?.minutes || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const formattedFocusTime =
    totalHours > 0
      ? `${totalHours}h ${remainingMinutes}m`
      : `${totalMinutes}m`;

  const totalTasks = dashboardStats?.tasks || 0;
  const totalPomodoros = dashboardStats?.pomodoros || 0;
  const focusScore =
    todayMetrics?.focusScore !== undefined
      ? todayMetrics.focusScore
      : Math.min(100, Math.round((totalPomodoros / 35) * 100));

  const streakDays = streakData?.currentStreak || 0;

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 shrink-0">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title") || "Insights"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>{t("subtitle") || "Visualiza tu productividad y progreso a lo largo del tiempo"}</span>
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
          </div>
        </div>

        {/* 4 Apple-grade KPI Cards with Micro-Halo Hover Effects */}
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
                {t("tasksCompleted") || "Tareas Completadas"}
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
                {t("streak") || "Racha Activa"}
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

        {/* Main Tabs */}
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
              {t("tabs.analytics") || "Analíticas"}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 text-purple-500" />
              {t("tabs.reports") || "Reportes"}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Daily Metrics */}
            <DailyMetricsCard />

            {/* Weekly Chart */}
            <WeeklyChart />

            {/* Distribution Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <ProjectTimeChart data={projectData || []} />
              <TaskStatusChart data={statusData || []} />
            </div>

            {/* Focus Score */}
            {todayMetrics?.focusScore !== undefined && (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label={t("focusScore.label")}
                  description={t("focusScore.description")}
                />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("focusScore.howToImprove")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{t("focusScore.tips.reduceBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{t("focusScore.tips.shortenBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{t("focusScore.tips.usePomodoro")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{t("focusScore.tips.eliminateDistractions")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* AI Insights */}
            <ProductivityInsights />

            {/* Peak Hours */}
            <PeakHoursChart />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-end">
              <GenerateReportDialog onSuccess={() => {}} />
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
                  {t("reports.emptyTitle") || "No hay reportes todavía"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md text-sm">
                  {t("reports.emptyDesc") ||
                    "Genera tu primer reporte de productividad para obtener insights personalizados sobre tu trabajo."}
                </p>
                <GenerateReportDialog />
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
                      {t("reports.detailTitle") || "Detalle del Reporte"}
                    </DialogTitle>
                  </div>
                </DialogHeader>
                {selectedReport && <ReportDetail report={selectedReport} />}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
