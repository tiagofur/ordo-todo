"use client";

import { useTranslations } from "next-intl";
import { AIWeeklyReport as AIWeeklyReportUI, type ProductivityData } from "@ordo-todo/ui";

interface AIWeeklyReportProps {
  data?: ProductivityData;
  onRefresh?: () => void;
  className?: string;
}

/**
 * AIWeeklyReport - Web wrapper for the shared AIWeeklyReport component
 * 
 * Integrates the platform-agnostic UI component with next-intl translations.
 */
export function AIWeeklyReport({ data, onRefresh, className }: AIWeeklyReportProps) {
  const t = useTranslations("AIReport");

  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    generateButton: t("generateButton"),
    analyzing: t("analyzing"),
    emptyState: t("emptyState"),
    regenerate: t("regenerate"),
    export: t("export"),
    stats: {
      pomodoros: t("stats.pomodoros"),
      tasks: t("stats.tasks"),
      streak: t("stats.streak"),
      average: t("stats.average"),
    },
  };

  return (
    <AIWeeklyReportUI
      data={data}
      onRefresh={onRefresh}
      labels={labels}
      className={className}
    />
  );
}
