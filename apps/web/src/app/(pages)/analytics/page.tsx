"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { useState } from "react";
import { DailyMetricsCard } from "@/components/analytics/daily-metrics-card";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { ProductivityInsights } from "@/components/analytics/productivity-insights";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import { useDailyMetrics } from "@/lib/api-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, TrendingUp, Target, BarChart3, Brain } from "lucide-react";

export default function AnalyticsPage() {
  const [selectedDate] = useState<Date>(new Date());
  const { data: todayMetrics } = useDailyMetrics();
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
              Analíticas
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualiza tu productividad y progreso a lo largo del tiempo
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Semanal
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Enfoque
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Daily Metrics */}
            <DailyMetricsCard />

            {/* Weekly Chart */}
            <WeeklyChart />

            {/* AI Insights */}
            <ProductivityInsights />

            {/* Focus Score */}
            {todayMetrics?.focusScore !== undefined && (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label="Focus Score de Hoy"
                  description="Tu nivel de concentración del día"
                />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cómo mejorar tu Focus Score</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Reduce el número de pausas durante tus sesiones de trabajo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Acorta la duración de las pausas cuando las tomes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Usa el modo Pomodoro para mantener sesiones estructuradas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Elimina distracciones antes de iniciar el timer</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <WeeklyChart />

            <div className="grid md:grid-cols-3 gap-6">
              <DailyMetricsCard />
              <div className="md:col-span-2 bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen Semanal</h3>
                <p className="text-sm text-muted-foreground">
                  Próximamente: Estadísticas detalladas de la semana, comparación con semanas anteriores,
                  y métricas de tendencia.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6">
            {todayMetrics?.focusScore !== undefined ? (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label="Focus Score de Hoy"
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">¿Qué es el Focus Score?</h3>
                    <p className="text-sm text-muted-foreground">
                      El Focus Score mide tu nivel de concentración basándose en la relación entre
                      tu tiempo de trabajo efectivo y las pausas que tomas. Un score más alto indica
                      mejor capacidad de mantener el enfoque.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cómo se calcula</h3>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      <div>Score = Tiempo de Trabajo / Tiempo Total</div>
                      <div className="mt-2 text-muted-foreground">
                        - Penalización: 2% por cada pausa
                      </div>
                      <div className="text-muted-foreground">
                        - Máximo: 100% (trabajo continuo)
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
                        <span className="text-muted-foreground">Necesitas mejorar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin datos de Focus Score</h3>
                <p className="text-sm text-muted-foreground">
                  Completa una sesión de trabajo con el timer para ver tu Focus Score
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
                  ¿Cómo funciona el AI Learning?
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    El sistema de IA de Ordo aprende automáticamente de tus patrones de trabajo
                    cada vez que completas una sesión con el timer. No necesitas hacer nada extra.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">¿Qué analiza?</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Horas del día en las que eres más productivo</li>
                      <li>• Días de la semana con mejor rendimiento</li>
                      <li>• Duración promedio de tus tareas</li>
                      <li>• Tasa de completitud de sesiones</li>
                      <li>• Patrones de pausas y concentración</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">¿Qué te ofrece?</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Recomendaciones personalizadas de horarios óptimos</li>
                      <li>• Predicciones de duración de tareas</li>
                      <li>• Insights sobre tus mejores momentos de productividad</li>
                      <li>• Visualizaciones de tus patrones de trabajo</li>
                    </ul>
                  </div>
                  <p className="italic pt-2 border-t">
                    💡 Cuanto más uses el timer, más precisas serán las recomendaciones de la IA.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
