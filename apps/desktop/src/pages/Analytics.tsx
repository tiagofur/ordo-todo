import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight, Timer, CheckCircle2, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WeeklyChart,
  PeakHoursHeatmap,
  FocusScoreGauge,
  ProductivityInsights,
  generateInsights,
} from "@/components/analytics";
import { StatsCard } from "@/components/dashboard";
import { AIWeeklyReport } from "@/components/ai";
import { PageTransition, SlideIn, StaggerList, StaggerItem } from "@/components/motion";

// Mock data - TODO: integrate with real API
const generateWeeklyData = () => {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return days.map((dayName, i) => ({
    date: `2025-12-${(i + 1).toString().padStart(2, "0")}`,
    dayName,
    pomodoros: Math.floor(Math.random() * 8) + 2,
    focusMinutes: Math.floor(Math.random() * 180) + 60,
    tasksCompleted: Math.floor(Math.random() * 6) + 1,
  }));
};

const generateHeatmapData = () => {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return days.map((day) => ({
    day,
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      value:
        hour >= 9 && hour <= 18
          ? Math.floor(Math.random() * 60) + 20
          : Math.floor(Math.random() * 20),
    })),
  }));
};

export function Analytics() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("week");
  
  const weeklyData = generateWeeklyData();
  const heatmapData = generateHeatmapData();
  
  // Calculate totals
  const totalPomodoros = weeklyData.reduce((sum, d) => sum + d.pomodoros, 0);
  const totalTasks = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalMinutes = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
  const avgPomodoros = Math.round(totalPomodoros / 7);
  
  // Focus score calculation (simplified)
  const focusScore = Math.min(100, Math.round((totalPomodoros / 35) * 100));
  
  // Generate insights
  const insights = generateInsights({
    completedPomodoros: totalPomodoros,
    completedTasks: totalTasks,
    avgSessionLength: Math.round(totalMinutes / totalPomodoros),
    peakHour: 10,
    currentStreak: 5,
    longestStreak: 12,
  });

  // AI Report data
  const aiReportData = {
    totalPomodoros,
    totalTasks: totalTasks + 10,
    completedTasks: totalTasks,
    streak: 5,
    avgPomodorosPerDay: avgPomodoros,
    peakHour: 10,
    topProject: { name: "Proyecto Alpha", tasks: 12 },
    weeklyData: weeklyData.map(d => ({
      day: d.dayName,
      pomodoros: d.pomodoros,
      tasks: d.tasksCompleted,
    })),
  };

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
              trend={{ value: 12, label: "vs semana anterior", isPositive: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("analytics.tasksCompleted")}
              value={totalTasks}
              icon={CheckCircle2}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
              trend={{ value: 8, label: "vs semana anterior", isPositive: true }}
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
            <SlideIn delay={0.4}>
              <PeakHoursHeatmap data={heatmapData} />
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
              <p className="text-3xl font-bold">Viernes</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.max(...weeklyData.map(d => d.pomodoros))} pomodoros completados
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
