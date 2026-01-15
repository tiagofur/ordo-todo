/**
 * OkrWidget - Desktop Wrapper
 * 
 * This is a thin wrapper around the shared OkrWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Navigation via react-router-dom
 * - i18n translations via react-i18next
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useObjectivesDashboard } from "@/hooks/api";
import { OkrWidget as SharedOkrWidget } from "@ordo-todo/ui";

export function OkrWidget() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const { data: summary, isLoading } = useObjectivesDashboard();

  return (
    <SharedOkrWidget
      summary={summary}
      isLoading={isLoading}
      onNavigate={(path) => navigate(path)}
      accentColor="#ec4899"
      labels={{
        title: t("Goals.title"),
        averageProgress: t("Goals.averageProgress"),
        viewAll: t("Goals.viewAll"),
        total: t("Goals.total"),
        completed: t("Goals.completed"),
        okrsAtRisk: t("Goals.okrsAtRisk"),
        left: t("Goals.left"),
        noObjectives: t("Goals.noObjectives"),
        createObjective: t("Goals.createObjective"),
      }}
    />
  );
}
