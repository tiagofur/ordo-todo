'use client';

import { Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/index.js';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string | Date;
}

interface ProjectTimelineProps {
  tasks?: Task[];
  isLoading?: boolean;
  dateLocale?: any; // strict typing for locale is bulky, any is fine for now
  labels?: {
    emptyTitle?: string;
    emptyDescription?: string;
  };
}

export function ProjectTimeline({
  tasks = [],
  isLoading = false,
  dateLocale,
  labels = {},
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

  // Filter tasks with due dates and sort them
  const timelineTasks = tasks
    .filter((t) => t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );

  if (timelineTasks.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Calendar className="w-8 h-8 opacity-50" />
          <p>{emptyTitle}</p>
          <p className="text-sm">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
        {timelineTasks.map((task) => {
          const date = new Date(task.dueDate!);
          const isCompleted = task.status === 'COMPLETED';

          return (
            <div key={task.id} className="relative pl-8 group">
              {/* Dot on the line */}
              <div
                className={cn(
                  'absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-background transition-colors',
                  isCompleted
                    ? 'border-green-500 bg-green-500'
                    : 'border-primary group-hover:bg-primary/20'
                )}
              />

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(date, 'MMM d, yyyy', { locale: dateLocale })}
                </span>

                <div
                  className={cn(
                    'p-4 rounded-lg border bg-card transition-all hover:shadow-md',
                    isCompleted && 'opacity-60 bg-muted/30'
                  )}
                >
                  <h4
                    className={cn(
                      'font-medium',
                      isCompleted && 'line-through text-muted-foreground'
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
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium border',
                        task.priority === 'URGENT'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : task.priority === 'HIGH'
                          ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
