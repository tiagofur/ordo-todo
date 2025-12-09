"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { useState } from "react";
import { DailyMetricsCard } from "@/components/analytics/daily-metrics-card";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { ProductivityInsights } from "@/components/analytics/productivity-insights";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import { ProjectTimeChart, TaskStatusChart } from "@/components/analytics/distribution-charts";
import { AIWeeklyReport } from "@/components/analytics/ai-weekly-report";
import { 
  useDailyMetrics, 
  useDashboardStats, 
  useHeatmapData,
  useProjectDistribution,
  useTaskStatusDistribution
} from "@/lib/api-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ordo-todo/ui";
import {
  CalendarIcon,
  TrendingUp,
  Target,
  BarChart3,
  Brain,
  Timer,
  CheckCircle2,
  Flame,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}% vs semana anterior</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations("Analytics");
  const [selectedDate] = useState<Date>(new Date());

  // Get today's date range for metrics
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // API hooks
  const { data: todayMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const todayMetrics = todayMetricsArray?.[0];

  // New analytics hooks
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: projectData } = useProjectDistribution();
  const { data: statusData } = useTaskStatusDistribution();

  const accentColor = "#06b6d4"; // Cyan

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
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
                <BarChart3 className="h-6 w-6" />
              </div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>
        </div>

        {/* Quick Stats - New Section */}
        {dashboardStats && (
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              title={t("pomodoros") || "Pomodoros"}
              value={dashboardStats.pomodoros || 0}
              subtitle={t("thisWeek") || "esta semana"}
              icon={Timer}
              trend={dashboardStats.trends ? {
                value: Math.abs(dashboardStats.trends.pomodoros || 0),
                isPositive: (dashboardStats.trends.pomodoros || 0) >= 0
              } : undefined}
            />
            <StatsCard
              title={t("tasksCompleted") || "Tareas Completadas"}
              value={dashboardStats.tasks || 0}
              icon={CheckCircle2}
              trend={dashboardStats.trends ? {
                value: Math.abs(dashboardStats.trends.tasks || 0),
                isPositive: (dashboardStats.trends.tasks || 0) >= 0
              } : undefined}
            />
            <StatsCard
              title={t("streak") || "Racha"}
              value={5}
              subtitle="días"
              icon={Flame}
            />
            <StatsCard
              title={t("avgPerDay") || "Promedio/día"}
              value={dashboardStats.avgPerDay || 0}
              subtitle="pomodoros"
              icon={Target}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t("tabs.weekly")}
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t("tabs.focus")}
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t("tabs.aiInsights")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Daily Metrics */}
            <DailyMetricsCard />

            {/* AI Weekly Report */}
            <AIWeeklyReport 
              data={dashboardStats ? {
                totalPomodoros: dashboardStats.pomodoros || 0,
                totalTasks: (dashboardStats.tasks || 0) + 10,
                completedTasks: dashboardStats.tasks || 0,
                streak: 5,
                avgPomodorosPerDay: dashboardStats.avgPerDay || 0,
                peakHour: 10,
                topProject: { name: "Proyecto Principal", tasks: 8 },
                weeklyData: [
                  { day: "Lun", pomodoros: 6, tasks: 5 },
                  { day: "Mar", pomodoros: 8, tasks: 7 },
                  { day: "Mié", pomodoros: 4, tasks: 3 },
                  { day: "Jue", pomodoros: 7, tasks: 6 },
                  { day: "Vie", pomodoros: 5, tasks: 4 },
                  { day: "Sáb", pomodoros: 2, tasks: 2 },
                  { day: "Dom", pomodoros: 0, tasks: 1 },
                ],
              } : undefined}
            />

            {/* Weekly Chart */}
            <WeeklyChart />

            {/* Distribution Charts - New */}
            <div className="grid md:grid-cols-2 gap-6">
              <ProjectTimeChart data={projectData || []} />
              <TaskStatusChart data={statusData || []} />
            </div>

            {/* AI Insights */}
            <ProductivityInsights />

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
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.reduceBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.shortenBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.usePomodoro")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.eliminateDistractions")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {dashboardStats && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">Tiempo Total Enfocado</h3>
                  <p className="text-3xl font-bold">
                    {Math.floor((dashboardStats.minutes || 0) / 60)}h {(dashboardStats.minutes || 0) % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ~{Math.round((dashboardStats.minutes || 0) / 7)}min promedio por día
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">Mejor Día</h3>
                  <p className="text-3xl font-bold">Martes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    8 pomodoros completados
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">Eficiencia</h3>
                  <p className="text-3xl font-bold">87%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sesiones completadas sin interrupciones
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <WeeklyChart />

            {/* Distribution Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <ProjectTimeChart data={projectData || []} />
              <TaskStatusChart data={statusData || []} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <DailyMetricsCard />
              <div className="md:col-span-2 bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("weekly.summary")}
                </h3>
                {dashboardStats ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold">{Math.floor((dashboardStats.minutes || 0) / 60)}h {(dashboardStats.minutes || 0) % 60}m</p>
                      <p className="text-sm text-muted-foreground">Tiempo total enfocado</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{dashboardStats.pomodoros || 0}</p>
                      <p className="text-sm text-muted-foreground">Pomodoros completados</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{dashboardStats.tasks || 0}</p>
                      <p className="text-sm text-muted-foreground">Tareas completadas</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("weekly.comingSoon")}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6">
            {todayMetrics?.focusScore !== undefined ? (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label={t("focusScore.label")}
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.whatIs")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("focusScore.whatIsDescription")}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.howCalculated")}
                    </h3>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      <div>{t("focusScore.calculation")}</div>
                      <div className="mt-2 text-muted-foreground">
                        {t("focusScore.penalty")}
                      </div>
                      <div className="text-muted-foreground">
                        {t("focusScore.max")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.interpretation")}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-600" />
                        <span className="font-medium">80-100%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.excellent")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-600" />
                        <span className="font-medium">50-79%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.moderate")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="font-medium">0-49%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.needsImprovement")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("focusScore.noData")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("focusScore.noDataDescription")}
                </p>
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Productivity Insights */}
              <ProductivityInsights />

              {/* Peak Hours Chart */}
              <PeakHoursChart />

              {/* Info Section */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t("aiLearning.title")}
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>{t("aiLearning.description")}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">
                      {t("aiLearning.whatAnalyzes")}
                    </h4>
                    <ul className="space-y-1 ml-4">
                      <li>• {t("aiLearning.analyzesList.hours")}</li>
                      <li>• {t("aiLearning.analyzesList.days")}</li>
                      <li>• {t("aiLearning.analyzesList.duration")}</li>
                      <li>• {t("aiLearning.analyzesList.completion")}</li>
                      <li>• {t("aiLearning.analyzesList.patterns")}</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">
                      {t("aiLearning.whatOffers")}
                    </h4>
                    <ul className="space-y-1 ml-4">
                      <li>• {t("aiLearning.offersList.recommendations")}</li>
                      <li>• {t("aiLearning.offersList.predictions")}</li>
                      <li>• {t("aiLearning.offersList.insights")}</li>
                      <li>• {t("aiLearning.offersList.visualizations")}</li>
                    </ul>
                  </div>
                  <p className="italic pt-2 border-t">{t("aiLearning.tip")}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
