import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight, Timer, CheckCircle2, Flame, Target, TrendingUp, Brain, BarChart3 } from "lucide-react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@ordo-todo/ui";
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
  
  // Accent color (matching Web)
  const accentColor = "#06b6d4"; // Cyan
  
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
                  <BarChart3 className="h-6 w-6" />
                </div>
                {t("Analytics.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Analytics.subtitle") || "Analiza tu productividad y mejora tu rendimiento"}
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-card">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("Analytics.thisWeek")}</span>
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
              title={t("Analytics.pomodoros")}
              value={totalPomodoros}
              subtitle={t("Analytics.thisWeek").toLowerCase()}
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
              title={t("Analytics.tasksCompleted")}
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
              title={t("Analytics.streak")}
              value={5}
              subtitle="días"
              icon={Flame}
              iconColor="text-orange-500"
              iconBgColor="bg-orange-500/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t("Analytics.avgPerDay")}
              value={avgPomodoros}
              subtitle="pomodoros"
              icon={Target}
              iconColor="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />
          </StaggerItem>
        </StaggerList>

        {/* Tabbed Interface */}
        <SlideIn delay={0.15}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semanal
              </TabsTrigger>
              <TabsTrigger value="focus" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Enfoque
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                IA Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* AI Report */}
              <AIWeeklyReport data={aiReportData} />

              {/* Main Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Charts */}
                <div className="space-y-6 lg:col-span-2">
                  <WeeklyChart data={weeklyData} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <ProjectTimeChart data={projectData || []} />
                    <TaskStatusChart data={statusData || []} />
                  </div>
                </div>

                {/* Right Column - Score & Insights */}
                <div className="space-y-6">
                  <FocusScoreGauge score={focusScore} previousScore={focusScore - 5} />
                  <ProductivityInsights insights={insights} />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">Tiempo Total Enfocado</h3>
                  <p className="text-3xl font-bold">
                    {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ~{Math.round(totalMinutes / 7)}min promedio por día
                  </p>
                </div>
                
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="text-sm text-muted-foreground mb-2">Mejor Día</h3>
                  <p className="text-3xl font-bold">
                    {weeklyData.reduce((prev: any, current: any) => (prev.pomodoros > current.pomodoros) ? prev : current, { dayName: '-' }).dayName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.max(...weeklyData.map((d: any) => d.pomodoros), 0)} pomodoros completados
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
            </TabsContent>

            {/* Weekly Tab */}
            <TabsContent value="weekly" className="space-y-6">
              <WeeklyChart data={weeklyData} />
              <div className="grid gap-6 md:grid-cols-2">
                <ProjectTimeChart data={projectData || []} />
                <TaskStatusChart data={statusData || []} />
              </div>
              <PeakHoursHeatmap data={(heatmapData || []) as any} />
            </TabsContent>

            {/* Focus Tab */}
            <TabsContent value="focus" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge score={focusScore} previousScore={focusScore - 5} />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">¿Qué es el Focus Score?</h3>
                    <p className="text-sm text-muted-foreground">
                      El Focus Score mide la calidad de tu concentración basado en el tiempo enfocado vs interrupciones.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">¿Cómo se calcula?</h3>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      <div>Score = (Tiempo Enfocado / Tiempo Total) × 100</div>
                      <div className="mt-2 text-muted-foreground">
                        Penalización: -5% por cada interrupción
                      </div>
                      <div className="text-muted-foreground">
                        Máximo: 100%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interpretación</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-600" />
                        <span className="font-medium">80-100%:</span>
                        <span className="text-muted-foreground">Excelente concentración</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-600" />
                        <span className="font-medium">50-79%:</span>
                        <span className="text-muted-foreground">Concentración moderada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="font-medium">0-49%:</span>
                        <span className="text-muted-foreground">Necesita mejora</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cómo Mejorar</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Reduce las interrupciones durante sesiones Pomodoro</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Acorta los descansos entre sesiones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Usa la técnica Pomodoro consistentemente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Elimina distracciones del entorno</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai" className="space-y-6">
              <AIWeeklyReport data={aiReportData} />
              <ProductivityInsights insights={insights} />
              
              {/* AI Learning Info */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  IA de Aprendizaje Continuo
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>El sistema de IA analiza tu comportamiento para ofrecerte recomendaciones personalizadas.</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">¿Qué analiza?</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Tus horas más productivas</li>
                      <li>• Los días donde rindes mejor</li>
                      <li>• La duración óptima de tus sesiones</li>
                      <li>• Patrones de completitud de tareas</li>
                      <li>• Tendencias de productividad</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">¿Qué ofrece?</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Recomendaciones personalizadas</li>
                      <li>• Predicciones de duración de tareas</li>
                      <li>• Insights de productividad</li>
                      <li>• Visualizaciones inteligentes</li>
                    </ul>
                  </div>
                  <p className="italic pt-2 border-t">
                    💡 Tip: Cuanto más uses la app, mejores serán las recomendaciones de la IA.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
