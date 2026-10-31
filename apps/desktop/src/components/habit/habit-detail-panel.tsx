import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Flame,
  TrendingUp,
  Calendar,
  BarChart3,
  Trash2,
  Pause,
  Play,
  Edit3,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  useHabit,
  useHabitStats,
  useDeleteHabit,
  usePauseHabit,
  useResumeHabit,
} from "@/hooks/api";
import { toast } from "sonner";
import { toCalendarDateString } from "@ordo-todo/core";
import type { Habit } from "@ordo-todo/api-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Label,
  Input,
  Textarea,
  Button,
} from "@ordo-todo/ui";
import { cn } from "@/lib/utils";

interface HabitDetailPanelProps {
  habitId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ODD 025 S4: abre el diálogo de edición completa (color, frecuencia…). */
  onEditRequest?: (habit: Habit) => void;
}

export function HabitDetailPanel({ habitId, open, onOpenChange, onEditRequest }: HabitDetailPanelProps) {
  const { t } = (useTranslation as any)();

  const { data: habit, isLoading: isLoadingHabit } = useHabit(habitId || "");
  const { data: stats, isLoading: isLoadingStats } = useHabitStats(habitId || "");

  const deleteHabit = useDeleteHabit();
  const pauseHabit = usePauseHabit();
  const resumeHabit = useResumeHabit();

  const isLoading = isLoadingHabit || isLoadingStats;

  const handleDelete = async () => {
    if (!habitId) return;
    if (!confirm(t("Habits.confirmDelete", "Tem certeza que deseja excluir este hábito?"))) return;

    try {
      await deleteHabit.mutateAsync(habitId);
      toast.success(t("Habits.toast.deleted", "Hábito excluído"));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t("Habits.toast.error", { message: error?.message || "Falha ao excluir" }));
    }
  };

  const handleTogglePause = async () => {
    if (!habitId || !habit) return;
    try {
      if (habit.isPaused) {
        await resumeHabit.mutateAsync(habitId);
        toast.success(t("Habits.toast.resumed", "Hábito retomado"));
      } else {
        await pauseHabit.mutateAsync(habitId);
        toast.success(t("Habits.toast.paused", "Hábito pausado"));
      }
    } catch (error: any) {
      toast.error(t("Habits.toast.error", { message: error?.message || "Falha ao atualizar" }));
    }
  };

  const accentColor = habit?.color || "#10B981";

  // Calculate calendar data for the last 30 days
  const calendarData = stats?.calendarData || [];
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = toCalendarDateString(date);
    const found = calendarData.find((d: any) => toCalendarDateString(d.date) === dateStr);
    return {
      date: dateStr,
      completed: found?.completed || false,
      dayOfWeek: date.getDay(),
    };
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-habits" />
          </div>
        ) : habit ? (
          <div className="space-y-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40`,
                  }}
                >
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl font-semibold truncate">
                    {habit.name}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {habit.isPaused ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Pause className="h-3 w-3" />
                        {t("Habits.status.paused", "Pausado")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-habits/10 text-habits">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("Habits.status.active", "Ativo")}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {t(`Habits.frequency.${habit.frequency}`, habit.frequency)}
                    </span>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Description */}
            {habit.description && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("Habits.form.description", "Descrição")}
                </Label>
                <p className="text-sm">{habit.description}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("Habits.stats.currentStreak", "Sequência atual")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{habit.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">dias</p>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-purple-500 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("Habits.stats.longestStreak", "Melhor sequência")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{habit.longestStreak || 0}</p>
                <p className="text-xs text-muted-foreground">dias</p>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-cyan-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("Habits.stats.totalCompletions", "Vezes concluído")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stats?.totalCompletions || 0}</p>
                <p className="text-xs text-muted-foreground">vezes</p>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-habits mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("Habits.stats.completionRate", "Taxa de sucesso")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">{t("Habits.stats.thisWeek", "Esta semana")}</p>
              </div>
            </div>

            {/* Calendar Heatmap */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Últimos 30 dias
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground pb-1">
                    {day}
                  </div>
                ))}
                {/* Empty cells for alignment */}
                {Array.from({ length: last30Days[0]?.dayOfWeek || 0 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {last30Days.map((day, i) => (
                  <div
                    key={day.date}
                    className={cn(
                      "aspect-square rounded-sm transition-all duration-300",
                      day.completed 
                        ? "bg-habits shadow-sm shadow-habits/50 scale-110" 
                        : "bg-muted/50 hover:bg-muted"
                    )}
                    title={day.date}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => habit && onEditRequest?.(habit)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {t("Habits.actions.edit", "Editar")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTogglePause}
                  disabled={pauseHabit.isPending || resumeHabit.isPending}
                  className="flex-1"
                >
                  {habit.isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {t("Habits.actions.resume", "Retomar")}
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      {t("Habits.actions.pause", "Pausar")}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleDelete}
                  disabled={deleteHabit.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("Habits.actions.delete", "Excluir")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p>Hábito não encontrado</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
