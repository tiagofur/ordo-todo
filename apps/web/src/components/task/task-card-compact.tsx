'use client';

import { useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  MoreVertical,
  Trash2,
  Calendar,
  Edit,
  Circle,
  AlertCircle,
  Flame,
  Clock,
  PlayCircle,
  PauseCircle,
  ListTodo,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  cn,
  Badge,
} from '@ordo-todo/ui';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

type ViewMode = 'list' | 'grid';

export interface TaskCompactData {
  id?: string | number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  estimatedTime?: number | null;
  tags?: Array<{ id: string; name: string; color: string }>;
  project?: { id: string; name: string; color: string };
}

interface TaskCardCompactProps {
  /** Task data */
  task: TaskCompactData;
  /** Index for animation delay */
  index?: number;
  /** View mode: list or grid */
  viewMode?: ViewMode;
  /** Whether to show project info */
  showProject?: boolean;
  /** Whether to show gradient effect */
  showGradient?: boolean;
  /** Called when task is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Called when status changes */
  onStatusChange?: (taskId: string, status: string) => void;
  /** Called when delete is requested */
  onDelete?: (taskId: string) => void;
  /** Detail panel component to render when needed */
  DetailPanel?: ReactNode;
  /** Function to control DetailPanel visibility if passing it as ReactNode is not enough */
  onToggleDetail?: (open: boolean) => void;
  /** Date locale */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    // Statuses
    statusTodo?: string;
    statusInProgress?: string;
    statusCompleted?: string;
    statusOnHold?: string;
    statusLabel?: string;
    changeStatus?: string;
    // Priorities
    priorityUrgent?: string;
    priorityHigh?: string;
    priorityMedium?: string;
    priorityLow?: string;
    priorityNormal?: string;
    // Actions
    viewDetails?: string;
    delete?: string;
    // Meta (optional as icons used mostly)
  };
}

type Locale = Parameters<typeof format>[2] extends { locale?: infer L } ? L : never;

export function TaskCardCompact({
  task,
  index = 0,
  viewMode = 'list',
  showProject = false,
  showGradient: _showGradient = false,
  onTaskClick,
  onStatusChange,
  onDelete,
  DetailPanel,
  onToggleDetail,
  dateLocale,
  labels = {},
}: TaskCardCompactProps) {
  const {
    statusTodo = 'To Do',
    statusInProgress = 'In Progress',
    statusCompleted = 'Completed',
    statusOnHold = 'On Hold',
    statusLabel: _statusLabel = 'Status',
    changeStatus = 'Change Status',
    priorityUrgent = 'Urgent',
    priorityHigh = 'High',
    priorityMedium = 'Medium',
    priorityLow = 'Low',
    priorityNormal = 'Normal',
    viewDetails = 'View Details',
    delete: deleteLabel = 'Delete',
  } = labels;

  const [showDetailInternal, setShowDetailInternal] = useState(false);
  const isCompleted = task.status === 'COMPLETED';

  // Helper to handle detail opening
  const openDetail = () => {
    if (onToggleDetail) {
      onToggleDetail(true);
    } else {
      setShowDetailInternal(true);
    }
  };

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'TODO':
        return {
          color: '#6b7280',
          bgColor: '#6b728015',
          icon: ListTodo,
          label: statusTodo,
        };
      case 'IN_PROGRESS':
        return {
          color: '#3b82f6',
          bgColor: '#3b82f615',
          icon: PlayCircle,
          label: statusInProgress,
        };
      case 'COMPLETED':
        return {
          color: '#22c55e',
          bgColor: '#22c55e15',
          icon: CheckCircle2,
          label: statusCompleted,
        };
      case 'ON_HOLD':
        return {
          color: '#f59e0b',
          bgColor: '#f59e0b15',
          icon: PauseCircle,
          label: statusOnHold,
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#6b728015',
          icon: Circle,
          label: status,
        };
    }
  };

  // Priority configuration with icons
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          color: '#ef4444',
          bgColor: '#ef444420',
          icon: Flame,
          label: priorityUrgent,
        };
      case 'HIGH':
        return {
          color: '#f97316',
          bgColor: '#f9731620',
          icon: AlertCircle,
          label: priorityHigh,
        };
      case 'MEDIUM':
        return {
          color: '#3b82f6',
          bgColor: '#3b82f620',
          icon: Circle,
          label: priorityMedium,
        };
      case 'LOW':
        return {
          color: '#3b82f6',
          bgColor: '#3b82f620',
          icon: Circle,
          label: priorityLow,
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#6b728020',
          icon: Circle,
          label: priorityNormal,
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;
  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const accentColor = task.project?.color || priorityConfig.color;

  const handleStatusChange = (newStatus: string) => {
    if (task.id) {
      onStatusChange?.(String(task.id), newStatus);
    }
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(
      dateObj,
      'd MMM',
      dateLocale ? { locale: dateLocale } : undefined
    );
  };

  const isOverdue =
    !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  const handleClick = () => {
    if (onTaskClick && task.id) {
      onTaskClick(String(task.id));
    } else {
      openDetail();
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const renderStatusDropdown = (align: 'end' | 'start' = 'end') => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleMenuClick}>
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            'hover:ring-2 hover:ring-offset-1 hover:ring-offset-background',
            isCompleted && 'opacity-80'
          )}
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          <StatusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{statusConfig.label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {changeStatus}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[
          {
            value: 'TODO',
            label: statusTodo,
            icon: ListTodo,
            color: '#6b7280',
          },
          {
            value: 'IN_PROGRESS',
            label: statusInProgress,
            icon: PlayCircle,
            color: '#3b82f6',
          },
          {
            value: 'COMPLETED',
            label: statusCompleted,
            icon: CheckCircle2,
            color: '#22c55e',
          },
          {
            value: 'ON_HOLD',
            label: statusOnHold,
            icon: PauseCircle,
            color: '#f59e0b',
          },
        ].map((status) => {
          const Icon = status.icon;
          return (
            <DropdownMenuItem
              key={status.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(status.value);
              }}
              className={cn(
                'gap-2',
                task.status === status.value && 'bg-accent'
              )}
            >
              <Icon className="h-4 w-4" style={{ color: status.color }} />
              <span>{status.label}</span>
              {task.status === status.value && (
                <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleMenuClick}>
        <button
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
            'rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0'
          )}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openDetail();
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          {viewDetails}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            if (task.id) onDelete?.(String(task.id));
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // List View - Diseño mejorado más legible
  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={handleClick}
          className={cn(
            'group relative flex items-center rounded-xl border px-4 py-4 transition-all duration-200 cursor-pointer',
            isCompleted
              ? 'border-border/30 bg-muted/20 opacity-70 hover:opacity-90'
              : 'border-border/40 bg-card hover:border-border/60 hover:bg-accent/5 hover:shadow-md'
          )}
          style={{
            borderLeftWidth: '4px',
            borderLeftColor: isCompleted ? '#22c55e' : accentColor,
          }}
        >
          {/* Left Section: Title & Meta */}
          <div className="flex-1 min-w-0 pr-4">
            {/* Title */}
            <p
              className={cn(
                'font-semibold text-[17px] mb-1.5',
                isCompleted
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              )}
            >
              {task.title}
            </p>

            {/* Meta info row */}
            <div className="flex items-center gap-3 flex-wrap">
              {showProject && task.project && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <span className="truncate max-w-[150px]">
                    {task.project.name}
                  </span>
                </span>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm',
                    isOverdue
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              {task.estimatedTime && !isCompleted && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {task.estimatedTime}m
                </span>
              )}
              {/* Tags */}
              {task.tags && task.tags.length > 0 && !isCompleted && (
                <div className="flex items-center gap-1.5">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-sm text-muted-foreground">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Status, Priority & Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {renderStatusDropdown()}

            {/* Priority Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0"
              style={{
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color,
              }}
              title={priorityConfig.label}
            >
              <PriorityIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{priorityConfig.label}</span>
            </div>

            {/* Menu */}
            {renderActionsMenu()}
          </div>
        </motion.div>

        {DetailPanel &&
          (onToggleDetail
            ? DetailPanel
            : showDetailInternal && DetailPanel)}
      </>
    );
  }

  // Grid View
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        onClick={handleClick}
        className={cn(
          'group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer h-full flex flex-col',
          'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
          isCompleted
            ? 'border-border/30 bg-muted/30 opacity-60 hover:opacity-80'
            : 'border-border/50 bg-card hover:border-border'
        )}
        style={{
          borderTopWidth: '3px',
          borderTopColor: isCompleted ? '#22c55e' : accentColor,
        }}
      >
        {/* Header: Menu only */}
        <div className="relative z-10 flex items-center justify-end mb-3">
          {renderActionsMenu()}
        </div>

        {/* Title */}
        <h3
          className={cn(
            'relative z-10 font-semibold text-base leading-tight mb-2 line-clamp-2',
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </h3>

        {/* Description - only in grid */}
        {task.description && !isCompleted && (
          <p className="relative z-10 text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && !isCompleted && (
          <div className="relative z-10 flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs px-2 py-0.5 border-0 font-medium"
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-3 border-t border-dashed border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              {showProject && task.project && (
                <span className="flex items-center gap-1.5 truncate max-w-24">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <span className="truncate">{task.project.name}</span>
                </span>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isOverdue ? 'text-destructive font-medium' : ''
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>

            {/* Status & Priority */}
            <div className="flex items-center gap-2">
              {renderStatusDropdown('end')}

              {/* Priority Badge */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: priorityConfig.bgColor,
                  color: priorityConfig.color,
                }}
              >
                <PriorityIcon className="h-3.5 w-3.5" />
                <span>{priorityConfig.label}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {DetailPanel &&
          (onToggleDetail
            ? DetailPanel
            : showDetailInternal && DetailPanel)}
    </>
  );
}
