import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
  Search,
  X,
  LayoutGrid,
  List,
  RotateCcw,
} from "lucide-react";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import {
  useTodayHabits,
  useCompleteHabit,
  useUncompleteHabit,
} from "@/hooks/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateHabitDialog } from "@/components/habit/create-habit-dialog";
import { HabitDetailPanel } from "@/components/habit/habit-detail-panel";

const accentColor = "#10B981"; // Emerald

export function Habits() {
  const { t } = (useTranslation as any)();

  // State
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "paused">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch habits from API
  const { data: todayData, isLoading } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  const habitsData = Array.isArray(todayData) ? todayData : (todayData?.habits ?? []);
  const habits = habitsData;

  const summary = todayData?.summary ?? {
    total: habitsData.length,
    completed: habitsData.filter((h: any) => h.completions && h.completions.length > 0).length,
    remaining: habitsData.filter((h: any) => !h.completions || h.completions.length === 0).length,
    percentage:
      habitsData.length > 0
        ? Math.round(
            (habitsData.filter((h: any) => h.completions && h.completions.length > 0).length /
              habitsData.length) *
              100
          )
        : 0,
  };

  const handleComplete = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabit.mutateAsync(habitId);
        toast.success(t("Habits.toast.uncompleted", "Completión deshecha"));
      } else {
        const result = (await completeHabit.mutateAsync({ habitId })) as {
          habit: { currentStreak: number };
          xpAwarded: number;
        };
        toast.success(t("Habits.toast.completed", { xp: result.xpAwarded }));

        // Show streak message
        const streak = result.habit.currentStreak;
        if (streak === 7) {
          toast.success(t("Habits.streakMessage.week", "¡Una semana completa! 🎉"));
        } else if (streak === 30) {
          toast.success(t("Habits.streakMessage.month", "¡Un mes! Eres imparable 🚀"));
        } else if (streak === 100) {
          toast.success(t("Habits.streakMessage.hundred", "¡100 días! Leyenda 🏆"));
        }
      }
    } catch (error) {
      toast.error(t("Habits.toast.error", { message: "Error al actualizar hábito" }));
    }
  };

  // Stats cards
  const statCards = [
    {
      title: t("Habits.todayProgress", "Progreso de Hoy"),
      value: `${summary.completed}/${summary.total}`,
      subtitle: `${summary.percentage}%`,
      icon: Target,
      color: "#10B981",
    },
    {
      title: t("Habits.stats.currentStreak", "Racha actual"),
      value: habits.length > 0 ? Math.max(...habits.map((h: any) => h.currentStreak || 0)).toString() : "0",
      subtitle: t("Habits.stats.days", "días"),
      icon: Flame,
      color: "#f59e0b",
    },
    {
      title: t("Habits.stats.longestStreak", "Mejor racha"),
      value: habits.length > 0 ? Math.max(...habits.map((h: any) => h.longestStreak || 0)).toString() : "0",
      subtitle: t("Habits.stats.days", "días"),
      icon: TrendingUp,
      color: "#8b5cf6",
    },
    {
      title: t("Habits.stats.thisWeek", "Esta semana"),
      value: habits.reduce((acc: number, h: any) => acc + (h.completions?.length || 0), 0).toString(),
      subtitle: t("Habits.stats.completedCount", "completados"),
      icon: Calendar,
      color: "#06b6d4",
    },
  ];

  // Filtering
  const filteredHabits = useMemo(() => {
    return habits.filter((habit: any) => {
      const isCompleted = habit.completions && habit.completions.length > 0;
      const isPaused = !!habit.isPaused;

      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = habit.name?.toLowerCase().includes(query);
        const matchesDesc = habit.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Status Filter
      if (statusFilter === "pending") {
        return !isCompleted && !isPaused;
      }
      if (statusFilter === "completed") {
        return isCompleted;
      }
      if (statusFilter === "paused") {
        return isPaused;
      }

      return true;
    });
  }, [habits, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const todayFormatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Apple Style Unified Pattern (matching Tasks, Calendar & Projects) */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 shrink-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
                  {t("Habits.title", "Hábitos")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  {t("Habits.subtitle", "Construye rotinas positivas y mantén el impulso")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live KPI Summary Pill */}
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Total:</span>
                <span className="font-bold text-foreground">{summary.total}</span>
                <span className="text-border">|</span>
                <span>Completados:</span>
                <span className="font-bold text-foreground">{summary.completed}</span>
                <span className="text-border">|</span>
                <span>Pendientes:</span>
                <span className="font-bold text-foreground">{summary.remaining}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateHabit(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 hover:bg-emerald-600 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Habits.newHabit", "Nuevo Hábito")}</span>
              </button>
            </div>
          </div>
        </SlideIn>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -4,
                borderColor: `${card.color}70`,
                boxShadow: `0 12px 28px -6px ${card.color}25`,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{card.title}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
                      {card.value}
                    </p>
                    <span className="text-xs text-muted-foreground/80 font-medium truncate">
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Apple Health Activity Progress Card */}
        {habits.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground capitalize">
                    {todayFormatted}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {summary.completed === summary.total && summary.total > 0
                      ? t("Habits.allDone", "¡Todos completados!")
                      : t("Habits.keepGoing", "¡Sigue así!")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <span>
                    {summary.completed} de {summary.total}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {summary.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${summary.percentage}%` }}
                />
              </div>
            </div>
          </FadeIn>
        )}

        {/* Row 2: Apple Standard Toolbar */}
        {habits.length > 0 && (
          <SlideIn direction="top">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full lg:w-72 2xl:w-80 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar hábitos..."
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs & View Toggle */}
              <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap sm:flex-nowrap">
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                  {(
                    [
                      { key: "all", label: "Todos" },
                      { key: "pending", label: "Pendientes" },
                      { key: "completed", label: "Completados" },
                      { key: "paused", label: "Pausados" },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setStatusFilter(filter.key)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                        statusFilter === filter.key
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* View Switcher: Grid vs List */}
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Cuadrícula"
                    aria-label="Cuadrícula"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Cuadrícula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Lista"
                    aria-label="Lista"
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                </div>
              </div>
            </div>
          </SlideIn>
        )}

        {/* Habits Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : habits.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {t("Habits.noHabits", "No hay hábitos aún")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
                {t("Habits.noHabitsDescription", "Crea tu primer hábito para empezar a construir rutinas positivas")}
              </p>
              <button
                type="button"
                onClick={() => setShowCreateHabit(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Habits.createHabit", "Crear Hábito")}</span>
              </button>
            </div>
          </FadeIn>
        ) : filteredHabits.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No se encontraron hábitos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
                No hay hábitos que coincidan con la búsqueda o el filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpiar filtros</span>
              </button>
            </div>
          </FadeIn>
        ) : viewMode === "grid" ? (
          /* Grid View - Apple Health Cards */
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHabits.map((habit: any) => {
                const isCompleted = habit.completions && habit.completions.length > 0;
                const isPaused = !!habit.isPaused;

                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabitId(habit.id)}
                    className={cn(
                      "group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer",
                      isCompleted
                        ? "bg-card/70 border-border/60 hover:border-emerald-500/40"
                        : "bg-card border-border/60 hover:border-border hover:shadow-xs",
                      isPaused && "opacity-65"
                    )}
                  >
                    <div>
                      {/* Card Header: Icon + Streaks / Badges + More */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: habit.color || accentColor }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {habit.currentStreak > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tabular-nums">
                              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>{habit.currentStreak}</span>
                            </div>
                          )}

                          {isPaused && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/40">
                              <Pause className="h-3 w-3" />
                              <span>{t("Habits.status.paused", "Pausado")}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHabitId(habit.id);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                            aria-label="Opciones del hábito"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-3.5">
                        <h3
                          className={cn(
                            "font-semibold text-base text-foreground tracking-tight line-clamp-1 transition-all duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
                            isCompleted && "line-through text-muted-foreground/80"
                          )}
                        >
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {habit.description}
                          </p>
                        )}
                      </div>

                      {/* Frequency & Time of day tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-medium">
                          {String(t(`Habits.frequency.${habit.frequency}`, habit.frequency))}
                        </span>
                        {habit.timeOfDay && (
                          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-medium">
                            {String(t(`Habits.timeOfDay.${habit.timeOfDay}`, habit.timeOfDay))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom: Completion CTA */}
                    <div className="pt-3.5 mt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {isCompleted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completado hoy
                          </span>
                        ) : (
                          "Pendiente para hoy"
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(habit.id, !!isCompleted);
                        }}
                        disabled={isPaused || completeHabit.isPending || uncompleteHabit.isPending}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 cursor-pointer shrink-0 hover:scale-105 active:scale-95",
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                            : "border-border/80 hover:border-emerald-500 hover:bg-emerald-500/10 text-transparent hover:text-emerald-500"
                        )}
                        aria-label={isCompleted ? "Marcar como pendiente" : "Completar hábito"}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 transition-all duration-200",
                            isCompleted ? "scale-100" : "scale-0 group-hover:scale-75"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        ) : (
          /* List View - Apple Checklist Rows */
          <FadeIn delay={0.1}>
            <div className="space-y-2.5">
              {filteredHabits.map((habit: any) => {
                const isCompleted = habit.completions && habit.completions.length > 0;
                const isPaused = !!habit.isPaused;

                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabitId(habit.id)}
                    className={cn(
                      "group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                      isCompleted
                        ? "bg-card/70 border-border/60 hover:border-emerald-500/40"
                        : "bg-card border-border/60 hover:border-border hover:shadow-xs",
                      isPaused && "opacity-65"
                    )}
                  >
                    {/* Completion Check Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(habit.id, !!isCompleted);
                      }}
                      disabled={isPaused || completeHabit.isPending || uncompleteHabit.isPending}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 cursor-pointer shrink-0 hover:scale-105 active:scale-95",
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                          : "border-border/80 hover:border-emerald-500 hover:bg-emerald-500/10 text-transparent hover:text-emerald-500"
                      )}
                      aria-label={isCompleted ? "Marcar como pendiente" : "Completar hábito"}
                    >
                      <CheckCircle2
                        className={cn(
                          "h-5 w-5 transition-all duration-200",
                          isCompleted ? "scale-100" : "scale-0 group-hover:scale-75"
                        )}
                      />
                    </button>

                    {/* Habit Icon */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: habit.color || accentColor }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            "font-semibold text-sm sm:text-base text-foreground tracking-tight truncate transition-all duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
                            isCompleted && "line-through text-muted-foreground/80"
                          )}
                        >
                          {habit.name}
                        </h3>
                        {isPaused && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/40 shrink-0">
                            <Pause className="h-3 w-3" />
                            {t("Habits.status.paused", "Pausado")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {habit.currentStreak || 0} {t("Habits.stats.days", "días")}
                        </span>
                        <span>•</span>
                        <span>{String(t(`Habits.frequency.${habit.frequency}`, habit.frequency))}</span>
                        {habit.timeOfDay && (
                          <>
                            <span>•</span>
                            <span>{String(t(`Habits.timeOfDay.${habit.timeOfDay}`, habit.timeOfDay))}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Badges / Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {habit.currentStreak >= 7 && (
                        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tabular-nums">
                          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>Racha de {habit.currentStreak}d</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHabitId(habit.id);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        aria-label="Opciones del hábito"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}
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
