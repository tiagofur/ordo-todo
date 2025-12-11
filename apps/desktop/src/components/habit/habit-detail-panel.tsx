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
  useUpdateHabit,
  useDeleteHabit,
  usePauseHabit,
  useResumeHabit,
} from "@/hooks/api";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HabitDetailPanelProps {
  habitId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitDetailPanel({ habitId, open, onOpenChange }: HabitDetailPanelProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const { data: habit, isLoading: isLoadingHabit } = useHabit(habitId || "");
  const { data: stats, isLoading: isLoadingStats } = useHabitStats(habitId || "");

  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const pauseHabit = usePauseHabit();
  const resumeHabit = useResumeHabit();

  const isLoading = isLoadingHabit || isLoadingStats;

  const handleStartEdit = () => {
    if (habit) {
      setEditedName(habit.name);
      setEditedDescription(habit.description || "");
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!habitId) return;
    try {
      await updateHabit.mutateAsync({
        habitId,
        data: {
          name: editedName,
          description: editedDescription || undefined,
        },
      });
      toast.success(t("Habits.toast.updated", "Hábito atualizado"));
      setIsEditing(false);
    } catch (error: any) {
      toast.error(t("Habits.toast.error", { message: error?.message || "Falha ao atualizar" }));
    }
  };

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
    const dateStr = date.toISOString().split("T")[0];
    const found = calendarData.find((d: any) => d.date === dateStr);
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                  {isEditing ? (
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-xl font-semibold"
                      autoFocus
                    />
                  ) : (
                    <SheetTitle className="text-xl font-semibold truncate">
                      {habit.name}
                    </SheetTitle>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {habit.isPaused ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Pause className="h-3 w-3" />
                        {t("Habits.status.paused", "Pausado")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
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
            {(habit.description || isEditing) && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("Habits.form.description", "Descrição")}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{habit.description}</p>
                )}
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
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t("Habits.stats.completionRate", "Taxa de sucesso")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                <p className="text-xs text-muted-foreground">taxa de sucesso</p>
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
                      "aspect-square rounded-sm transition-colors",
                      day.completed ? "bg-emerald-500" : "bg-muted hover:bg-muted/80"
                    )}
                    title={day.date}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                    {t("Habits.form.cancel", "Cancelar")}
                  </Button>
                  <Button className="flex-1" onClick={handleSave} disabled={updateHabit.isPending}>
                    {updateHabit.isPending ? "..." : t("Habits.actions.edit", "Salvar")}
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={handleStartEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    {t("Habits.actions.edit", "Editar")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTogglePause}
                    disabled={pauseHabit.isPending || resumeHabit.isPending}
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={handleDelete}
                    disabled={deleteHabit.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("Habits.actions.delete", "Excluir")}
                  </Button>
                </>
              )}
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
