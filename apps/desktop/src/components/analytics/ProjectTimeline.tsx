import { useMemo } from "react";
import { cn, Button } from "@ordo-todo/ui";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineTask {
  id: string;
  title: string;
  startDate: Date | string;
  dueDate: Date | string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  progress?: number; // 0-100
}

interface ProjectTimelineProps {
  tasks: TimelineTask[];
  startDate?: Date;
  endDate?: Date;
  onTaskClick?: (task: TimelineTask) => void;
  className?: string;
}

const STATUS_COLORS = {
  TODO: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#f59e0b",
  COMPLETED: "#22c55e",
};

const PRIORITY_BORDERS = {
  LOW: "border-l-emerald-500",
  MEDIUM: "border-l-amber-500",
  HIGH: "border-l-orange-500",
  URGENT: "border-l-red-500",
};

function getDaysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function ProjectTimeline({
  tasks,
  startDate: propStartDate,
  endDate: propEndDate,
  onTaskClick,
  className,
}: ProjectTimelineProps) {
  // Calculate timeline range
  const { timelineStart, timelineEnd, totalDays, weeks } = useMemo(() => {
    const taskDates = tasks.flatMap((t) => [
      new Date(t.startDate),
      new Date(t.dueDate),
    ]);

    const minDate = propStartDate
      ? new Date(propStartDate)
      : taskDates.length > 0
      ? new Date(Math.min(...taskDates.map((d) => d.getTime())))
      : new Date();

    const maxDate = propEndDate
      ? new Date(propEndDate)
      : taskDates.length > 0
      ? new Date(Math.max(...taskDates.map((d) => d.getTime())))
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Extend to full weeks
    const start = new Date(minDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const end = new Date(maxDate);
    end.setDate(end.getDate() + (7 - end.getDay())); // Sunday

    const days = getDaysBetween(start, end);
    const numWeeks = Math.ceil(days / 7);

    const weeksArray = Array.from({ length: numWeeks }, (_, i) => {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + i * 7);
      return weekStart;
    });

    return {
      timelineStart: start,
      timelineEnd: end,
      totalDays: days,
      weeks: weeksArray,
    };
  }, [tasks, propStartDate, propEndDate]);

  // Calculate task positions
  const taskBars = useMemo(() => {
    return tasks.map((task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.dueDate);

      const startOffset = getDaysBetween(timelineStart, taskStart);
      const duration = getDaysBetween(taskStart, taskEnd) + 1;

      const leftPercent = (startOffset / totalDays) * 100;
      const widthPercent = (duration / totalDays) * 100;

      return {
        ...task,
        leftPercent: Math.max(0, leftPercent),
        widthPercent: Math.min(100 - leftPercent, widthPercent),
      };
    });
  }, [tasks, timelineStart, totalDays]);

  // Today marker position
  const todayPercent = useMemo(() => {
    const today = new Date();
    if (today < timelineStart || today > timelineEnd) return null;
    return (getDaysBetween(timelineStart, today) / totalDays) * 100;
  }, [timelineStart, timelineEnd, totalDays]);

  if (tasks.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Timeline del Proyecto</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-4 opacity-50" />
          <p>No hay tareas con fechas para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Timeline del Proyecto</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(timelineStart)} - {formatDate(timelineEnd)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">Hoy</Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative overflow-x-auto">
        {/* Week headers */}
        <div className="flex border-b border-border/50 pb-2 mb-4">
          {weeks.map((weekStart, i) => (
            <div
              key={i}
              className="flex-1 min-w-[100px] text-center text-xs text-muted-foreground"
            >
              <div className="font-medium">Semana {i + 1}</div>
              <div>{formatDate(weekStart)}</div>
            </div>
          ))}
        </div>

        {/* Task bars */}
        <div className="relative min-h-[200px]">
          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {weeks.map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-border/30 last:border-r-0"
              />
            ))}
          </div>

          {/* Today marker */}
          {todayPercent !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${todayPercent}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                Hoy
              </div>
            </div>
          )}

          {/* Task bars */}
          <div className="relative space-y-2 py-2">
            {taskBars.map((task, index) => (
              <div
                key={task.id}
                className="relative h-10"
                style={{ marginLeft: `${task.leftPercent}%` }}
              >
                <div
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    "absolute h-full rounded-lg cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02] hover:z-10",
                    "border-l-4",
                    PRIORITY_BORDERS[task.priority]
                  )}
                  style={{
                    width: `${task.widthPercent}%`,
                    minWidth: "80px",
                    backgroundColor: `${STATUS_COLORS[task.status]}20`,
                  }}
                >
                  {/* Progress bar */}
                  {task.progress !== undefined && task.progress > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-l-lg opacity-30"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: STATUS_COLORS[task.status],
                      }}
                    />
                  )}

                  {/* Task content */}
                  <div className="relative h-full flex items-center px-3 gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[task.status] }}
                    />
                    <span className="text-sm font-medium truncate">
                      {task.title}
                    </span>
                    {task.status === "COMPLETED" && (
                      <span className="text-xs text-emerald-600">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground">
              {status === "TODO" && "Por Hacer"}
              {status === "IN_PROGRESS" && "En Progreso"}
              {status === "IN_REVIEW" && "En Revisión"}
              {status === "COMPLETED" && "Completado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
