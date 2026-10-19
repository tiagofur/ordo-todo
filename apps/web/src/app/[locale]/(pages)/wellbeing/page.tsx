"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Heart,
  Activity,
  Moon,
  Sun,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/lib/api-hooks";

interface BurnoutAnalysis {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  warnings: {
    type?: string;
    severity: "MILD" | "MODERATE" | "SEVERE";
    message: string;
    recommendation: string;
  }[];
  aiInsights?: string;
  patterns?: any;
}

interface WorkPattern {
  avgDailyWorkHours?: number;
  averageHoursPerDay?: number;
  lateNightPercentage?: number;
  nightWorkPercentage?: number;
  weekendWorkPercentage?: number;
  avgSessionWithoutBreak?: number;
  averageBreakMinutes?: number;
  longestSessionWithoutBreak?: number;
  urgentTaskCount?: number;
  overdueTaskCount?: number;
  consistencyScore?: number;
}

interface WeeklySummary {
  overallScore: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export default function WellbeingPage() {
  const t = useTranslations("Wellbeing");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] =
        await Promise.allSettled([
          apiClient.getBurnoutAnalysis(),
          apiClient.getWorkPatterns(),
          apiClient.getWeeklyWellbeingSummary(),
          apiClient.getRestRecommendations(),
        ]);

      if (burnoutRes.status === "fulfilled") setBurnout(burnoutRes.value);
      if (patternsRes.status === "fulfilled") setPatterns(patternsRes.value);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value);
      if (recsRes.status === "fulfilled") {
        setRecommendations(
          Array.isArray(recsRes.value) ? recsRes.value : []
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspaceId]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-500",
          light: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
      case "MODERATE":
        return {
          bg: "bg-amber-500",
          text: "text-amber-500",
          light: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500",
          text: "text-orange-500",
          light: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        };
      case "CRITICAL":
        return {
          bg: "bg-rose-500",
          text: "text-rose-500",
          light: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        };
      default:
        return {
          bg: "bg-cyan-500",
          text: "text-cyan-500",
          light: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "DECLINING":
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      default:
        return <Minus className="h-4 w-4 text-amber-500" />;
    }
  };

  const getBatteryIcon = (score: number) => {
    if (score >= 75) return <BatteryFull className="h-7 w-7 text-emerald-500" />;
    if (score >= 50) return <BatteryMedium className="h-7 w-7 text-amber-500" />;
    if (score >= 25) return <BatteryLow className="h-7 w-7 text-orange-500" />;
    return <Battery className="h-7 w-7 text-rose-500" />;
  };

  const energyScore = Math.round(weekly?.overallScore ?? 75);
  const riskScore = Math.round(burnout?.riskScore ?? 0);
  const breakMinutes = Math.round(
    patterns?.avgSessionWithoutBreak ?? patterns?.averageBreakMinutes ?? 0
  );
  const nightWork = Math.round(
    patterns?.lateNightPercentage ?? patterns?.nightWorkPercentage ?? 0
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-500/25 shrink-0">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title") || "Bienestar"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  {t("subtitle") ||
                    "Mantén el equilibrio entre tu productividad y tu salud mental"}
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
                  className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-colors cursor-pointer shadow-xs"
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

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="gap-2 rounded-xl border-border/60 hover:bg-muted/50 cursor-pointer shadow-xs"
            >
              <RefreshCw
                className={cn("h-4 w-4 text-rose-500", isRefreshing && "animate-spin")}
              />
              <span>{t("refresh") || "Actualizar"}</span>
            </Button>
          </div>
        </div>

        {/* 4 Apple-Grade KPI Cards with Micro-Halos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Nivel de Energía */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f43f5e70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(244, 63, 94, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Nivel de Energía
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110">
                <Zap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {energyScore}/100
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate flex items-center gap-1">
              {weekly ? (
                <>
                  {getTrendIcon(weekly.trend)}
                  <span>
                    {weekly.trend === "IMPROVING"
                      ? "Mejorando"
                      : weekly.trend === "DECLINING"
                      ? "En declive"
                      : "Estable"}
                  </span>
                </>
              ) : (
                "Batería semanal"
              )}
            </p>
          </div>

          {/* Card 2: Riesgo de Burnout */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f59e0b70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("burnoutRisk") || "Riesgo de Burnout"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                <Activity className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {riskScore}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Nivel {burnout ? t(`riskLevels.${burnout.riskLevel}`) : "Bajo"}
            </p>
          </div>

          {/* Card 3: Pausas y Descansos */}
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
                {t("breaks") || "Descansos"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                <Coffee className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {breakMinutes}m
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Tiempo promedio de desconexión
            </p>
          </div>

          {/* Card 4: Trabajo Nocturno */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6366f170";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(99, 102, 241, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("patterns.lateNightWork") || "Trabajo Nocturno"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 transition-transform duration-300 group-hover:scale-110">
                <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {nightWork}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Sesiones fuera de horario
            </p>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-card rounded-2xl border border-border/60" />
              <div className="h-64 bg-card rounded-2xl border border-border/60" />
            </div>
            <div className="h-48 bg-card rounded-2xl border border-border/60" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-6">
            {/* Deep-Dive Grid: Burnout Gauge & Energy Battery */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Burnout Risk Gauge Card */}
              {burnout && (
                <Card className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
                  <div className={cn("h-1.5", getRiskColor(burnout.riskLevel).bg)} />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <span className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-rose-500" />
                        {t("burnoutRisk") || "Análisis de Riesgo de Burnout"}
                      </span>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          getRiskColor(burnout.riskLevel).light
                        )}
                      >
                        {t(`riskLevels.${burnout.riskLevel}`) || burnout.riskLevel}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-32 h-32 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-muted/40"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(riskScore / 100) * 352} 352`}
                            strokeLinecap="round"
                            className={cn(
                              "transition-all duration-1000 ease-out",
                              getRiskColor(burnout.riskLevel).text
                            )}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black">{riskScore}</span>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            Puntos
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <h4 className="font-semibold text-sm text-foreground">
                          {t("factorsDetected") || "Factores Detectados"}
                        </h4>
                        <div className="space-y-1.5">
                          {(burnout.warnings || []).slice(0, 3).map((w, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs sm:text-sm p-2 rounded-xl bg-muted/40"
                            >
                              {w.severity === "SEVERE" ? (
                                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              )}
                              <span className="text-muted-foreground font-medium truncate">
                                {w.message}
                              </span>
                            </div>
                          ))}
                          {(!burnout.warnings || burnout.warnings.length === 0) && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>No se detectaron sobrecargas recientes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {burnout.warnings && burnout.warnings.length > 0 && (
                      <div className="border-t border-border/60 pt-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
                          <Brain className="h-4 w-4 text-rose-500" />
                          {t("immediateSuggestions") || "Sugerencias Inmediatas"}
                        </h4>
                        <ul className="space-y-2">
                          {burnout.warnings.slice(0, 3).map((w, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground"
                            >
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>{w.recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Energy Level & Battery Card */}
              <Card className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-card/80 backdrop-blur-xs border border-border/50 shadow-xs">
                        {getBatteryIcon(energyScore)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Nivel de Energía
                        </p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                            {energyScore}
                          </span>
                          <span className="text-lg text-muted-foreground font-medium">
                            /100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {weekly && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border/50 text-xs font-semibold">
                          {getTrendIcon(weekly.trend)}
                          <span>
                            {weekly.trend === "IMPROVING" && "Mejorando"}
                            {weekly.trend === "STABLE" && "Estable"}
                            {weekly.trend === "DECLINING" && "En declive"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                      <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>
                        {burnout?.aiInsights ||
                          weekly?.recommendations?.[0] ||
                          "El descanso estratégico y las pausas periódicas maximizan tu concentración y creatividad."}
                      </span>
                    </p>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pausas Recomendadas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.slice(0, 3).map((rec: any, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="rounded-lg text-xs py-1 px-2.5 gap-1.5 bg-muted/50 border border-border/60"
                          >
                            <Coffee className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{rec.message || rec}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Work Patterns Breakdown */}
            {patterns && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {t("hoursPerDay") || "Horas/día"}
                    </span>
                    <Clock className="h-4 w-4 text-cyan-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {(
                      patterns.avgDailyWorkHours ??
                      patterns.averageHoursPerDay ??
                      0
                    ).toFixed(1)}
                    h
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    Promedio diario de labor
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {t("weekends") || "Fines de semana"}
                    </span>
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {Math.round(patterns.weekendWorkPercentage ?? 0)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    Carga en fin de semana
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Sesión más larga
                    </span>
                    <Activity className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {patterns.longestSessionWithoutBreak
                      ? Math.round(patterns.longestSessionWithoutBreak) + "m"
                      : "Normal"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    Sin pausa continua
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Consistencia
                    </span>
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {patterns.consistencyScore
                      ? Math.round(patterns.consistencyScore) + "%"
                      : "Óptima"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    Regularidad de horarios
                  </p>
                </div>
              </div>
            )}

            {/* Weekly Summary Card */}
            {weekly && (
              <Card className="rounded-2xl border border-border/60 bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-amber-500" />
                      {t("weeklySummary") || "Resumen Semanal de Bienestar"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {getTrendIcon(weekly.trend)}
                      <span>
                        {weekly.trend === "IMPROVING" && "Tendencia positiva"}
                        {weekly.trend === "STABLE" && "Tendencia estable"}
                        {weekly.trend === "DECLINING" && "Requiere atención"}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">
                      {energyScore}
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            energyScore >= 80
                              ? "bg-emerald-500"
                              : energyScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${energyScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {t("wellbeingScore") || "Puntaje general de equilibrio"}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {weekly.highlights?.length > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {t("positive") || "Aspectos Positivos"}
                        </h4>
                        <ul className="space-y-1">
                          {weekly.highlights.map((h, idx) => (
                            <li
                              key={idx}
                              className="text-xs sm:text-sm text-muted-foreground"
                            >
                              • {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {weekly.concerns?.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {t("concerns") || "Áreas de Atención"}
                        </h4>
                        <ul className="space-y-1">
                          {weekly.concerns.map((c, idx) => (
                            <li
                              key={idx}
                              className="text-xs sm:text-sm text-muted-foreground"
                            >
                              • {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
