
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet.js';
import { Checkbox } from '../ui/checkbox.js';
import { Separator } from '../ui/separator.js';
import { Calendar, Flag, Clock } from 'lucide-react';
import { format } from 'date-fns';

export interface TaskDetailViewData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | Date | null;
  subTasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface TaskDetailViewProps {
  /** Task data to display */
  task?: TaskDetailViewData | null;
  /** Whether sheet is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Called when task completion is toggled */
  onComplete?: (taskId: string) => void;
  /** Date locale for formatting */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    description?: string;
    noDate?: string;
    subtasksTitle?: string;
    subtasksEmpty?: string;
    timeTitle?: string;
    timeComingSoon?: string;
    notFound?: string;
  };
}

type Locale = Parameters<typeof format>[2] extends { locale?: infer L } ? L : never;

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-red-500',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-blue-500',
  LOW: 'text-gray-500',
};

/**
 * TaskDetailView - Platform-agnostic task detail sheet
 * 
 * Data fetching handled externally.
 * 
 * @example
 * const { data: task, isLoading } = useTask(taskId);
 * const completeTask = useCompleteTask();
 * 
 * <TaskDetailView
 *   task={task}
 *   open={!!taskId}
 *   onOpenChange={(open) => !open && setTaskId(null)}
 *   isLoading={isLoading}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   labels={{ title: t('title') }}
 * />
 */
export function TaskDetailView({
  task,
  open,
  onOpenChange,
  isLoading = false,
  onComplete,
  dateLocale,
  labels = {},
}: TaskDetailViewProps) {
  const {
    title = 'Task Details',
    description = 'View and manage task information',
    noDate = 'No due date',
    subtasksTitle = 'Subtasks',
    subtasksEmpty = 'No subtasks yet',
    timeTitle = 'Time Tracking',
    timeComingSoon = 'Time tracking data will appear here',
    notFound = 'Task not found',
  } = labels;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : task ? (
          <div className="space-y-6 py-6">
            {/* Header / Title */}
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.status === 'COMPLETED'}
                onCheckedChange={() => onComplete?.(task.id)}
                className="mt-1"
              />
              <div className="space-y-1">
                <h2
                  className={`text-xl font-semibold ${
                    task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flag className={`h-4 w-4 ${PRIORITY_COLORS[task.priority] || 'text-gray-500'}`} />
                <span>{task.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {task.dueDate
                    ? format(
                        new Date(task.dueDate),
                        'PPP',
                        dateLocale ? { locale: dateLocale } : undefined
                      )
                    : noDate}
                </span>
              </div>
            </div>

            <Separator />

            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{subtasksTitle}</h3>
              </div>

              {task.subTasks && task.subTasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subTasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                    >
                      <Checkbox checked={subtask.status === 'COMPLETED'} disabled />
                      <span
                        className={
                          subtask.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                        }
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{subtasksEmpty}</p>
              )}
            </div>

            {/* Time Tracking (Placeholder) */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">{timeTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{timeComingSoon}</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">{notFound}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
