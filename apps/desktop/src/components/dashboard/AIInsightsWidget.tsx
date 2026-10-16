/**
 * AIInsightsWidget - Desktop Wrapper
 * 
 * This is a wrapper around the shared AIInsightsWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Type transformation from backend format
 * - Navigation via react-router-dom
 * - i18n translations via react-i18next
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAIInsights } from "@/hooks/api";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      navigate(insight.actionUrl);
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
        title: t("Dashboard.aiInsights", "AI Insights"),
        emptyTitle: t("Dashboard.noInsights", "No hay insights en este momento"),
        emptyDescription: t("Dashboard.aiSuggestion", "Continúa trabajando y la IA te dará sugerencias"),
        viewAll: t("Dashboard.viewAllInsights", "Ver todos los insights"),
      }}
    />
  );
}
