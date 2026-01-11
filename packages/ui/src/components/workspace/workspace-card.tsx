import { type ReactNode } from 'react';
import {
  MoreVertical,
  Trash2,
  Settings as SettingsIcon,
  Briefcase,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import { cn } from '../../utils/index.js';
import { motion } from 'framer-motion';

export interface WorkspaceData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  type: 'PERSONAL' | 'WORK' | 'TEAM';
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
  /** Render a settings dialog/modal - controlled externally */
  renderSettingsDialog?: () => ReactNode;
  labels?: {
    types?: {
      PERSONAL?: string;
      WORK?: string;
      TEAM?: string;
    };
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

const typeConfig = {
  PERSONAL: {
    label: 'PERSONAL',
    hexColor: '#06b6d4',
    bgSolid: '#daedf4', // 15% Cyan on white
    bgSolidDark: '#083344', // 20% Cyan on black/dark
    icon: Briefcase,
  },
  WORK: {
    label: 'WORK',
    hexColor: '#a855f7',
    bgSolid: '#f3e8ff', // 15% Purple on white
    bgSolidDark: '#3b0764', // 20% Purple on black/dark
    icon: FolderKanban,
  },
  TEAM: {
    label: 'TEAM',
    hexColor: '#ec4899',
    bgSolid: '#fce7f3', // 15% Pink on white
    bgSolidDark: '#500724', // 20% Pink on black/dark
    icon: CheckSquare,
  },
};

const DEFAULT_LABELS = {
  types: {
    PERSONAL: 'Personal',
    WORK: 'Work',
    TEAM: 'Team',
  },
  status: {
    active: 'Active',
  },
  stats: {
    projects: (count: number) => `${count} projects`,
    tasks: (count: number) => `${count} tasks`,
  },
  actions: {
    settings: 'Settings',
    delete: 'Delete',
    moreOptions: 'More options',
  },
};

/**
 * WorkspaceCard - Platform-agnostic workspace display card
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
    ...labels,
    types: { ...DEFAULT_LABELS.types, ...labels.types },
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

  const typeInfo = typeConfig[workspace.type as keyof typeof typeConfig] || typeConfig.PERSONAL;
  const TypeIcon = typeInfo.icon;

  // Use custom color if available, otherwise fallback to type default
  const displayColor = workspace.color || typeInfo.hexColor;
  
  // Use 15% opacity of the custom color for background (hex + 26 = ~15% alpha)
  // This works well for both light and dark modes compared to solid opaque colors
  const displayBg = workspace.color 
    ? `${workspace.color}26` 
    : typeInfo.bgSolid;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={handleCardClick}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm',
          'hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900', // Solid colors
          className
        )}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: displayColor,
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Icon Box */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: displayBg,
                  color: displayColor,
                }}
              >
                {workspace.icon ? (
                  <span className="text-2xl leading-none select-none">{workspace.icon}</span>
                ) : (
                  <TypeIcon className="h-7 w-7" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-xl leading-tight mb-2">
                  {workspace.name}
                </h3>
                <div className="flex items-center justify-between">
                  {/* Badge with solid background */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: displayBg,
                      color: displayColor,
                    }}
                  >
                    {t.types[workspace.type]}
                  </span>
                  <div
                    className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground"
                  >
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
