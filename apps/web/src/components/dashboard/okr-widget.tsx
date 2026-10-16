"use client";

/**
 * OkrWidget - Web Wrapper
 * 
 * This is a thin wrapper around the shared OkrWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Navigation via next-intl Link/router
 * - i18n translations via next-intl
 */

import { useRouter } from "next/navigation";
import { useObjectivesDashboardSummary } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { OkrWidget as SharedOkrWidget } from "@ordo-todo/ui";

interface OkrWidgetProps {
  accentColor?: string;
}

export function OkrWidget({ accentColor = "#ec4899" }: OkrWidgetProps) {
  const t = useTranslations("Goals");
  const router = useRouter();
  const { data: summary, isLoading } = useObjectivesDashboardSummary();

  return (
    <SharedOkrWidget
      summary={summary}
      isLoading={isLoading}
      onNavigate={(path) => router.push(path)}
      accentColor={accentColor}
      labels={{
        title: t("title"),
        averageProgress: t("averageProgress"),
        viewAll: t("viewAll"),
        total: t("total"),
        completed: t("completed"),
        okrsAtRisk: t("okrsAtRisk"),
        left: t("left"),
        noObjectives: t("noObjectives"),
        createObjective: t("createObjective"),
      }}
    />
  );
}
