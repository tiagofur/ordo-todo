"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";

interface ReportDetailProps {
  report: {
    id: string;
    scope: string;
    summary: string;
    productivityScore: number;
    generatedAt: Date | string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    patterns: string[];
    metricsSnapshot: {
      tasksCompleted?: number;
      tasksCreated?: number;
      minutesWorked?: number;
      pomodorosCompleted?: number;
      focusScore?: number;
      sessionsCount?: number;
    };
    aiModel?: string;
  };
}

export function ReportDetail({ report }: ReportDetailProps) {
  const getScopeLabel = (scope: string): string => {
    switch (scope) {
      case "TASK_COMPLETION":
        return "Tarea Completada";
      case "WEEKLY_SCHEDULED":
        return "Reporte Semanal";
      case "MONTHLY_SCHEDULED":
        return "Reporte Mensual";
      case "PROJECT_SUMMARY":
        return "Resumen de Proyecto";
      case "PERSONAL_ANALYSIS":
        return "Análisis Personal";
      default:
        return "Reporte";
    }
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{getScopeLabel(report.scope)}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Generado el {formatDate(report.generatedAt)}
              </CardDescription>
              {report.aiModel && (
                <Badge variant="outline" className="text-xs">
                  Powered by {report.aiModel}
                </Badge>
              )}
            </div>
            <div className="w-32">
              <FocusScoreGauge
                score={report.productivityScore / 100}
                label="Score"
                size="sm"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {report.summary.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0 text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Snapshot */}
      {report.metricsSnapshot && Object.keys(report.metricsSnapshot).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.metricsSnapshot.tasksCompleted !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tareas Completadas</p>
                  <p className="text-2xl font-bold">{report.metricsSnapshot.tasksCompleted}</p>
                </div>
              )}
              {report.metricsSnapshot.minutesWorked !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tiempo Trabajado</p>
                  <p className="text-2xl font-bold">{formatTime(report.metricsSnapshot.minutesWorked)}</p>
                </div>
              )}
              {report.metricsSnapshot.pomodorosCompleted !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pomodoros</p>
                  <p className="text-2xl font-bold">{report.metricsSnapshot.pomodorosCompleted}</p>
                </div>
              )}
              {report.metricsSnapshot.focusScore !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Focus Score</p>
                  <p className="text-2xl font-bold">{Math.round(report.metricsSnapshot.focusScore * 100)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {report.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Fortalezas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {report.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Áreas de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Patterns */}
      {report.patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Patrones Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.patterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
