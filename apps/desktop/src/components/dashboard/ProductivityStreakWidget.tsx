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
  className?: string;
}

export function ProductivityStreakWidget({
  currentStreak,
  longestStreak,
  accentColor = "#f97316",
  className,
}: ProductivityStreakWidgetProps) {
  const { t } = useTranslation();

  return (
    <SharedProductivityStreakWidget
      className={className}
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
