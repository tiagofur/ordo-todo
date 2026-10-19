import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
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
  Repeat,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  Badge,
  cn,
} from '@ordo-todo/ui';
import { useUpdateTask, useTask, useTags, useDeleteTask } from '@/hooks/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { parseCalendarDate, isCalendarDateOverdue } from '@ordo-todo/core';
import { TaskDetailPanel } from './task-detail-panel';

type ViewMode = 'list' | 'grid';

export interface TaskCompactData {
  id?: string | number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  estimatedMinutes?: number | null;
  estimatedTime?: number | null;
  tags?: Array<{ id: string; name: string; color: string }>;
  project?: { id: string; name: string; color: string };
  recurrence?: { pattern: string; interval?: number; daysOfWeek?: number[] } | null;
}

interface TaskCardCompactProps {
  task: TaskCompactData;
  index?: number;
  viewMode?: ViewMode;
  showProject?: boolean;
  showGradient?: boolean;
  onTaskClick?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  DetailPanel?: ReactNode;
  onToggleDetail?: (open: boolean) => void;
  labels?: {
    statusTodo?: string;
    statusInProgress?: string;
    statusCompleted?: string;
    statusOnHold?: string;
    statusLabel?: string;
    changeStatus?: string;
    priorityUrgent?: string;
    priorityHigh?: string;
    priorityMedium?: string;
    priorityLow?: string;
    priorityNormal?: string;
    viewDetails?: string;
    delete?: string;
  };
}

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
  labels = {},
}: TaskCardCompactProps) {
  const {
    statusTodo = 'Por hacer',
    statusInProgress = 'En progreso',
    statusCompleted = 'Completada',
    statusOnHold = 'En espera',
    changeStatus = 'Cambiar estado',
    priorityUrgent = 'Urgente',
    priorityHigh = 'Alta',
    priorityMedium = 'Media',
    priorityLow = 'Baja',
    priorityNormal = 'Normal',
    viewDetails = 'Ver detalles',
    delete: deleteLabel = 'Eliminar',
  } = labels;

  const [showDetailInternal, setShowDetailInternal] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask ? useDeleteTask() : null;
  const isCompleted = task.status === 'COMPLETED';

  const openDetail = () => {
    if (onToggleDetail) {
      onToggleDetail(true);
    } else {
      setShowDetailInternal(true);
    }
  };

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

  const handleStatusChange = async (newStatus: string) => {
    if (!task.id || newStatus === task.status) return;
    if (onStatusChange) {
      onStatusChange(String(task.id), newStatus);
      return;
    }
    try {
      await updateTask.mutateAsync({
        taskId: String(task.id),
        data: { status: newStatus as any },
      });
      toast.success('Estado de la tarea actualizado');
    } catch {
      toast.error('Error al actualizar el estado de la tarea');
    }
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = parseCalendarDate(date);
    if (!dateObj) return null;
    return format(dateObj, 'd MMM', { locale: es });
  };

  const isOverdue =
    !isCompleted && isCalendarDateOverdue(task.dueDate, isCompleted);

  const durationMinutes = task.estimatedMinutes ?? task.estimatedTime ?? null;

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
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
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
                'gap-2 cursor-pointer',
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
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer',
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
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          {viewDetails}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async (e) => {
            e.stopPropagation();
            if (task.id) {
              if (onDelete) {
                onDelete(String(task.id));
              } else if (deleteTask) {
                try {
                  await deleteTask.mutateAsync(String(task.id));
                  toast.success('Tarea eliminada');
                } catch {
                  toast.error('Error al eliminar la tarea');
                }
              }
            }
          }}
          className="text-destructive focus:text-destructive focus:bg-red-100 dark:focus:bg-red-900 cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // List View
  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={handleClick}
          className={cn(
            'group relative flex items-center overflow-hidden rounded-xl border border-border px-4 py-4 transition-all duration-200 cursor-pointer',
            isCompleted
              ? 'bg-muted opacity-70 hover:opacity-90'
              : 'bg-card text-card-foreground hover:bg-accent/5 hover:shadow-md'
          )}
        >
          {/* Subtle accent indicator */}
          <span
            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
            style={{ backgroundColor: isCompleted ? '#22c55e' : accentColor }}
            aria-hidden="true"
          />

          {/* Left Section: Title & Meta */}
          <div className="flex-1 min-w-0 pr-4">
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
              {durationMinutes && !isCompleted && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {durationMinutes}m
                </span>
              )}
              {task.recurrence && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Repeat className="h-3 w-3" />
                  <span className="capitalize">{task.recurrence.pattern.toLowerCase()}</span>
                </span>
              )}
              {task.tags && task.tags.length > 0 && !isCompleted && (
                <div className="flex items-center gap-1.5">
                  {task.tags.slice(0, 2).map((tag: any) => (
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

            {renderActionsMenu()}
          </div>
        </motion.div>

        {DetailPanel &&
          (onToggleDetail
            ? DetailPanel
            : showDetailInternal && DetailPanel)}

        {!DetailPanel && (
          <TaskDetailPanel
            taskId={task.id ? String(task.id) : null}
            open={showDetailInternal}
            onOpenChange={setShowDetailInternal}
          />
        )}
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
          'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 text-card-foreground backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer h-full flex flex-col',
          'hover:shadow-md hover:border-purple-500/30',
          isCompleted
            ? 'bg-muted/40 opacity-70 hover:opacity-90'
            : ''
        )}
      >
        {/* Header: Project indicator & Priority + Menu */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: isCompleted ? '#22c55e' : accentColor }}
              aria-hidden="true"
            />
            {showProject && task.project && (
              <span className="text-xs text-muted-foreground truncate font-medium">
                {task.project.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority Badge */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color,
              }}
            >
              <PriorityIcon className="h-3 w-3" />
              <span>{priorityConfig.label}</span>
            </div>
            {renderActionsMenu()}
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            'relative z-10 font-semibold text-base leading-snug mb-1.5 line-clamp-2',
            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {task.title}
        </h3>

        {/* Description - only in grid */}
        {task.description && !isCompleted && (
          <p className="relative z-10 text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && !isCompleted && (
          <div className="relative z-10 flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 3).map((tag: any) => (
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
            {task.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-3 border-t border-border/40">
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Left: Due Date & Recurrence */}
            <div className="flex items-center gap-2 flex-wrap min-w-0 text-muted-foreground">
              {task.dueDate && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap font-medium',
                    isOverdue ? 'text-destructive font-semibold' : ''
                  )}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </span>
              )}
              {task.recurrence && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 whitespace-nowrap shrink-0">
                  <Repeat className="h-3 w-3 shrink-0" />
                  <span className="capitalize">{task.recurrence.pattern.toLowerCase()}</span>
                </span>
              )}
            </div>

            {/* Right: Status Dropdown */}
            <div className="shrink-0">
              {renderStatusDropdown('end')}
            </div>
          </div>
        </div>
      </motion.div>

      {DetailPanel &&
        (onToggleDetail
          ? DetailPanel
          : showDetailInternal && DetailPanel)}

      {!DetailPanel && (
        <TaskDetailPanel
          taskId={task.id ? String(task.id) : null}
          open={showDetailInternal}
          onOpenChange={setShowDetailInternal}
        />
      )}
    </>
  );
}
