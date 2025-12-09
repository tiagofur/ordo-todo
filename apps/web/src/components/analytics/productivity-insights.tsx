"use client";

import { useOptimalSchedule } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { ProductivityInsights as ProductivityInsightsUI } from "@ordo-todo/ui";

/**
 * ProductivityInsights - Web wrapper for the shared ProductivityInsights component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useOptimalSchedule hook for data fetching
 * - next-intl for translations
 */
export function ProductivityInsights() {
  const t = useTranslations('ProductivityInsights');
  const { data: schedule, isLoading } = useOptimalSchedule({ topN: 5 });

  const labels = {
    title: t('title'),
    description: t('description'),
    empty: t('empty'),
    peakHoursTitle: t('peakHours.title'),
    peakHoursDescription: t('peakHours.description'),
    peakDaysTitle: t('peakDays.title'),
    peakDaysDescription: t('peakDays.description'),
    tip: t('tip'),
  };

  return (
    <ProductivityInsightsUI
      schedule={schedule}
      isLoading={isLoading}
      labels={labels}
    />
  );
}
