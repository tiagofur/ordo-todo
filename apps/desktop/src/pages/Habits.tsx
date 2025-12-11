import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Plus,
  Flame,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Pause,
  MoreHorizontal,
} from "lucide-react";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { 
  useTodayHabits, 
  useCompleteHabit, 
  useUncompleteHabit 
} from "@/hooks/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateHabitDialog } from "@/components/habit/create-habit-dialog";
import { HabitDetailPanel } from "@/components/habit/habit-detail-panel";

const accentColor = "#10B981"; // Emerald

export function Habits() {
  const { t } = useTranslation();

  // State
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Fetch habits from API
  const { data: todayData, isLoading } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  const habits = todayData?.habits ?? [];
  const summary = todayData?.summary ?? { total: 0, completed: 0, remaining: 0, percentage: 0 };

  const handleComplete = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabit.mutateAsync(habitId);
        toast.success(t("Habits.toast.uncompleted", "Conclusão desfeita"));
      } else {
        const result = await completeHabit.mutateAsync({ habitId }) as { 
          habit: { currentStreak: number }; 
          xpAwarded: number 
        };
        toast.success(t("Habits.toast.completed", { xp: result.xpAwarded }));
        
        // Show streak message
        if (result.habit.currentStreak === 7) {
          toast.success(t("Habits.streakMessage.week", "Uma semana completa! 🎉"));
        } else if (result.habit.currentStreak === 30) {
          toast.success(t("Habits.streakMessage.month", "Um mês! Você é imparável 🚀"));
        } else if (result.habit.currentStreak === 100) {
          toast.success(t("Habits.streakMessage.hundred", "100 dias! Lenda 🏆"));
        }
      }
    } catch (error) {
      toast.error(t("Habits.toast.error", { message: "Failed to update habit" }));
    }
  };

  // Stats cards
  const statCards = [
    {
      title: t("Habits.todayProgress", "Progresso de Hoje"),
      value: `${summary.completed}/${summary.total}`,
      subtitle: `${summary.percentage}%`,
      icon: Target,
      color: accentColor,
    },
    {
      title: t("Habits.stats.currentStreak", "Sequência atual"),
      value: habits.length > 0 ? Math.max(...habits.map((h: any) => h.currentStreak || 0)).toString() : "0",
      subtitle: "dias",
      icon: Flame,
      color: "#f59e0b",
    },
    {
      title: t("Habits.stats.longestStreak", "Melhor sequência"),
      value: habits.length > 0 ? Math.max(...habits.map((h: any) => h.longestStreak || 0)).toString() : "0",
      subtitle: "dias",
      icon: TrendingUp,
      color: "#8b5cf6",
    },
    {
      title: t("Habits.stats.thisWeek", "Esta semana"),
      value: habits.reduce((acc: number, h: any) => acc + (h.completions?.length || 0), 0).toString(),
      subtitle: "concluídos",
      icon: Calendar,
      color: "#06b6d4",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                {t("Habits.title", "Hábitos")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Habits.subtitle", "Construa rotinas positivas e mantenha o ritmo")}
              </p>
            </div>

            <button
              onClick={() => setShowCreateHabit(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <Plus className="h-4 w-4" />
              {t("Habits.newHabit", "Novo Hábito")}
            </button>
          </div>
        </SlideIn>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <FadeIn key={card.title} delay={index * 0.05}>
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: card.color,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{card.value}</p>
                      <span className="text-sm text-muted-foreground">{card.subtitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Progress Bar */}
        {summary.total > 0 && (
          <FadeIn delay={0.2}>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  {t("Habits.todayProgress", "Progresso de Hoje")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {summary.completed} / {summary.total}
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${summary.percentage}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>
          </FadeIn>
        )}

        {/* Habits List */}
        <FadeIn delay={0.25}>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("Habits.todayProgress", "Hábitos de Hoje")}
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">
                  {t("Habits.noHabits", "Nenhum hábito ainda")}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                  {t("Habits.noHabitsDescription", "Crie seu primeiro hábito")}
                </p>
                <button
                  onClick={() => setShowCreateHabit(true)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <Plus className="h-4 w-4" />
                  {t("Habits.createHabit", "Criar Hábito")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit: any) => {
                  const isCompleted = habit.completions && habit.completions.length > 0;
                  const isPaused = habit.isPaused;

                  return (
                    <div
                      key={habit.id}
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={cn(
                        "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                        isCompleted
                          ? "bg-muted/30 border-border/30"
                          : "bg-card border-border/50 hover:border-border hover:shadow-md",
                        isPaused && "opacity-60"
                      )}
                    >
                      {/* Completion Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(habit.id, isCompleted);
                        }}
                        disabled={isPaused || completeHabit.isPending || uncompleteHabit.isPending}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-500/10"
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isCompleted ? "scale-100" : "scale-0 group-hover:scale-75"
                          )}
                        />
                      </button>

                      {/* Habit Icon */}
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: habit.color || accentColor }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </div>

                      {/* Habit Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium truncate transition-all duration-300",
                            isCompleted && "line-through opacity-60"
                          )}
                        >
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {habit.currentStreak || 0}
                          </span>
                          <span>•</span>
                          <span>{String(t(`Habits.frequency.${habit.frequency}`, habit.frequency))}</span>
                        </div>
                      </div>

                      {/* Streak Badge */}
                      {habit.currentStreak >= 7 && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "#f59e0b15",
                            color: "#f59e0b",
                          }}
                        >
                          <Flame className="h-3 w-3" />
                          {habit.currentStreak}
                        </div>
                      )}

                      {/* Paused Badge */}
                      {isPaused && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          <Pause className="h-3 w-3" />
                          {t("Habits.status.paused", "Pausado")}
                        </div>
                      )}

                      {/* Actions */}
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Dialogs */}
      <CreateHabitDialog
        open={showCreateHabit}
        onOpenChange={setShowCreateHabit}
      />
      <HabitDetailPanel
        habitId={selectedHabitId}
        open={!!selectedHabitId}
        onOpenChange={(open) => !open && setSelectedHabitId(null)}
      />
    </PageTransition>
  );
}
