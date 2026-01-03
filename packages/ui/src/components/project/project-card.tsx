import {
  FolderKanban,
  MoreVertical,
  Archive,
  Trash2,
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
import { Progress } from '../ui/progress.js';

export interface ProjectDisplayData {
  id?: string | number;
  name: string;
  description?: string | null;
  color: string;
  archived: boolean;
  slug?: string;
  tasksCount?: number;
  completedTasksCount?: number;
}

interface ProjectCardProps {
  project: ProjectDisplayData;
  index?: number;
  /** Explicit click handler, overrides default navigation logic */
  onProjectClick?: (project: ProjectDisplayData) => void;
  /** Callback for archiving project */
  onArchive?: (projectId: string) => void;
  /** Callback for deleting project */
  onDelete?: (projectId: string) => void;
  /** Progress percentage (0-100) */
  progressPercent?: number;
  /** Formatted tasks progress string (e.g. "5 / 10") */
  formattedTasksProgress?: string;
  /** Labels for i18n */
  labels?: {
    actions?: {
      archive?: string;
      unarchive?: string;
      delete?: string;
    };
    progressLabel?: string;
    archived?: string;
    moreOptions?: string;
  };
  className?: string;
}

/**
 * ProjectCard - Platform-agnostic component for project summary
 */
export function ProjectCard({
  project,
  onProjectClick,
  onArchive,
  onDelete,
  progressPercent = 0,
  formattedTasksProgress = "0 / 0",
  labels = {},
  className = '',
}: ProjectCardProps) {
  const accentColor = project.color || '#ec4899';
  const moreOptionsLabel = labels.moreOptions || "More options";

  const handleCardClick = () => {
    onProjectClick?.(project);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.id && onArchive) onArchive(String(project.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.id && onDelete) onDelete(String(project.id));
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm',
        'hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900',
        project.archived && 'opacity-60 grayscale',
        className
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: accentColor,
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                backgroundColor: '#f3f4f6', // Solid light background
                color: accentColor,
              }}
            >
              <FolderKanban className="h-7 w-7" />
            </div>

            <div>
              <h3 className="font-bold text-xl leading-tight mb-1 truncate max-w-[180px] text-foreground">
                {project.name}
              </h3>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className="transition-opacity duration-200 rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label={moreOptionsLabel}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {project.archived
                  ? labels.actions?.unarchive || 'Unarchive'
                  : labels.actions?.archive || 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {labels.actions?.delete || 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 grow">
            {project.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-dashed border-border space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{labels.progressLabel || 'Progress'}</span>
              <span
                className="font-medium"
                style={{ color: accentColor }}
              >
                {progressPercent}%
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-1.5"
              style={
                {
                  '--progress-foreground': accentColor,
                } as React.CSSProperties
              }
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckSquare className="h-4 w-4" />
              <span>
                {formattedTasksProgress}
              </span>
            </div>
            {project.archived && (
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {labels.archived || 'Archived'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
