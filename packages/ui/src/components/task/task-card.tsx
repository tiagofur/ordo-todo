'use client';

import { useState, type ReactNode } from 'react';
import { CheckSquare, MoreVertical, Trash2, Flag, Calendar, Edit, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
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
  /** Called when task card is clicked */
  onClick?: (task: TaskCardTask) => void;
  /** Called when edit action is clicked */
  onEdit?: (task: TaskCardTask) => void;
  /** Called when delete action is clicked */
  onDelete?: (task: TaskCardTask) => void;
  /** Optional detail panel to render when clicked */
  DetailPanel?: ReactNode;
  /** Date locale for formatting */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
    completed?: string;
  };
  className?: string;
}

type Locale = Parameters<typeof format>[2] extends { locale?: infer L } ? L : never;

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

/**
 * TaskCard - Platform-agnostic task display card
 * 
 * Shows task with priority, due date, tags, and subtask progress.
 * All actions handled via props.
 * 
 * @example
 * <TaskCard
 *   task={task}
 *   onClick={(t) => setSelectedTask(t)}
 *   onEdit={(t) => openEditDialog(t)}
 *   onDelete={(t) => deleteTask.mutate(t.id)}
 *   labels={{ priorityHigh: t('priority.high') }}
 * />
 */
export function TaskCard({
  task,
  index = 0,
  onClick,
  onEdit,
  onDelete,
  DetailPanel,
  dateLocale,
  labels = {},
  className = '',
}: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const {
    priorityLow = 'Low',
    priorityMedium = 'Medium',
    priorityHigh = 'High',
    priorityUrgent = 'Urgent',
    viewEdit = 'View/Edit',
    delete: deleteLabel = 'Delete',
    completed = 'Completed',
  } = labels;

  const priorityLabels: Record<string, string> = {
    LOW: priorityLow,
    MEDIUM: priorityMedium,
    HIGH: priorityHigh,
    URGENT: priorityUrgent,
  };

  const isCompleted = task.status === 'COMPLETED';
  const priority = {
    label: priorityLabels[task.priority] || priorityMedium,
    color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM,
  };

  const accentColor = task.project?.color || '#8b5cf6';

  // Subtask progress
  const subtasks = task.subTasks || [];
  const completedSubtasks = subtasks.filter((st) => st.status === 'COMPLETED').length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'd MMM', dateLocale ? { locale: dateLocale } : undefined);
  };

  const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  const handleCardClick = () => {
    if (onClick) {
      onClick(task);
    } else {
      setShowDetail(true);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else {
      setShowDetail(true);
    }
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
          'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer',
          'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20',
          isCompleted && 'opacity-60 grayscale',
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
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <CheckSquare className="h-7 w-7" />
              </div>
              <h3
                className={cn(
                  'font-bold text-xl leading-tight truncate max-w-[180px]',
                  isCompleted && 'line-through'
                )}
              >
                {task.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                    'rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
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
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
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
                  className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
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

          <div className="mt-auto pt-4 border-t border-dashed border-border/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className={cn('flex items-center gap-1.5', priority.color)}>
                  <Flag className="h-3.5 w-3.5" />
                  <span>{priority.label}</span>
                </div>
                {task.dueDate && (
                  <div className={cn('flex items-center gap-1.5', isOverdue ? 'text-red-500' : '')}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
              {isCompleted && (
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                  {completed}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      </motion.div>

      {DetailPanel && showDetail && DetailPanel}
    </>
  );
}
