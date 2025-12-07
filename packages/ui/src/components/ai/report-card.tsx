'use client';

import { FileText, Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

export interface AIReport {
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
}

interface ReportCardProps {
  report: AIReport;
  onClick?: () => void;
  locale?: string;
  labels?: {
    scopes?: {
      TASK_COMPLETION?: string;
      WEEKLY_SCHEDULED?: string;
      MONTHLY_SCHEDULED?: string;
      PROJECT_SUMMARY?: string;
      PERSONAL_ANALYSIS?: string;
      default?: string;
    };
    metrics?: {
      tasks?: string;
      hoursWorked?: string;
      pomodoros?: string;
    };
    stats?: {
      strengths?: string;
      weaknesses?: string;
      recommendations?: string;
    };
  };
}

const DEFAULT_LABELS = {
  scopes: {
    TASK_COMPLETION: 'Task Completion',
    WEEKLY_SCHEDULED: 'Weekly Report',
    MONTHLY_SCHEDULED: 'Monthly Report',
    PROJECT_SUMMARY: 'Project Summary',
    PERSONAL_ANALYSIS: 'Personal Analysis',
    default: 'Report',
  },
  metrics: {
    tasks: 'tasks',
    hoursWorked: 'h worked',
    pomodoros: 'pomodoros',
  },
  stats: {
    strengths: 'strengths',
    weaknesses: 'areas to improve',
    recommendations: 'recommendations',
  },
};

export function ReportCard({
  report,
  onClick,
  locale = 'en',
  labels = {},
}: ReportCardProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    scopes: { ...DEFAULT_LABELS.scopes, ...labels.scopes },
    metrics: { ...DEFAULT_LABELS.metrics, ...labels.metrics },
    stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
  };

  const getScopeLabel = (scope: string): string => {
    return (
      t.scopes[scope as keyof typeof t.scopes] || t.scopes.default || scope
    );
  };

  const getScopeBadgeVariant = (
    scope: string
  ): 'default' | 'secondary' | 'outline' => {
    if (scope === 'WEEKLY_SCHEDULED') return 'default';
    if (scope === 'MONTHLY_SCHEDULED') return 'secondary';
    return 'outline';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "d 'de' MMMM, yyyy", {
      locale: locale === 'es' ? es : enUS,
    });
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:border-primary/50'
          : ''
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">
                {getScopeLabel(report.scope)}
              </CardTitle>
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
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(
                report.productivityScore
              )}`}
            >
              <TrendingUp
                className={`h-4 w-4 ${getScoreColor(report.productivityScore)}`}
              />
              <span
                className={`font-bold ${getScoreColor(report.productivityScore)}`}
              >
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
              <span>
                {report.metricsSnapshot.tasksCompleted} {t.metrics.tasks}
              </span>
            </div>
          )}
          {report.metricsSnapshot.minutesWorked !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>
                {Math.round(report.metricsSnapshot.minutesWorked / 60)}
                {t.metrics.hoursWorked}
              </span>
            </div>
          )}
          {report.metricsSnapshot.pomodorosCompleted !== undefined &&
            report.metricsSnapshot.pomodorosCompleted > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>
                  {report.metricsSnapshot.pomodorosCompleted} {t.metrics.pomodoros}
                </span>
              </div>
            )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
          <span>
            {report.strengths.length} {t.stats.strengths}
          </span>
          <span>•</span>
          <span>
            {report.weaknesses.length} {t.stats.weaknesses}
          </span>
          <span>•</span>
          <span>
            {report.recommendations.length} {t.stats.recommendations}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
