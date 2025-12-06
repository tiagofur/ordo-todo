'use client';

import { useState, type ReactNode } from 'react';
import { Loader2, CheckCircle2, Calendar, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/index.js';
import { EmptyState } from '../ui/empty-state.js';

export interface ProjectTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | Date | null;
}

interface ProjectListProps {
  /** Tasks to display */
  tasks: ProjectTask[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Whether status update is pending */
  isUpdating?: boolean;
  /** Called when task status should toggle */
  onStatusToggle?: (task: ProjectTask) => void;
  /** Called when a task row is clicked */
  onTaskClick?: (task: ProjectTask) => void;
  /** Called when create task action is clicked */
  onCreateTask?: () => void;
  /** Task detail panel component (rendered when a task is selected) */
  TaskDetailPanel?: ReactNode;
  /** Create task dialog component */
  CreateTaskDialog?: ReactNode;
  /** Date locale for formatting */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    columnTask?: string;
    columnDueDate?: string;
    columnPriority?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
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
 * ProjectList - Platform-agnostic task list for a project
 * 
 * Data fetching and mutations handled externally.
 * 
 * @example
 * const { data: tasks, isLoading } = useTasks(projectId);
 * const updateTask = useUpdateTask();
 * 
 * <ProjectList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   onStatusToggle={(task) => updateTask.mutate({
 *     taskId: task.id,
 *     data: { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }
 *   })}
 *   onTaskClick={(task) => setSelectedTaskId(task.id)}
 *   labels={{ columnTask: t('task') }}
 * />
 */
export function ProjectList({
  tasks = [],
  isLoading = false,
  isUpdating = false,
  onStatusToggle,
  onTaskClick,
  onCreateTask,
  TaskDetailPanel,
  CreateTaskDialog,
  dateLocale,
  labels = {},
  className = '',
}: ProjectListProps) {
  const {
    columnTask = 'Task',
    columnDueDate = 'Due Date',
    columnPriority = 'Priority',
    emptyTitle = 'No tasks yet',
    emptyDescription = 'Create your first task to get started',
    emptyAction = 'Create Task',
  } = labels;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          icon={ListTodo}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyAction}
          onAction={onCreateTask}
        />
        {CreateTaskDialog}
      </>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-6"></div>
          <div>{columnTask}</div>
          <div>{columnDueDate}</div>
          <div>{columnPriority}</div>
        </div>

        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
              onClick={() => onTaskClick?.(task)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusToggle?.(task);
                }}
                disabled={isUpdating}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  task.status === 'COMPLETED'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-muted-foreground/40 hover:border-primary'
                )}
              >
                {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div
                className={cn(
                  'font-medium',
                  task.status === 'COMPLETED' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {task.dueDate && (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    {format(
                      new Date(task.dueDate),
                      'MMM d',
                      dateLocale ? { locale: dateLocale } : undefined
                    )}
                  </>
                )}
              </div>

              <div
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full bg-muted',
                  PRIORITY_COLORS[task.priority] || 'text-gray-500'
                )}
              >
                {task.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      {TaskDetailPanel}
    </div>
  );
}
