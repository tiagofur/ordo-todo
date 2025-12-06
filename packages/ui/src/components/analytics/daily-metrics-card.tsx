"use client";

import { useDailyMetrics, useTimerStats } from "@/lib/api-hooks";
import { formatDuration } from "@ordo-todo/core";
import { getFocusScoreColor } from "@ordo-todo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card.js";
import { CheckCircle2, Clock, Target, Zap } from "lucide-react";
import { Skeleton } from "../ui/skeleton.js";
import { useTranslations } from "next-intl";

interface DailyMetricsCardProps {
  date?: Date;
}

export function DailyMetricsCard({ date }: DailyMetricsCardProps) {
  const t = useTranslations("DailyMetricsCard");

  // Get date range for today or specified date
  const targetDate = date || new Date();
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    23,
    59,
    59
  );

  // Use useTimerStats for timer-related data (time worked, pomodoros)
  const { data: timerStats, isLoading: isLoadingTimer } = useTimerStats({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  // Use useDailyMetrics for task-related data (tasks completed, focus score)
  // API returns array of DailyMetrics, we take the first one
  const { data: metricsArray, isLoading: isLoadingMetrics } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const metrics = metricsArray?.[0];

  const isLoading = isLoadingTimer || isLoadingMetrics;

  const formatFocusScore = (score?: number): string => {
    if (!score) return "N/A";
    return `${Math.round(score * 100)}%`;
  };

  // Use shared getFocusScoreColor from @ordo-todo/ui
  // Note: metrics.focusScore is 0-1, getFocusScoreColor expects 0-100
  const getFocusScoreTextClass = (score?: number): string => {
    if (!score) return "text-muted-foreground";
    return getFocusScoreColor(Math.round(score * 100)).text;
  };

  const formattedDate = date
    ? date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("today");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tasks Completed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("metrics.completed")}</span>
            </div>
            <div className="text-3xl font-bold">
              {metrics?.tasksCompleted || 0}
              <span className="text-sm text-muted-foreground ml-1">
                / {metrics?.tasksCreated || 0}
              </span>
            </div>
          </div>

          {/* Time Worked */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("metrics.time")}</span>
            </div>
            <div className="text-3xl font-bold">
              {formatDuration(timerStats?.totalMinutesWorked || 0)}
            </div>
          </div>

          {/* Pomodoros */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{t("metrics.pomodoros")}</span>
            </div>
            <div className="text-3xl font-bold">
              {timerStats?.pomodorosCompleted || 0}
            </div>
          </div>

          {/* Focus Score */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>{t("metrics.focus")}</span>
            </div>
            <div
              className={`text-3xl font-bold ${getFocusScoreTextClass(metrics?.focusScore)}`}
            >
              {formatFocusScore(metrics?.focusScore)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
