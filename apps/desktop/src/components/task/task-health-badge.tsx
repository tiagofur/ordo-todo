import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateTaskHealth,
  getHealthColor,
  getHealthIcon,
  getHealthLabel,
  type TaskHealth,
} from "@/utils/task-health";

interface TaskHealthBadgeProps {
  task: {
    dueDate?: Date | string | null;
    assigneeId?: string | null;
    estimatedMinutes?: number | null;
    description?: string | null;
    status: string;
    commentsCount?: number;
    updatedAt?: Date | string | null;
    subtasksCount?: number;
    completedSubtasksCount?: number;
  };
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TaskHealthBadge({
  task,
  showLabel = false,
  showTooltip = true,
  size = "md",
  className,
}: TaskHealthBadgeProps) {
  const health = calculateTaskHealth({
    ...task,
    lastActivityAt: task.updatedAt,
  });

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "border border-border/50",
        "transition-colors",
        sizeClasses[size],
        className
      )}
    >
      <span className="leading-none">{getHealthIcon(health.status)}</span>
      {showLabel && (
        <span className={cn("font-medium", getHealthColor(health.status))}>
          {getHealthLabel(health.status)}
        </span>
      )}
      {!showLabel && (
        <span className="text-xs text-muted-foreground">{health.score}</span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <TaskHealthTooltipContent health={health} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TaskHealthTooltipContent({ health }: { health: TaskHealth }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">Task Health</span>
        <span className={cn("font-bold", getHealthColor(health.status))}>
          {health.score}/100
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Factors:</p>
        {health.factors.map((factor, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5">
              {factor.isMet ? "✅" : "❌"}
            </span>
            <div className="flex-1">
              <span className="font-medium">{factor.name}:</span>{" "}
              <span className="text-muted-foreground">
                {factor.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {health.recommendation && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs">
            <span className="font-medium">💡 </span>
            {health.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
