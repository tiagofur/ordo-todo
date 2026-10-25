import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  KeyRound,
  Search,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  Flame,
  ArrowRight,
} from "lucide-react";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@ordo-todo/ui";
import { useObjectives } from "@/hooks/api";
import { CreateObjectiveDialog } from "@/components/goals/create-objective-dialog";
import { useNavigate } from "react-router-dom";

export function Goals() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const { data: objectives, isLoading, error } = useObjectives();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed" | "at_risk"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const objectivesList = useMemo(() => objectives || [], [objectives]);

  // Real-time KPI Stats
  const stats = useMemo(() => {
    const total = objectivesList.length;
    const active = objectivesList.filter(
      (o: any) =>
        o.status !== "COMPLETED" &&
        o.status !== "CANCELLED" &&
        (o.progress ?? 0) < 100,
    ).length;
    const completed = objectivesList.filter(
      (o: any) => o.status === "COMPLETED" || (o.progress ?? 0) >= 100,
    ).length;
    const atRisk = objectivesList.filter(
      (o: any) => o.status === "AT_RISK",
    ).length;
    const avgProgress =
      total > 0
        ? Math.round(
            objectivesList.reduce(
              (acc: number, o: any) => acc + (o.progress ?? 0),
              0,
            ) / total,
          )
        : 0;
    const totalKeyResults = objectivesList.reduce(
      (acc: number, o: any) => acc + (o.keyResults?.length || 0),
      0,
    );

    return { total, active, completed, atRisk, avgProgress, totalKeyResults };
  }, [objectivesList]);

  // Stat Cards for Top KPI Bar (with standardized micro-halo)
  const statCards = [
    {
      title: t("Goals.listTitle", "Objetivos Totales"),
      value: stats.total.toString(),
      subtitle: `${stats.active} activos`,
      icon: Target,
      color: "#047857", // Emerald (acento de sección)
    },
    {
      title: t("Goals.progress", "Progreso Medio"),
      value: `${stats.avgProgress}%`,
      subtitle: `${stats.completed} completados`,
      icon: TrendingUp,
      color: "#10b981", // Emerald
    },
    {
      title: t("Goals.keyResults.title", "Resultados Clave"),
      value: stats.totalKeyResults.toString(),
      subtitle: "Métricas activas",
      icon: KeyRound,
      color: "#8b5cf6", // Purple
    },
    {
      title: "Estado de Riesgo",
      value: stats.atRisk.toString(),
      subtitle: stats.atRisk > 0 ? "Requieren atención" : "En buen camino",
      icon: Flame,
      color: stats.atRisk > 0 ? "#ef4444" : "#06b6d4", // Red or Cyan
    },
  ];

  // Filtered Objectives
  const filteredObjectives = useMemo(() => {
    return objectivesList.filter((objective: any) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = objective.title?.toLowerCase().includes(q);
        const matchDesc = objective.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // 2. Status filter
      if (statusFilter === "active") {
        return (
          objective.status !== "COMPLETED" &&
          objective.status !== "CANCELLED" &&
          (objective.progress ?? 0) < 100
        );
      }
      if (statusFilter === "completed") {
        return (
          objective.status === "COMPLETED" || (objective.progress ?? 0) >= 100
        );
      }
      if (statusFilter === "at_risk") {
        return objective.status === "AT_RISK";
      }

      return true;
    });
  }, [objectivesList, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Apple Style Unified Pattern (matching Tasks, Projects & Habits) */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/25 shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
                  {t("Goals.title", "Objetivos (OKRs)")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  {t(
                    "Goals.subtitle",
                    "Establece objetivos ambiciosos y rastrea resultados clave",
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live KPI Summary Pill */}
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                <span className="h-2 w-2 rounded-full bg-emerald-700" />
                <span>Total:</span>
                <span className="font-bold text-foreground">{stats.total}</span>
                <span className="text-border">|</span>
                <span>Activos:</span>
                <span className="font-bold text-foreground">
                  {stats.active}
                </span>
                <span className="text-border">|</span>
                <span>Progreso:</span>
                <span className="font-bold text-foreground">
                  {stats.avgProgress}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-700/25 transition-all duration-200 hover:bg-emerald-800 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Goals.createObjective", "Nuevo Objetivo")}</span>
              </button>
            </div>
          </div>
        </SlideIn>

        {/* Stats Cards (Apple KPI Bar with Micro-Halo) */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
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
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {card.title}
                  </p>
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

        {/* Row 2: Apple Standard Toolbar */}
        {objectivesList.length > 0 && (
          <SlideIn direction="top">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full lg:w-72 2xl:w-80 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar objetivos..."
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
                      { key: "active", label: "Activos" },
                      { key: "completed", label: "Completados" },
                      { key: "at_risk", label: "En Riesgo" },
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
                          : "text-muted-foreground hover:text-foreground",
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
                        : "text-muted-foreground hover:text-foreground",
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
                        : "text-muted-foreground hover:text-foreground",
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

        {/* Content Section */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-2xl border border-border/60 bg-card/60 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-6">
              <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 mb-3">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("Goals.error", "Error al cargar objetivos")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
                {t(
                  "Goals.errorDescription",
                  "No se pudieron cargar los objetivos. Intenta de nuevo.",
                )}
              </p>
            </div>
          </FadeIn>
        ) : objectivesList.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {t("Goals.noObjectives", "No hay objetivos establecidos aún")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6">
                {t(
                  "Goals.noObjectivesDescription",
                  "Define tus objetivos para mantenerte enfocado en lo que más importa.",
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium bg-emerald-700 text-white shadow-sm shadow-emerald-700/25 hover:bg-emerald-800 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Goals.createObjective", "Nuevo Objetivo")}</span>
              </button>
            </div>
          </FadeIn>
        ) : filteredObjectives.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No se encontraron objetivos
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
                No hay objetivos que coincidan con la búsqueda o el filtro
                seleccionado.
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
          /* Grid View - Apple OKR Cards */
          <FadeIn delay={0.1}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredObjectives.map((objective: any, index: number) => {
                  const color = objective.color || "#f97316";
                  const progress = Math.min(
                    100,
                    Math.max(0, Math.round(objective.progress ?? 0)),
                  );
                  const krCount = objective.keyResults?.length || 0;

                  return (
                    <motion.div
                      key={objective.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      whileHover={{
                        y: -4,
                        borderColor: `${color}70`,
                        boxShadow: `0 12px 28px -6px ${color}25`,
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                      className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/60 bg-card cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/goals/${objective.id}`)}
                    >
                      <div>
                        {/* Top Row: Color Accent & Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full ring-2 ring-background shadow-xs shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {objective.period && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 text-muted-foreground">
                                {t(
                                  `Goals.periods.${objective.period}`,
                                  objective.period,
                                )}
                              </span>
                            )}
                          </div>

                          <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                            }}
                          >
                            {t(
                              `Goals.status.${objective.status}`,
                              objective.status || "Activo",
                            )}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-semibold text-base text-foreground tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {objective.title}
                        </h3>

                        {objective.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {objective.description}
                          </p>
                        )}

                        {/* Date Range if present */}
                        {objective.startDate && objective.endDate && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(
                                objective.startDate,
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(objective.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom: Progress Bar & Key Results Count */}
                      <div className="pt-4 mt-4 border-t border-border/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <KeyRound className="h-3 w-3 text-muted-foreground" />
                            <span>{krCount} Key Results</span>
                          </span>
                          <span className="font-bold text-foreground tabular-nums">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </FadeIn>
        ) : (
          /* List View - Apple OKR Rows */
          <FadeIn delay={0.1}>
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filteredObjectives.map((objective: any, index: number) => {
                  const color = objective.color || "#f97316";
                  const progress = Math.min(
                    100,
                    Math.max(0, Math.round(objective.progress ?? 0)),
                  );
                  const krCount = objective.keyResults?.length || 0;

                  return (
                    <motion.div
                      key={objective.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      whileHover={{
                        y: -2,
                        borderColor: `${color}70`,
                        boxShadow: `0 8px 20px -4px ${color}20`,
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/goals/${objective.id}`)}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0 mt-0.5 sm:mt-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: color }}
                        >
                          <Target className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {objective.title}
                            </h3>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                              style={{
                                backgroundColor: `${color}15`,
                                color: color,
                              }}
                            >
                              {t(
                                `Goals.status.${objective.status}`,
                                objective.status || "Activo",
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {objective.period && (
                              <span>
                                {t(
                                  `Goals.periods.${objective.period}`,
                                  objective.period,
                                )}
                              </span>
                            )}
                            <span>•</span>
                            <span>{krCount} Key Results</span>
                            {objective.startDate && objective.endDate && (
                              <>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">
                                  {new Date(
                                    objective.startDate,
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    objective.endDate,
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar & Arrow on Right */}
                      <div className="flex items-center gap-4 shrink-0 sm:w-64">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-muted-foreground font-normal">
                              Progreso
                            </span>
                            <span className="text-foreground tabular-nums">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-muted-foreground group-hover:text-foreground transition-colors p-1">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </FadeIn>
        )}

        {/* Create Dialog */}
        <CreateObjectiveDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </PageTransition>
  );
}
