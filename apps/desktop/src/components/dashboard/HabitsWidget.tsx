import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ChevronRight, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/hooks/api";

interface HabitsWidgetProps {
  accentColor?: string;
}

export function HabitsWidget({ accentColor = "#10B981" }: HabitsWidgetProps) {
  const { t } = useTranslation();
  const { data: todayData, isLoading } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  // API returns Habit[] directly now
  const habitsData = Array.isArray(todayData) ? todayData : [];
  const habits = habitsData.slice(0, 4);
    // Summary is not available in array response, mocking for UI stability
  const summary = { 
    total: habitsData.length, 
    completed: habitsData.filter((h: any) => h.completions?.length > 0).length,
    remaining: habitsData.filter((h: any) => !h.completions?.length).length,
    percentage: habitsData.length > 0 ? Math.round((habitsData.filter((h: any) => h.completions?.length > 0).length / habitsData.length) * 100) : 0
  };

  const handleComplete = async (e: React.MouseEvent, habitId: string, isCompleted: boolean) => {
    e.preventDefault();
    e.stopPropagation();

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("Habits.title", "Hábitos")}</h3>
              <p className="text-xs text-muted-foreground">
                {summary.completed}/{summary.total} {t("Habits.todayProgress", "Hoy")}
              </p>
            </div>
          </div>
          <Link
            to="/habits"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("Habits.viewAll", "Ver todos")}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Progress Bar */}
        {summary.total > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Habits List */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t("Habits.noHabits", "No hay hábitos")}</p>
            <Link
              to="/habits"
              className="mt-2 text-xs font-medium hover:underline"
              style={{ color: accentColor }}
            >
              {t("Habits.createHabit", "Crear hábito")}
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {habits.map((habit: any, index: number) => {
              const isCompleted = habit.completions && habit.completions.length > 0;
              const isPending = completeHabit.isPending || uncompleteHabit.isPending;

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                    isCompleted
                      ? "bg-muted/30"
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* Completion Button */}
                  <button
                    onClick={(e) => handleComplete(e, habit.id, isCompleted)}
                    disabled={isPending || habit.isPaused}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0",
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/30 hover:border-emerald-500"
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>

                  {/* Habit Icon */}
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-white shrink-0"
                    style={{ backgroundColor: habit.color || accentColor }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate transition-all",
                        isCompleted && "line-through opacity-60"
                      )}
                    >
                      {habit.name}
                    </p>
                  </div>

                  {/* Streak Badge */}
                  {habit.currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 text-orange-500 shrink-0">
                      <Flame className="h-3 w-3" />
                      <span className="text-xs font-medium">{habit.currentStreak}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Show more link if there are more habits */}
            {habitsData.length > 4 && (
              <Link
                to="/habits"
                className="block text-center py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                +{(habitsData.length) - 4} más
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div 
        className="absolute -right-8 -top-8 opacity-5 pointer-events-none"
        style={{ color: accentColor }}
      >
        <Sparkles className="h-32 w-32" />
      </div>
    </motion.div>
  );
}
