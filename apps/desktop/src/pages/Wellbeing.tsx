"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Sun,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
  Brain,
  Sparkles,
  RefreshCw,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { PageTransition, SlideIn, StaggerList, StaggerItem } from "@/components/motion";

interface BurnoutAnalysis {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  warnings: {
    type: string;
    severity: "MILD" | "MODERATE" | "SEVERE";
    message: string;
    recommendation: string;
  }[];
  aiInsights?: string;
  patterns: any;
}

interface WorkPattern {
  averageHoursPerDay: number;
  nightWorkPercentage: number;
  weekendWorkPercentage: number;
  longSessionsCount: number;
  averageBreakMinutes: number;
  consistencyScore: number;
}

interface WeeklySummary {
  overallScore: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export function Wellbeing() {
  const { t } = (useTranslation as any)();
  const accentColor = "#ec4899"; // Pink
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<any | null>(null); // Using any temporarily to allow flexibility
  const [patterns, setPatterns] = useState<any | null>(null);
  const [weekly, setWeekly] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // getRestRecommendations does not exist on client, removing it.
      const [burnoutRes, patternsRes, weeklyRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
      ]);

      if (burnoutRes.status === "fulfilled") {
          const data = burnoutRes.value;
          // Map API data to UI structure if needed 
          // API: riskFactors (string[]), recommendations (string[])
          // UI expects: warnings ({ message, severity, ... })
          // We will adapt the UI rendering instead of complex mapping here
          setBurnout({
              ...data,
              // Create pseudo-warnings from riskFactors
              warnings: (data.riskFactors || []).map((factor: string) => ({
                  message: factor,
                  severity: "MODERATE", // Default
                  recommendation: "Review this factor"
              })),
              aiInsights: data.recommendations?.[0] || ""
          });
      }
      
      if (patternsRes.status === "fulfilled") {
          const data = patternsRes.value;
          setPatterns({
              ...data,
              averageHoursPerDay: data.avgSessionDuration ? (data.avgSessionDuration / 60) : 0, // Approx
              nightWorkPercentage: 0, // Not in API
              weekendWorkPercentage: 0, // Not in API
              averageBreakMinutes: data.breakFrequency ? 60 / data.breakFrequency : 0 // Approx
          });
      }

      if (weeklyRes.status === "fulfilled") {
          const data = weeklyRes.value;
          setWeekly({
              ...data,
              highlights: data.insights || [],
              concerns: [],
              recommendations: []
          });
      }
      
    } catch (error) {
      console.error("Failed to fetch wellbeing data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return { bg: "bg-green-500", text: "text-green-500", light: "bg-green-500/10" };
      case "MODERATE": return { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-500/10" };
      case "HIGH": return { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10" };
      case "CRITICAL": return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/10" };
      default: return { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING": return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "DECLINING": return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getBatteryIcon = (score: number) => {
    if (score >= 75) return <BatteryFull className="h-8 w-8 text-green-500" />;
    if (score >= 50) return <BatteryMedium className="h-8 w-8 text-yellow-500" />;
    if (score >= 25) return <BatteryLow className="h-8 w-8 text-orange-500" />;
    return <Battery className="h-8 w-8 text-red-500" />;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <Heart className="h-6 w-6" />
                </div>
                {t("Sidebar.wellbeing")}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Tu bienestar es tan importante como tu productividad
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </SlideIn>

        {/* Energy Level Card - Desktop Exclusive */}
        {weekly && (
          <SlideIn delay={0.1}>
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-background/80 backdrop-blur">
                      {getBatteryIcon(weekly.overallScore)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nivel de Energía</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{weekly.overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tendencia</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(weekly.trend)}
                        <span className="font-medium">
                          {weekly.trend === "IMPROVING" && "Mejorando"}
                          {weekly.trend === "STABLE" && "Estable"}
                          {weekly.trend === "DECLINING" && "Bajando"}
                        </span>
                      </div>
                    </div>
                    {weekly.recommendations?.[0] && (
                      <div className="max-w-xs p-3 rounded-lg bg-background/60 backdrop-blur border">
                        <p className="text-sm flex items-start gap-2">
                          <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {weekly.recommendations[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </SlideIn>
        )}

        {/* Burnout Risk Gauge */}
        {burnout && (
          <SlideIn delay={0.15}>
            <Card className="overflow-hidden">
              <div className={cn("h-2", getRiskColor(burnout.riskLevel).bg)} />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Análisis de Riesgo de Burnout
                  </span>
                  <Badge variant="outline" className={cn(
                    getRiskColor(burnout.riskLevel).light,
                    getRiskColor(burnout.riskLevel).text,
                    "border-0"
                  )}>
                    {burnout.riskLevel === "LOW" && "Bajo"}
                    {burnout.riskLevel === "MODERATE" && "Moderado"}
                    {burnout.riskLevel === "HIGH" && "Alto"}
                    {burnout.riskLevel === "CRITICAL" && "Crítico"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Score gauge */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(burnout.riskScore / 100) * 352} 352`}
                          strokeLinecap="round"
                          className={getRiskColor(burnout.riskLevel).text}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{burnout.riskScore}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-3">Factores Detectados</h4>
                      <div className="space-y-2">
                        {(burnout.warnings || []).slice(0, 3).map((warning: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {warning.severity === "SEVERE" ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : warning.severity === "MODERATE" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-muted-foreground">{warning.message}</span>
                          </div>
                        ))}
                        {(!burnout.warnings || burnout.warnings.length === 0) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            No se detectaron factores de riesgo
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick recommendations */}
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Sugerencias Inmediatas
                    </h4>
                    {burnout.warnings && burnout.warnings.length > 0 ? (
                      <ul className="space-y-2">
                        {burnout.warnings.slice(0, 3).map((warning: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {warning.recommendation}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        ¡Sigue con tus buenos hábitos de trabajo!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Work Patterns */}
        {patterns && (
          <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StaggerItem>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patterns.averageHoursPerDay?.toFixed(1) || 0}h</p>
                    <p className="text-xs text-muted-foreground">Horas/día promedio</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Moon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patterns.nightWorkPercentage || 0}%</p>
                    <p className="text-xs text-muted-foreground">Trabajo nocturno</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patterns.weekendWorkPercentage || 0}%</p>
                    <p className="text-xs text-muted-foreground">Trabajo en fines de semana</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Coffee className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patterns.averageBreakMinutes?.toFixed(0) || 0}m</p>
                    <p className="text-xs text-muted-foreground">Descansos promedio</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          </StaggerList>
        )}

        {/* Weekly Summary */}
        {weekly && (
          <SlideIn delay={0.25}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Resumen Semanal
                  </span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(weekly.trend)}
                    <span className="text-sm text-muted-foreground">
                      {weekly.trend === "IMPROVING" && "Mejorando"}
                      {weekly.trend === "STABLE" && "Estable"}
                      {weekly.trend === "DECLINING" && "Bajando"}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Highlights */}
                  {weekly.highlights?.length > 0 && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Lo positivo
                      </h4>
                      <ul className="space-y-1">
                        {weekly.highlights.map((h: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground">• {h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {weekly.concerns?.length > 0 && (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Áreas de mejora
                      </h4>
                      <ul className="space-y-1">
                        {weekly.concerns.map((c: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Rest Recommendations - Only if we have them derived slightly differently or from mock */}
        {recommendations.length > 0 && (
          <SlideIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Recomendaciones de Descanso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.message}</p>
                        {rec.suggestedAction && (
                          <p className="text-xs text-muted-foreground mt-1">{rec.suggestedAction}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Empty state */}
        {!burnout && !patterns && !weekly && (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin datos de bienestar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Continúa usando Ordo para que podamos analizar tus patrones de trabajo
            </p>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
