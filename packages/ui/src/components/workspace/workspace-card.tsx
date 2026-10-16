import { type ReactNode } from "react";
import {
  MoreVertical,
  Trash2,
  Settings as SettingsIcon,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { cn } from "../../utils/index.js";
import { motion } from "framer-motion";

export interface WorkspaceData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  projectsCount?: number;
  tasksCount?: number;
}

interface WorkspaceCardProps {
  workspace: WorkspaceData;
  index?: number;
  onWorkspaceClick?: (workspace: WorkspaceData) => void;
  onDelete?: (workspaceId: string) => void;
  onOpenSettings?: (workspaceId: string) => void;
  renderSettingsDialog?: () => ReactNode;
  labels?: {
    status?: {
      active?: string;
    };
    stats?: {
      projects?: (count: number) => string;
      tasks?: (count: number) => string;
    };
    actions?: {
      settings?: string;
      delete?: string;
      moreOptions?: string;
    };
    confirmDelete?: (name: string) => string;
  };
  className?: string;
}

const DEFAULT_LABELS = {
  status: {
    active: "Active",
  },
  stats: {
    projects: (count: number) => `${count} projects`,
    tasks: (count: number) => `${count} tasks`,
  },
  actions: {
    settings: "Settings",
    delete: "Delete",
    moreOptions: "More options",
  },
};

/**
 * WorkspaceCard - Platform-agnostic workspace display card
 * Simplified to use custom icon and color directly (no tier/type logic)
 */
export function WorkspaceCard({
  workspace,
  index = 0,
  onWorkspaceClick,
  onDelete,
  onOpenSettings,
  renderSettingsDialog,
  labels = {},
  className = '',
}: WorkspaceCardProps) {
  const t = {
    ...DEFAULT_LABELS,
    status: { ...DEFAULT_LABELS.status, ...labels.status },
    stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
    actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
  };

  const handleCardClick = () => {
    onWorkspaceClick?.(workspace);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(workspace.id);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenSettings?.(workspace.id);
  };

  const displayColor = workspace.color || '#f97316';
  const displayBg = `${displayColor}15`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        onClick={handleCardClick}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm',
          'hover:shadow-lg hover:border-border/80',
          className
        )}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Icon Box */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: displayBg,
                  color: displayColor,
                }}
              >
                {workspace.icon ? (
                  <span className="text-2xl leading-none select-none">
                    {workspace.icon}
                  </span>
                ) : (
                  <FolderKanban className="h-7 w-7" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-xl leading-tight mb-2">
                  {workspace.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {t.status.active}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    'transition-opacity duration-200',
                    'rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={t.actions.moreOptions}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSettings}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  {t.actions.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive focus:bg-destructive-foreground dark:focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.actions.delete}
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
          <div className="mt-auto pt-4 border-t border-dashed border-border">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FolderKanban className="h-4 w-4" />
                <span>{t.stats.projects(workspace.projectsCount ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckSquare className="h-4 w-4" />
                <span>{t.stats.tasks(workspace.tasksCount ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {renderSettingsDialog?.()}
    </>
  );
}
