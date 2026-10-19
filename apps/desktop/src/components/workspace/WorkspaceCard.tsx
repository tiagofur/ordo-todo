import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Trash2,
  Settings as SettingsIcon,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import { useDeleteWorkspace } from "@/hooks/api";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface WorkspaceCardProps {
  workspace: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    color: string;
    icon?: string | null;
    stats?: {
      projectCount?: number;
      taskCount?: number;
      memberCount?: number;
    };
    owner?: {
      id: string;
      username: string | null;
      name: string | null;
      email: string;
    } | null;
  };
  index?: number;
  viewMode?: "grid" | "list";
}

export function WorkspaceCard({
  workspace,
  index = 0,
  viewMode = "grid",
}: WorkspaceCardProps) {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const { setSelectedWorkspaceId } = useWorkspaceStore();

  const deleteWorkspaceMutation = useDeleteWorkspace();

  const handleCardClick = () => {
    setSelectedWorkspaceId(workspace.id);

    if (workspace.owner?.username) {
      navigate(`/${workspace.owner.username}/${workspace.slug}`);
    } else {
      navigate(`/workspaces/${workspace.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm((t("common.delete", { name: workspace.name }) || `¿Eliminar "${workspace.name}"?`) + "?")) {
      try {
        await deleteWorkspaceMutation.mutateAsync(workspace.id);
        toast.success("Workspace eliminado");
      } catch (error: any) {
        toast.error(error?.message || "Error al eliminar workspace");
      }
    }
  };

  const handleSettings = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowSettings(true);
  };

  // Use custom color and icon from workspace
  const workspaceColor = workspace.color || "#f97316";

  if (viewMode === "list") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          whileHover={{
            y: -2,
            borderColor: `${workspaceColor}70`,
            boxShadow: `0 10px 24px -6px ${workspaceColor}20`,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          onClick={handleCardClick}
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          {/* Subtle colored accent strip on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: workspaceColor }}
          />

          <div className="flex items-center gap-3.5 min-w-0 pl-1.5">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border shrink-0 text-xl select-none transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: `${workspaceColor}14`,
                borderColor: `${workspaceColor}30`,
              }}
            >
              {workspace.icon || <Briefcase className="h-5 w-5" style={{ color: workspaceColor }} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                  style={{
                    backgroundColor: `${workspaceColor}18`,
                    color: workspaceColor,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: workspaceColor }}
                  />
                  Activo
                </span>
              </div>
              {workspace.description && (
                <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 tabular-nums font-medium">
                <FolderKanban className="h-3.5 w-3.5" />
                {workspace.stats?.projectCount || 0} proyectos
              </span>
              <span className="flex items-center gap-1 tabular-nums font-medium">
                <CheckSquare className="h-3.5 w-3.5" />
                {workspace.stats?.taskCount || 0} tareas
              </span>
            </div>

            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    aria-label="Más opciones"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-border/60">
                  <DropdownMenuItem
                    onClick={(e) => handleSettings(e)}
                    className="gap-2 cursor-pointer text-xs font-medium"
                  >
                    <SettingsIcon className="h-3.5 w-3.5" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="p-1.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.div>

        <WorkspaceSettingsDialog
          workspaceId={workspace.id}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </>
    );
  }

  // Grid Mode (Default Apple Card)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{
          y: -4,
          borderColor: `${workspaceColor}70`,
          boxShadow: `0 14px 30px -8px ${workspaceColor}25`,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        onClick={handleCardClick}
        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs"
      >
        {/* Subtle top ambient glow tinted with the workspace's own color */}
        <div
          className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity duration-300 group-hover:opacity-25"
          style={{ backgroundColor: workspaceColor }}
        />

        <div>
          {/* Header Row: Icon + Name + Badge + Dropdown */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 shrink-0 shadow-xs text-2xl select-none"
                style={{
                  backgroundColor: `${workspaceColor}14`,
                  borderColor: `${workspaceColor}30`,
                }}
              >
                {workspace.icon || <Briefcase className="h-6 w-6" style={{ color: workspaceColor }} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${workspaceColor}18`,
                      color: workspaceColor,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: workspaceColor }}
                    />
                    Activo
                  </span>
                  {workspace.owner?.name && (
                    <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                      • {workspace.owner.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-border/60">
                <DropdownMenuItem
                  onClick={(e) => handleSettings(e)}
                  className="gap-2 cursor-pointer text-xs font-medium"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
            {workspace.description || "Espacio de trabajo para gestionar proyectos y tareas de forma colaborativa."}
          </p>
        </div>

        {/* Bottom Footer: Stats Chips + Open Affordance */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 tabular-nums font-medium"
              title={`${workspace.stats?.projectCount || 0} proyectos`}
            >
              <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
              {workspace.stats?.projectCount || 0}
            </span>
            <span
              className="flex items-center gap-1 tabular-nums font-medium"
              title={`${workspace.stats?.taskCount || 0} tareas`}
            >
              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
              {workspace.stats?.taskCount || 0}
            </span>
            <span
              className="flex items-center gap-1 tabular-nums font-medium"
              title={`${workspace.stats?.memberCount || 1} miembros`}
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {workspace.stats?.memberCount || 1}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
            <span>Abrir</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </motion.div>

      <WorkspaceSettingsDialog
        workspaceId={workspace.id}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}

