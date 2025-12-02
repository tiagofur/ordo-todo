"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

interface ReportCardProps {
  report: {
    id: string;
    scope: string;
    summary: string;
    productivityScore: number;
    generatedAt: Date | string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    metricsSnapshot: {
      tasksCompleted?: number;
      minutesWorked?: number;
      pomodorosCompleted?: number;
    };
  };
  onClick?: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const t = useTranslations('ReportCard');
  const getScopeLabel = (scope: string): string => {
    switch (scope) {
      case "TASK_COMPLETION":
        return t('scopes.TASK_COMPLETION');
      case "WEEKLY_SCHEDULED":
        return t('scopes.WEEKLY_SCHEDULED');
      case "MONTHLY_SCHEDULED":
        return t('scopes.MONTHLY_SCHEDULED');
      case "PROJECT_SUMMARY":
        return t('scopes.PROJECT_SUMMARY');
      case "PERSONAL_ANALYSIS":
        return t('scopes.PERSONAL_ANALYSIS');
      default:
        return t('scopes.default');
    }
  };

  const getScopeBadgeVariant = (scope: string): "default" | "secondary" | "outline" => {
    if (scope === "WEEKLY_SCHEDULED") return "default";
    if (scope === "MONTHLY_SCHEDULED") return "secondary";
    return "outline";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "d 'de' MMMM, yyyy", { locale: es });
  };

  return (
    <Card
      className={`transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-md hover:border-primary/50" : ""}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{getScopeLabel(report.scope)}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {formatDate(report.generatedAt)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getScopeBadgeVariant(report.scope)}>
              {getScopeLabel(report.scope)}
            </Badge>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(report.productivityScore)}`}>
              <TrendingUp className={`h-4 w-4 ${getScoreColor(report.productivityScore)}`} />
              <span className={`font-bold ${getScoreColor(report.productivityScore)}`}>
                {report.productivityScore}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {report.summary}
        </p>

        {/* Metrics Snapshot */}
        <div className="flex items-center gap-4 text-sm">
          {report.metricsSnapshot.tasksCompleted !== undefined && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{report.metricsSnapshot.tasksCompleted} {t('metrics.tasks')}</span>
            </div>
          )}
          {report.metricsSnapshot.minutesWorked !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>{Math.round(report.metricsSnapshot.minutesWorked / 60)}{t('metrics.hoursWorked')}</span>
            </div>
          )}
          {report.metricsSnapshot.pomodorosCompleted !== undefined && report.metricsSnapshot.pomodorosCompleted > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span>{report.metricsSnapshot.pomodorosCompleted} {t('metrics.pomodoros')}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
          <span>{report.strengths.length} {t('stats.strengths')}</span>
          <span>•</span>
          <span>{report.weaknesses.length} {t('stats.weaknesses')}</span>
          <span>•</span>
          <span>{report.recommendations.length} {t('stats.recommendations')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
