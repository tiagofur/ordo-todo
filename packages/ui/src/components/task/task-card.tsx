import { type ReactNode } from 'react';
import { CheckSquare, MoreVertical, Trash2, Flag, Calendar, Edit, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
import { Badge } from '../ui/badge.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';

export interface TaskCardTask {
  id?: string | number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  tags?: Array<{ id: string | number; name: string; color: string }>;
  project?: { id: string; name: string; color: string };
  subTasks?: Array<{
    id: string | number;
    title: string;
    status: string;
  }>;
}

interface TaskCardProps {
  task: TaskCardTask;
  index?: number;
  /** Whether the detail view is currently shown (controlled externally) */
  isExpanded?: boolean;
  /** Called when the card is clicked to toggle details */
  onToggleExpand?: (task: TaskCardTask) => void;
  /** Called when edit action is clicked */
  onEdit?: (task: TaskCardTask) => void;
  /** Called when delete action is clicked */
  onDelete?: (task: TaskCardTask) => void;
  /** Optional detail panel to render when expanded */
  DetailPanel?: ReactNode;
  /** Formatted due date string - passed from caller to maintain platform agnosticism */
  formattedDueDate?: string | null;
  /** Whether the task is overdue - passed from caller */
  isOverdue?: boolean;
  /** Component labels for i18n */
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
    completed?: string;
    moreOptions?: string;
  };
  /** Pre-calculated priority info */
  priorityInfo?: {
    label: string;
    colorClass: string;
  };
  className?: string;
}

/**
 * TaskCard - Platform-agnostic task display card
 * 
 * Shows task with priority, due date, tags, and subtask progress.
 * All state and complex logic (dates, progress) should be handled by the caller.
 */
export function TaskCard({
  task,
  index = 0,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  DetailPanel,
  formattedDueDate,
  isOverdue = false,
  priorityInfo,
  labels = {},
  className = '',
}: TaskCardProps) {
  const {
    priorityMedium = 'Medium',
    viewEdit = 'View/Edit',
    delete: deleteLabel = 'Delete',
    completed = 'Completed',
    moreOptions = 'More options',
  } = labels;

  const isCompleted = task.status === 'COMPLETED';
  const priority = priorityInfo || {
    label: priorityMedium,
    colorClass: 'text-blue-500',
  };

  const accentColor = task.project?.color || '#8b5cf6';

  // Subtask progress calculations (simple math is okay in pure component)
  const subtasks = task.subTasks || [];
  const completedSubtasks = subtasks.filter((st) => st.status === 'COMPLETED').length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleCardClick = () => {
    onToggleExpand?.(task);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task);
  };

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
          'hover:shadow-xl hover:bg-accent/5',
          isCompleted && 'grayscale opacity-80',
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
                  backgroundColor: '#f3f4f6', // Solid light gray background
                  color: accentColor,
                }}
              >
                <CheckSquare className="h-7 w-7" />
              </div>
              <h3
                className={cn(
                  'font-bold text-xl leading-tight truncate max-w-[180px]',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    'transition-opacity duration-200',
                    'rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={moreOptions}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  {viewEdit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive focus:bg-destructive-foreground dark:focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium bg-muted text-muted-foreground"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
              {task.description}
            </p>
          )}

          {/* Subtasks Progress Bar */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
              <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-dashed border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className={cn('flex items-center gap-1.5', priority.colorClass)}>
                  <Flag className="h-3.5 w-3.5" />
                  <span>{priority.label}</span>
                </div>
                {formattedDueDate && (
                  <div className={cn('flex items-center gap-1.5', isOverdue ? 'text-destructive font-semibold' : '')}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDueDate}</span>
                  </div>
                )}
              </div>
              {isCompleted && (
                <div className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {completed}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {DetailPanel && isExpanded && DetailPanel}
    </>
  );
}
