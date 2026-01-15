"use client";

/**
 * AIInsightsWidget - Web Wrapper
 * 
 * This is a wrapper around the shared AIInsightsWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Type transformation from backend format
 * - Navigation via Next.js router
 * - i18n translations via next-intl
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAIInsights } from "@/lib/api-hooks";
import { useAuth } from "@ordo-todo/auth-provider";
import { AIInsightsWidget as SharedAIInsightsWidget, type Insight } from "@ordo-todo/ui";

// Map backend insight types to shared widget types
const BACKEND_TYPE_MAP: Record<string, Insight["type"]> = {
  "OVERDUE_ALERT": "UPCOMING_DEADLINES",
  "WORKLOAD_IMBALANCE": "WORKLOAD_IMBALANCE",
  "PEAK_HOUR_TIP": "PRODUCTIVITY_PEAK",
  "ENERGY_OPTIMIZATION": "ENERGY_OPTIMIZATION",
  "BREAK_REMINDER": "SUGGESTED_BREAKS",
  "REST_SUGGESTION": "REST_SUGGESTION",
  "ACHIEVEMENT_CELEBRATION": "ACHIEVEMENT_CELEBRATION",
  "STREAK_MOTIVATION": "ACHIEVEMENT_CELEBRATION",
  "STREAK_MILESTONE": "ACHIEVEMENT_CELEBRATION",
  "WEEKLY_ACCOMPLISHMENT": "COMPLETION_CELEBRATION",
};

interface AIInsightsWidgetProps {
  className?: string;
  maxInsights?: number;
}

export function AIInsightsWidget({ className, maxInsights = 3 }: AIInsightsWidgetProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const {
    data,
    isLoading,
    isRefetching: isRefreshing,
    refetch: fetchInsights,
  } = useAIInsights({ enabled: isAuthenticated });

  // Transform backend data to shared widget format
  const allInsights: Insight[] = ((data as any)?.insights || []).map((i: any) => ({
    ...i,
    type: BACKEND_TYPE_MAP[i.type] || i.type,
  }));

  // Filter dismissed and limit
  const visibleInsights = allInsights
    .filter((_: Insight, index: number) => !dismissedIds.has(index))
    .slice(0, maxInsights);

  const handleDismiss = (index: number) => {
    setDismissedIds(prev => new Set(prev).add(index));
  };

  const handleAction = (insight: Insight) => {
    if (insight.actionUrl) {
      router.push(insight.actionUrl);
    }
  };

  return (
    <SharedAIInsightsWidget
      insights={visibleInsights}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={() => fetchInsights()}
      onDismiss={handleDismiss}
      onAction={handleAction}
      className={className}
      labels={{
        title: t("aiInsights"),
        emptyTitle: t("noInsights"),
        emptyDescription: t("aiSuggestion"),
        viewAll: t("viewAllInsights"),
      }}
    />
  );
}
