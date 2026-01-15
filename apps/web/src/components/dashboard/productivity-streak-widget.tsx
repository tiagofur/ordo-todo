"use client";

/**
 * ProductivityStreakWidget - Web Wrapper
 * 
 * Re-exports the shared ProductivityStreakWidget from @ordo-todo/ui
 * with web-specific labels via next-intl.
 */

import { useTranslations } from "next-intl";
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
  const t = useTranslations("Dashboard");

  return (
    <SharedProductivityStreakWidget
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      labels={{
        currentStreak: t("streak.currentStreak"),
        day: t("streak.day"),
        days: t("streak.days"),
        personalBest: t("streak.personalBest"),
        bestStreak: t("streak.bestStreak"),
      }}
    />
  );
}
