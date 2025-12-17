"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/shared/app-layout";

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

export default function WellbeingPage() {
  const accentColor = "#ec4899"; // Pink
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
        apiClient.getRestRecommendations(),
      ]);

      if (burnoutRes.status === "fulfilled") setBurnout(burnoutRes.value);
      if (patternsRes.status === "fulfilled") setPatterns(patternsRes.value);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value);
      if (recsRes.status === "fulfilled") setRecommendations(Array.isArray(recsRes.value) ? recsRes.value : []);
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-6 pb-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Bienestar
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

        {/* Burnout Risk Gauge */}
        {burnout && (
          <Card className="overflow-hidden">
            <div className={cn("h-2", getRiskColor(burnout.riskLevel).bg)} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Riesgo de Burnout
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  getRiskColor(burnout.riskLevel).light,
                  getRiskColor(burnout.riskLevel).text
                )}>
                  {burnout.riskLevel === "LOW" && "Bajo"}
                  {burnout.riskLevel === "MODERATE" && "Moderado"}
                  {burnout.riskLevel === "HIGH" && "Alto"}
                  {burnout.riskLevel === "CRITICAL" && "Crítico"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Score gauge */}
              <div className="flex items-center gap-6 mb-6">
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
                  <h4 className="font-medium mb-2">Factores Detectados</h4>
                  <div className="space-y-2">
                    {burnout.warnings.slice(0, 3).map((warning, idx) => (
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
                  </div>
                </div>
              </div>

              {/* Quick recommendations */}
              {burnout.warnings.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Sugerencias Inmediatas
                  </h4>
                  <ul className="grid gap-2">
                    {burnout.warnings.slice(0, 3).map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {warning.recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Work Patterns */}
        {patterns && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patterns.averageHoursPerDay.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Horas/día</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Moon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patterns.nightWorkPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Trabajo nocturno</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patterns.weekendWorkPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Fines de semana</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Coffee className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patterns.averageBreakMinutes}m</p>
                  <p className="text-xs text-muted-foreground">Descansos</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Weekly Summary */}
        {weekly && (
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
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="text-4xl font-bold">{weekly.overallScore}</div>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${weekly.overallScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Puntuación de bienestar</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Highlights */}
                {weekly.highlights.length > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Lo positivo
                    </h4>
                    <ul className="space-y-1">
                      {weekly.highlights.map((h, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {weekly.concerns.length > 0 && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Áreas de mejora
                    </h4>
                    <ul className="space-y-1">
                      {weekly.concerns.map((c, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {weekly.recommendations && weekly.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{weekly.recommendations[0]}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rest Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Recomendaciones de Descanso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
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
      </motion.div>
    </AppLayout>
  );
}
