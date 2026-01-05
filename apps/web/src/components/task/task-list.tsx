'use client';

import { useState } from 'react';
import { AlertCircle, User, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface TaskListItem {
  id: string | number;
  title: string;
  description?: string | null;
  status: string;
}

interface TaskListProps {
  /** Tasks to display */
  tasks: TaskListItem[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Whether complete operation is pending */
  isCompleting?: boolean;
  /** Called when a task should be completed */
  onComplete?: (taskId: string) => void;
  /** Called when retry is clicked after error */
  onRetry?: () => void;
  /** Whether to show filter toggle */
  showFilter?: boolean;
  /** Whether showing user's tasks only */
  showMyTasks?: boolean;
  /** Called when filter is toggled */
  onFilterChange?: (showMyTasks: boolean) => void;
  /** Custom labels for i18n */
  labels?: {
    allTasks?: string;
    myTasks?: string;
    empty?: string;
    emptyMyTasks?: string;
    error?: (message: string) => string;
    retry?: string;
  };
  className?: string;
}

/**
 * TaskList - Platform-agnostic simple task list with checkboxes
 * 
 * Data fetching and mutations handled externally.
 * 
 * @example
 * const { data: tasks, isLoading, error, refetch } = useTasks(projectId);
 * const completeTask = useCompleteTask();
 * 
 * <TaskList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   isCompleting={completeTask.isPending}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   onRetry={refetch}
 *   labels={{ allTasks: t('allTasks') }}
 * />
 */
export function TaskList({
  tasks = [],
  isLoading = false,
  error,
  isCompleting = false,
  onComplete,
  onRetry,
  showFilter = true,
  showMyTasks: controlledShowMyTasks,
  onFilterChange,
  labels = {},
  className = '',
}: TaskListProps) {
  const [internalShowMyTasks, setInternalShowMyTasks] = useState(false);
  
  // Support both controlled and uncontrolled filter state
  const showMyTasks = controlledShowMyTasks ?? internalShowMyTasks;
  const handleFilterChange = (value: boolean) => {
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setInternalShowMyTasks(value);
    }
  };

  const {
    allTasks = 'All Tasks',
    myTasks = 'My Tasks',
    empty = 'No tasks found',
    emptyMyTasks = 'No tasks assigned to you',
    error: errorLabel = (msg: string) => `Error loading tasks: ${msg}`,
    retry = 'Retry',
  } = labels;

  if (isLoading) {
    return (
      <div className={cn('space-y-2 mt-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-16 ml-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center gap-2 mt-4', className)}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p className="font-medium">{errorLabel(error)}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="bg-background hover:bg-accent">
            {retry}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 mt-4', className)}>
      {/* Filter Toggle */}
      {showFilter && (
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border p-1 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange(false)}
              className={cn('gap-2 transition-colors', !showMyTasks && 'bg-background shadow-sm')}
            >
              <Users className="h-4 w-4" />
              {allTasks}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange(true)}
              className={cn('gap-2 transition-colors', showMyTasks && 'bg-background shadow-sm')}
            >
              <User className="h-4 w-4" />
              {myTasks}
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          {showMyTasks ? emptyMyTasks : empty}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'p-4 border rounded-lg shadow-sm flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300',
                task.status === 'COMPLETED' && 'bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'COMPLETED'}
                  onChange={() => onComplete?.(String(task.id))}
                  disabled={isCompleting || task.status === 'COMPLETED'}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <h3
                    className={cn(
                      'font-medium',
                      task.status === 'COMPLETED' && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{task.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
