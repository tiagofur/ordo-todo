"use client";

import { useAIProfile } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { PeakHoursChart as PeakHoursChartUI } from "@ordo-todo/ui";

/**
 * PeakHoursChart - Web wrapper for the shared PeakHoursChart component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useAIProfile hook for data fetching
 * - next-intl for translations
 */
export function PeakHoursChart() {
  const t = useTranslations('PeakHoursChart');
  const { data: profile, isLoading } = useAIProfile();

  const labels = {
    title: t('title'),
    description: t('description'),
    empty: t('empty'),
    yAxis: t('yAxis'),
    tooltip: t('tooltip'),
    legendHigh: t('legend.high'),
    legendGood: t('legend.good'),
    legendFair: t('legend.fair'),
    legendLow: t('legend.low'),
  };

  return (
    <PeakHoursChartUI
      peakHours={profile?.peakHours}
      isLoading={isLoading}
      labels={labels}
    />
  );
}
