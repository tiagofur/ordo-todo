"use client";

import { useDailyMetrics, useTimerStats } from "@/lib/api-hooks";
import { formatDuration } from "@ordo-todo/core";
import { useTranslations } from "next-intl";
import { 
  DailyMetricsCard as DailyMetricsCardUI, 
  getFocusScoreColor,
  type DailyMetricsData, 
  type TimerStatsData 
} from "@ordo-todo/ui";

interface DailyMetricsCardProps {
  date?: Date;
}

/**
 * DailyMetricsCard - Web wrapper for the shared DailyMetricsCard component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useDailyMetrics and useTimerStats hooks for data fetching
 * - formatDuration and getFocusScoreColor from core
 * - next-intl for translations
 */
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
  const { data: metricsArray, isLoading: isLoadingMetrics } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  const metrics = metricsArray?.[0];
  const isLoading = isLoadingTimer || isLoadingMetrics;

  // Map to component format
  const mappedMetrics: DailyMetricsData | undefined = metrics ? {
    tasksCompleted: metrics.tasksCompleted,
    tasksCreated: metrics.tasksCreated,
    focusScore: metrics.focusScore,
  } : undefined;

  const mappedTimerStats: TimerStatsData | undefined = timerStats ? {
    totalMinutesWorked: timerStats.totalMinutesWorked,
    pomodorosCompleted: timerStats.pomodorosCompleted,
  } : undefined;

  const labels = {
    title: t("title"),
    today: t("today"),
    completed: t("metrics.completed"),
    time: t("metrics.time"),
    pomodoros: t("metrics.pomodoros"),
    focus: t("metrics.focus"),
  };

  // Use getFocusScoreColor from @ordo-todo/core
  const getFocusScoreColorClass = (score: number): string => {
    return getFocusScoreColor(score).text;
  };

  return (
    <DailyMetricsCardUI
      metrics={mappedMetrics}
      timerStats={mappedTimerStats}
      isLoading={isLoading}
      date={date}
      formatDuration={formatDuration}
      getFocusScoreColorClass={getFocusScoreColorClass}
      labels={labels}
    />
  );
}
