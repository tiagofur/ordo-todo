import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, Settings as SettingsIcon, Briefcase, FolderKanban, CheckSquare } from "lucide-react";
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
    owner?: {
      id: string;
      username: string | null;
      name: string | null;
      email: string;
    } | null;
  };
  index?: number;
}

export function WorkspaceCard({ workspace, index = 0 }: WorkspaceCardProps) {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const { setSelectedWorkspaceId } = useWorkspaceStore();

  const deleteWorkspaceMutation = useDeleteWorkspace();

  const handleCardClick = () => {
    // Store the selected workspace ID
    setSelectedWorkspaceId(workspace.id);

    // Navigate to workspace detail page
    // Try username/slug pattern first, fallback to ID route
    if (workspace.owner?.username) {
      navigate(`/${workspace.owner.username}/${workspace.slug}`);
    } else {
      // Fallback to ID route (Desktop supports both)
      navigate(`/workspaces/${workspace.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('common.delete', { name: workspace.name }) + '?')) {
      try {
        await deleteWorkspaceMutation.mutateAsync(workspace.id);
        toast.success("Workspace eliminado");
      } catch (error: any) {
        toast.error(error?.message || "Error al eliminar workspace");
      }
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(true);
  };

  // Use custom color and icon from workspace
  const workspaceColor = workspace.color || "#2563EB";
  const workspaceIcon = workspace.icon || "🏠";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={handleCardClick}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
          "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
        )}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: workspaceColor,
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Icon Box */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: `${workspaceColor}15`,
                  color: workspaceColor,
                }}
              >
                <span className="text-2xl">{workspaceIcon}</span>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-xl leading-tight mb-2">
                  {workspace.name}
                </h3>
                <div className="flex items-center justify-between">
                  {/* Status Badge */}
                  <div
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${workspaceColor}15`,
                      color: workspaceColor,
                    }}
                  >
                    Activo
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSettings}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {workspace.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
              {workspace.description}
            </p>
          )}

          {/* Stats Section */}
          <div className="mt-auto pt-4 border-t border-dashed border-border/50">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FolderKanban className="h-4 w-4" />
                <span>0 proyectos</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckSquare className="h-4 w-4" />
                <span>0 tareas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: workspaceColor }}
        />
      </motion.div>

      <WorkspaceSettingsDialog
        workspaceId={workspace.id}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}
