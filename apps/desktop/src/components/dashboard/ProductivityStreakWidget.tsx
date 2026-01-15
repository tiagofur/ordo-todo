/**
 * ProductivityStreakWidget - Desktop Wrapper
 * 
 * Re-exports the shared ProductivityStreakWidget from @ordo-todo/ui
 * with desktop-specific labels via react-i18next.
 */

import { useTranslation } from "react-i18next";
import { ProductivityStreakWidget as SharedProductivityStreakWidget } from "@ordo-todo/ui";

interface ProductivityStreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  accentColor?: string;
}

export function ProductivityStreakWidget({
  currentStreak,
  longestStreak,
  accentColor = "#f97316",
}: ProductivityStreakWidgetProps) {
  const { t } = useTranslation();

  return (
    <SharedProductivityStreakWidget
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      labels={{
        currentStreak: t("Dashboard.streak.currentStreak", "Racha Actual"),
        day: t("Dashboard.streak.day", "día"),
        days: t("Dashboard.streak.days", "días"),
        personalBest: t("Dashboard.streak.personalBest", "¡Récord personal!"),
        bestStreak: t("Dashboard.streak.bestStreak", "Mejor racha:"),
      }}
    />
  );
}
