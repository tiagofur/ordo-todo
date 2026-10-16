/**
 * HabitsWidget - Desktop Wrapper
 * 
 * This is a thin wrapper around the shared HabitsWidget from @ordo-todo/ui.
 * It provides:
 * - Data fetching via hooks
 * - Habit completion mutations
 * - Navigation via react-router-dom
 * - i18n translations via react-i18next
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/hooks/api";
import { HabitsWidget as SharedHabitsWidget } from "@ordo-todo/ui";

interface HabitsWidgetProps {
  accentColor?: string;
}

export function HabitsWidget({ accentColor = "#10B981" }: HabitsWidgetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        toast.success(t("Habits.toast.completed", "Hábito completado +10 XP"));
      }
    } catch (error) {
      toast.error(t("Habits.toast.error", "Error al actualizar hábito"));
    }
  };

  return (
    <SharedHabitsWidget
      habits={habitsData}
      summary={summary}
      isLoading={isLoading}
      accentColor={accentColor}
      onToggleHabit={handleToggleHabit}
      onViewAll={() => navigate("/habits")}
      onCreateHabit={() => navigate("/habits")}
      labels={{
        title: t("Habits.title", "Hábitos"),
        todayProgress: (completed, total) => 
          `${completed}/${total} ${t("Habits.todayProgress", "Hoy")}`,
        viewAll: t("Habits.viewAll", "Ver todos"),
        noHabits: t("Habits.noHabits", "No hay hábitos"),
        createHabit: t("Habits.createHabit", "Crear hábito"),
        moreHabits: (count) => `+${count} más`,
      }}
    />
  );
}
