import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Users,
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List,
} from "lucide-react";
import { useWorkspaces } from "@/hooks/api";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { useUIStore } from "@/stores/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@ordo-todo/ui";

export function Workspaces() {
  const { t } = (useTranslation as any)();
  const { openCreateWorkspaceDialog } = useUIStore();
  const { data: workspaces, isLoading } = useWorkspaces();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const workspacesList = useMemo(() => (Array.isArray(workspaces) ? workspaces : []), [workspaces]);

  // Live KPI Summary
  const stats = useMemo(() => {
    const total = workspacesList.length;
    const totalProjects = workspacesList.reduce(
      (acc: number, w: any) => acc + (w.stats?.projectCount || 0),
      0
    );
    const totalTasks = workspacesList.reduce(
      (acc: number, w: any) => acc + (w.stats?.taskCount || 0),
      0
    );
    const totalMembers = workspacesList.reduce(
      (acc: number, w: any) => acc + (w.stats?.memberCount || 1),
      0
    );
    return { total, totalProjects, totalTasks, totalMembers };
  }, [workspacesList]);

  // Stat Cards for Top KPI Bar (with standardized Apple micro-halo)
  const statCards = [
    {
      title: "Espacios Totales",
      value: stats.total.toString(),
      subtitle: "Entornos activos",
      icon: Briefcase,
      color: "#f97316", // Orange
    },
    {
      title: "Proyectos Totales",
      value: stats.totalProjects.toString(),
      subtitle: "En todos los espacios",
      icon: FolderKanban,
      color: "#ec4899", // Pink
    },
    {
      title: "Tareas Asignadas",
      value: stats.totalTasks.toString(),
      subtitle: "Carga acumulada",
      icon: CheckSquare,
      color: "#8b5cf6", // Purple
    },
    {
      title: "Colaboradores",
      value: stats.totalMembers.toString(),
      subtitle: "Miembros del equipo",
      icon: Users,
      color: "#06b6d4", // Cyan
    },
  ];

  // Filtered Workspaces
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspacesList;
    const q = searchQuery.toLowerCase().trim();
    return workspacesList.filter((w: any) => {
      const nameMatch = w.name?.toLowerCase().includes(q);
      const descMatch = w.description?.toLowerCase().includes(q);
      const slugMatch = w.slug?.toLowerCase().includes(q);
      return nameMatch || descMatch || slugMatch;
    });
  }, [workspacesList, searchQuery]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Row 1: Header - Standard Apple Pattern */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm shadow-orange-500/25 shrink-0"
              >
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("Workspaces.title") || "Espacios de Trabajo"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate max-w-sm md:max-w-md lg:max-w-lg">
                  {t("Workspaces.subtitle") || "Organiza tus proyectos y tareas en diferentes espacios de trabajo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Live KPI Summary Pill */}
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>Total:</span>
                <span className="font-bold text-foreground">{stats.total}</span>
                <span className="text-border">|</span>
                <span>Proyectos:</span>
                <span className="font-bold text-foreground">{stats.totalProjects}</span>
                <span className="text-border">|</span>
                <span>Tareas:</span>
                <span className="font-bold text-foreground">{stats.totalTasks}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateWorkspaceDialog}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-500/25 transition-all duration-200 hover:bg-orange-600 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Workspaces.newWorkspace") || "Nuevo Workspace"}</span>
              </motion.button>
            </div>
          </div>
        </SlideIn>

        {/* Row 1.5: Stats Cards (Apple KPI Bar with Micro-Halo - Always Visible) */}
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

        {/* Row 2: Apple Standard Toolbar */}
        {workspacesList.length > 0 && (
          <SlideIn direction="top">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 md:w-80 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar espacios de trabajo..."
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
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

              {/* View Switcher: Grid vs List */}
              <div className="flex items-center justify-end">
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Vista Cuadrícula"
                    aria-label="Cuadrícula"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cuadrícula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Vista Lista"
                    aria-label="Lista"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>
            </div>
          </SlideIn>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl border border-border/60 bg-card/60 animate-pulse"
              />
            ))}
          </div>
        ) : workspacesList.length === 0 ? (
          /* Empty State (0 Workspaces) */
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/70 rounded-2xl bg-card/40 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-4">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5">
                {t("Workspaces.noWorkspaces") || "No tienes workspaces"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {t("Workspaces.noWorkspacesDescription") || "Crea tu primer espacio de trabajo para comenzar a organizar tus proyectos y tareas con tu equipo."}
              </p>
              <button
                type="button"
                onClick={openCreateWorkspaceDialog}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Workspaces.createWorkspace") || "Crear Workspace"}</span>
              </button>
            </div>
          </FadeIn>
        ) : filteredWorkspaces.length === 0 ? (
          /* Search Empty State */
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No se encontraron espacios de trabajo
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
                No hay espacios que coincidan con &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpiar búsqueda</span>
              </button>
            </div>
          </FadeIn>
        ) : viewMode === "grid" ? (
          /* Grid Mode: Apple Masonry/Grid of Workspace Cards */
          <FadeIn delay={0.1}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredWorkspaces.map((workspace: any, index: number) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    index={index}
                    viewMode="grid"
                  />
                ))}
              </AnimatePresence>
            </div>
          </FadeIn>
        ) : (
          /* List Mode: Clean Apple Rows */
          <FadeIn delay={0.1}>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredWorkspaces.map((workspace: any, index: number) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    index={index}
                    viewMode="list"
                  />
                ))}
              </AnimatePresence>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}

