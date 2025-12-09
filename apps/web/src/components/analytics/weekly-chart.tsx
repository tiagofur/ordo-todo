"use client";

import { useWeeklyMetrics } from "@/lib/api-hooks";
import { useLocale, useTranslations } from "next-intl";
import { WeeklyChart as WeeklyChartUI, type WeeklyMetric } from "@ordo-todo/ui";

interface WeeklyChartProps {
  weekStart?: Date;
}

/**
 * WeeklyChart - Web wrapper for the shared WeeklyChart component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useWeeklyMetrics hook for data fetching
 * - next-intl for translations and locale
 */
export function WeeklyChart({ weekStart }: WeeklyChartProps) {
  const t = useTranslations('WeeklyChart');
  const locale = useLocale();
  
  const weekStartParam = weekStart ? weekStart.toISOString().split('T')[0] : undefined;
  const { data: metrics, isLoading } = useWeeklyMetrics(
    weekStartParam ? { weekStart: weekStartParam } : undefined
  );

  // Map API response to component format
  const mappedMetrics: WeeklyMetric[] = (metrics ?? []).map((m: any) => ({
    date: m.date,
    tasksCompleted: m.tasksCompleted ?? 0,
    minutesWorked: m.minutesWorked ?? 0,
  }));

  const labels = {
    title: t('title'),
    description: t('description'),
    weekOf: t('weekOf', { date: '' }).replace('', ''), // Extract base text without date
    tasks: t('tasks'),
    minutes: t('minutes'),
    tasksCompleted: t('tasksCompleted'),
    minutesWorked: t('minutesWorked'),
    tooltipTasks: t('tooltip.tasks'),
    tooltipTime: t('tooltip.time'),
  };

  return (
    <WeeklyChartUI
      metrics={mappedMetrics}
      isLoading={isLoading}
      weekStart={weekStart}
      labels={labels}
      locale={locale === 'es' ? 'es-ES' : 'en-US'}
    />
  );
}
