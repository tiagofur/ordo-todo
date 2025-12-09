"use client";

import { useState } from "react";
import { useSessionHistory, useTimerStats } from "@/lib/api-hooks";
import { subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { 
  SessionHistory as SessionHistoryUI, 
  type SessionHistoryFilters,
  type SessionHistoryData,
  type TimerStats,
} from "@ordo-todo/ui";

/**
 * SessionHistory - Web wrapper for the shared SessionHistory component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useSessionHistory and useTimerStats hooks for data fetching
 * - next-intl for translations
 * - date-fns locales based on current locale
 */
export function SessionHistory() {
  const locale = useLocale();
  const t = useTranslations("SessionHistory");
  const dateLocale = locale === "es" ? es : enUS;

  const [filters, setFilters] = useState<SessionHistoryFilters>({
    page: 1,
    limit: 10,
    startDate: subDays(new Date(), 7).toISOString().split("T")[0],
  });

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useSessionHistory(filters);

  const { data: statsData, isLoading: isLoadingStats } = useTimerStats({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  // Map API response to component types
  const mappedHistoryData: SessionHistoryData | undefined = historyData ? {
    sessions: historyData.sessions,
    total: historyData.total,
    totalPages: historyData.totalPages,
  } : undefined;

  const mappedStatsData: TimerStats | undefined = statsData ? {
    pomodorosCompleted: statsData.pomodorosCompleted ?? 0,
    totalMinutesWorked: statsData.totalMinutesWorked ?? 0,
    avgFocusScore: statsData.avgFocusScore ?? 0,
    completionRate: statsData.completionRate ?? 0,
    dailyBreakdown: statsData.dailyBreakdown,
  } : undefined;

  const labels = {
    error: t("error"),
    statsPomodoros: t("stats.pomodoros"),
    statsTotalTime: t("stats.totalTime"),
    statsFocusScore: t("stats.focusScore"),
    statsCompletionRate: t("stats.completionRate"),
    filtersTitle: t("filters.title"),
    filtersType: t("filters.type"),
    filtersAllTypes: t("filters.allTypes"),
    filtersStatus: t("filters.status"),
    filtersAllStatus: t("filters.allStatus"),
    filtersCompletedOnly: t("filters.completedOnly"),
    sessionsTitle: t("sessions.title"),
    sessionsCount: t("sessions.count"),
    sessionsEmpty: t("sessions.empty"),
    sessionPause: t("sessions.pause"),
    sessionPauses: t("sessions.pauses"),
    typesWork: t("types.work"),
    typesShortBreak: t("types.shortBreak"),
    typesLongBreak: t("types.longBreak"),
    typesContinuous: t("types.continuous"),
    paginationShowing: (from: number, to: number, total: number) => 
      t("pagination.showing", { from, to, total }),
    chartTitle: t("chart.title"),
  };

  return (
    <SessionHistoryUI
      historyData={mappedHistoryData}
      statsData={mappedStatsData}
      isLoadingHistory={isLoadingHistory}
      isLoadingStats={isLoadingStats}
      hasError={!!historyError}
      filters={filters}
      onFiltersChange={setFilters}
      dateLocale={dateLocale as any}
      labels={labels}
    />
  );
}
