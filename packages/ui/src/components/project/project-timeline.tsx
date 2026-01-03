import { Loader2, Calendar } from 'lucide-react';
import { cn } from '../../utils/index.js';

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priorityLabel: string;
  priorityColorClass: string;
  formattedDate: string;
}

interface ProjectTimelineProps {
  tasks?: TimelineTask[];
  isLoading?: boolean;
  labels?: {
    emptyTitle?: string;
    emptyDescription?: string;
  };
  className?: string;
}

/**
 * ProjectTimeline - Platform-agnostic component for displaying tasks chronologically
 */
export function ProjectTimeline({
  tasks = [],
  isLoading = false,
  labels = {},
  className = '',
}: ProjectTimelineProps) {
  const {
    emptyTitle = 'No tasks with due dates found.',
    emptyDescription = 'Add due dates to your tasks to see them here.',
  } = labels;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center", className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Calendar className="w-8 h-8 opacity-50" />
          <p>{emptyTitle}</p>
          <p className="text-sm">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8 py-2">
        {tasks.map((task) => (
          <div key={task.id} className="relative pl-8 group">
            {/* Dot on the line */}
            <div
              className={cn(
                'absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-black transition-colors',
                task.isCompleted
                  ? 'border-green-500 bg-green-500'
                  : 'border-primary group-hover:bg-slate-100 dark:group-hover:bg-slate-900'
              )}
            />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {task.formattedDate}
              </span>

              <div
                className={cn(
                  'p-4 rounded-lg border bg-white dark:bg-slate-950 transition-all hover:shadow-md',
                  task.isCompleted && 'opacity-80 bg-slate-50 dark:bg-slate-900'
                )}
              >
                <h4
                  className={cn(
                    'font-medium text-foreground',
                    task.isCompleted && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium border bg-slate-100 dark:bg-slate-800',
                      task.priorityColorClass
                    )}
                  >
                    {task.priorityLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
