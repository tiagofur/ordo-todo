"use client";

/**
 * HabitsWidget - Web Wrapper
 * 
 * This is a thin wrapper around the shared HabitsWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Habit completion mutations
 * - Navigation via Next.js router
 * - i18n translations via next-intl
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { HabitsWidget as SharedHabitsWidget } from "@ordo-todo/ui";

interface HabitsWidgetProps {
  accentColor?: string;
  className?: string;
}

export function HabitsWidget({ accentColor = "#10B981", className }: HabitsWidgetProps) {
  const t = useTranslations("Habits");
  const router = useRouter();
  const { data: todayData, isLoading } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  // API returns Habit[] directly - transform to widget format
  const habitsData = Array.isArray(todayData) ? todayData : [];
  
  // Calculate summary from habits data
  const summary = {
    total: habitsData.length,
    completed: habitsData.filter((h: any) => h.completions?.length > 0).length,
    remaining: habitsData.filter((h: any) => !h.completions?.length).length,
    percentage: habitsData.length > 0
      ? Math.round((habitsData.filter((h: any) => h.completions?.length > 0).length / habitsData.length) * 100)
      : 0,
  };

  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabit.mutateAsync(habitId);
      } else {
        await completeHabit.mutateAsync({ habitId });
        toast.success(t("toast.completed", { xp: 10 }));
      }
    } catch (error) {
      toast.error(t("toast.error", { message: "Failed to update" }));
    }
  };

  return (
    <SharedHabitsWidget
      className={className}
      habits={habitsData}
      summary={summary}
      isLoading={isLoading}
      accentColor={accentColor}
      onToggleHabit={handleToggleHabit}
      onViewAll={() => router.push("/habits")}
      onCreateHabit={() => router.push("/habits")}
      labels={{
        title: t("title"),
        todayProgress: (completed, total) => 
          `${completed}/${total} ${t("todayProgress").toLowerCase()}`,
        viewAll: t("viewAll"),
        noHabits: t("noHabits"),
        createHabit: t("createHabit"),
        moreHabits: (count) => `+${count} más`,
      }}
    />
  );
}
