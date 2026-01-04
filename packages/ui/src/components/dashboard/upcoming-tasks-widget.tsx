
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/index.js';

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: Date | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  project?: {
    name: string;
    color: string;
  };
}

interface UpcomingTasksWidgetProps {
  tasks: UpcomingTask[];
  onTaskClick?: (taskId: string) => void;
  labels?: {
    title?: string;
    empty?: string;
    overdueAgo?: (days: number) => string;
    dueToday?: string;
    dueTomorrow?: string;
    inDays?: (days: number) => string;
  };
}

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

const DEFAULT_LABELS = {
  title: 'Upcoming Tasks',
  empty: 'No tasks with upcoming due dates',
  overdueAgo: (days: number) => `Overdue by ${days} day${days > 1 ? 's' : ''}`,
  dueToday: 'Due today',
  dueTomorrow: 'Due tomorrow',
  inDays: (days: number) => `In ${days} days`,
};

export function UpcomingTasksWidget({
  tasks,
  onTaskClick,
  labels = {},
}: UpcomingTasksWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  // Sort by due date (soonest first)
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  const getDaysUntilDue = (dueDate: Date | string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateLabel = (daysUntil: number) => {
    if (daysUntil < 0) return t.overdueAgo(Math.abs(daysUntil));
    if (daysUntil === 0) return t.dueToday;
    if (daysUntil === 1) return t.dueTomorrow;
    return t.inDays(daysUntil);
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">{t.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          {t.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const daysUntil = getDaysUntilDue(task.dueDate);
          const isOverdue = daysUntil < 0;
          const isDueToday = daysUntil === 0;

          return (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-all duration-200',
                'hover:bg-accent/50 hover:border-primary/20 cursor-pointer'
              )}
              onClick={() => onTaskClick?.(task.id)}
            >
              {/* Priority indicator */}
              <div
                className="h-full w-1 rounded-full shrink-0 self-stretch"
                style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>

                {task.project && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {task.project.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {(isOverdue || isDueToday) && (
                    <AlertCircle
                      className={cn(
                        'h-3 w-3',
                        isOverdue ? 'text-destructive' : 'text-amber-500'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isOverdue && 'text-destructive',
                      isDueToday && 'text-amber-500',
                      !isOverdue && !isDueToday && 'text-muted-foreground'
                    )}
                  >
                    {getDueDateLabel(daysUntil)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
