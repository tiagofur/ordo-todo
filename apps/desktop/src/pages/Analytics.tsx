import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight, Timer, CheckCircle2, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  WeeklyChart,
  PeakHoursHeatmap,
  FocusScoreGauge,
  ProductivityInsights,
  generateInsights,
  ProjectTimeChart,
  TaskStatusChart
} from "@/components/analytics";
import { StatsCard } from "@/components/dashboard";
import { AIWeeklyReport } from "@/components/ai";
import { PageTransition, SlideIn, StaggerList, StaggerItem } from "@/components/motion";
import { 
  useDashboardStats, 
  useWeeklyMetrics, 
  useHeatmapData,
  useProjectDistribution,
  useTaskStatusDistribution
} from "@/hooks/api/use-analytics";

export function Analytics() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("week");
  
  // Fetch Real Data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: weeklyMetrics, isLoading: weeklyLoading } = useWeeklyMetrics();
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData();
  const { data: projectData } = useProjectDistribution();
  const { data: statusData } = useTaskStatusDistribution();

  // Transform Weekly Metrics
  const weeklyData = weeklyMetrics?.map((m: any) => ({
    date: new Date(m.date).toISOString().split('T')[0],
    dayName: format(new Date(m.date), "EEE", { locale: es }),
    pomodoros: m.pomodorosCount || 0,
    focusMinutes: m.focusDuration || 0,
    tasksCompleted: m.tasksCompletedCount || 0,
  })) || [];
  
  const totalPomodoros = stats?.pomodoros || 0;
  const totalTasks = stats?.tasks || 0;
  const totalMinutes = stats?.minutes || 0;
  const avgPomodoros = stats?.avgPerDay || 0;
  
  // Focus score calculation (simplified)
  const focusScore = Math.min(100, Math.round((totalPomodoros / 35) * 100));
  
  // Generate insights
  const insights = generateInsights({
    completedPomodoros: totalPomodoros,
    completedTasks: totalTasks,
    avgSessionLength: totalPomodoros > 0 ? Math.round(totalMinutes / totalPomodoros) : 0,
    peakHour: 10, // TODO: Calc peak hour from Heatmap
    currentStreak: 5, // TODO: Add streak to API
    longestStreak: 12,
  });

  // AI Report data
  const aiReportData = {
    totalPomodoros,
    totalTasks: totalTasks + 10, // Mock total created?
    completedTasks: totalTasks,
    streak: 5,
    avgPomodorosPerDay: avgPomodoros,
    peakHour: 10,
    topProject: { name: "Proyecto Alpha", tasks: 12 }, // TODO: Fetch top project
    weeklyData: weeklyData.map((d: any) => ({
      day: d.dayName,
      pomodoros: d.pomodoros,
      tasks: d.tasksCompleted,
    })),
  };

  const isLoading = statsLoading || weeklyLoading || heatmapLoading;

  if (isLoading) {
      return <div className="flex justify-center items-center min-h-[50vh]">Loading analytics...</div>;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
              <p className="text-muted-foreground">
                Analiza tu productividad y mejora tu rendimiento
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("analytics.thisWeek")}</span>
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SlideIn>

        {/* Quick Stats */}
        <StaggerList className="grid gap-4 md:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title={t("analytics.pomodoros")}
              value={totalPomodoros}
              subtitle={t("analytics.thisWeek").toLowerCase()}
              icon={Timer}
              iconColor="text-red-500"
              iconBgColor="bg-red-500/10"
              trend={{ 
                  value: Math.abs(stats?.trends?.pomodoros || 0), 
                  label: "vs semana anterior", 
                  isPositive: (stats?.trends?.pomodoros || 0) >= 0 
              }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("analytics.tasksCompleted")}
              value={totalTasks}
              icon={CheckCircle2}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
              trend={{ 
                  value: Math.abs(stats?.trends?.tasks || 0), 
                  label: "vs semana anterior", 
                  isPositive: (stats?.trends?.tasks || 0) >= 0 
              }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("analytics.streak")}
              value={5}
              subtitle="días"
              icon={Flame}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("analytics.avgPerDay")}
              value={avgPomodoros}
              subtitle="pomodoros"
              icon={Target}
              iconColor="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />
          </StaggerItem>
        </StaggerList>

        {/* AI Report - New Feature! */}
        <SlideIn delay={0.2}>
          <AIWeeklyReport data={aiReportData} />
        </SlideIn>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Charts */}
          <div className="space-y-6 lg:col-span-2">
            <SlideIn delay={0.3}>
              <WeeklyChart data={weeklyData} />
            </SlideIn>
            <div className="grid gap-6 md:grid-cols-2">
                 <SlideIn delay={0.35}>
                    <ProjectTimeChart data={projectData || []} />
                 </SlideIn>
                 <SlideIn delay={0.35}>
                    <TaskStatusChart data={statusData || []} />
                 </SlideIn>
            </div>
            <SlideIn delay={0.4}>
              <PeakHoursHeatmap data={heatmapData || []} />
            </SlideIn>
          </div>

          {/* Right Column - Score & Insights */}
          <div className="space-y-6">
            <SlideIn delay={0.3} direction="right">
              <FocusScoreGauge score={focusScore} previousScore={focusScore - 5} />
            </SlideIn>
            <SlideIn delay={0.4} direction="right">
              <ProductivityInsights insights={insights} />
            </SlideIn>
          </div>
        </div>

        {/* Summary Cards */}
        <StaggerList className="grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Tiempo Total Enfocado</h3>
              <p className="text-3xl font-bold">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ~{Math.round(totalMinutes / 7)}min promedio por día
              </p>
            </div>
          </StaggerItem>
          
          <StaggerItem>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Mejor Día</h3>
              <p className="text-3xl font-bold">
                {weeklyData.reduce((prev: any, current: any) => (prev.pomodoros > current.pomodoros) ? prev : current, { dayName: '-' }).dayName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.max(...weeklyData.map((d: any) => d.pomodoros), 0)} pomodoros completados
              </p>
            </div>
          </StaggerItem>
          
          <StaggerItem>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Eficiencia</h3>
              <p className="text-3xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sesiones completadas sin interrupciones
              </p>
            </div>
          </StaggerItem>
        </StaggerList>
      </div>
    </PageTransition>
  );
}
