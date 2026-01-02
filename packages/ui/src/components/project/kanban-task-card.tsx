import {
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Calendar,
} from "lucide-react";
import { cn } from "../../utils/index.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { type ReactNode } from "react";

export interface KanbanTaskData {
  id?: string | number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  tags?: Array<{ id: string | number; name: string; color: string }>;
  project?: { id: string; name: string; color: string };
}

interface KanbanTaskCardProps {
  task: KanbanTaskData;
  index?: number;
  /** Callback when task card is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Callback when edit is clicked */
  onEditClick?: (taskId: string) => void;
  /** Callback when delete is clicked */
  onDeleteClick?: (taskId: string) => void;
  /** Optional detail panel/modal to render when requested */
  children?: ReactNode;
  /** Formatted due date string */
  formattedDueDate?: string | null;
  /** Whether the task is overdue */
  isOverdue?: boolean;
  /** Labels for i18n */
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
    moreOptions?: string;
  };
  /** Pre-calculated priority info */
  priorityInfo?: {
    label: string;
    colorClass: string;
    bgSolid: string;
  };
  className?: string;
  /** Style object for container (e.g. for drag and drop) */
  style?: React.CSSProperties;
}

export function KanbanTaskCard({
  task,
  onTaskClick,
  onEditClick,
  onDeleteClick,
  children,
  formattedDueDate,
  isOverdue = false,
  priorityInfo,
  labels = {},
  className = '',
  style,
}: KanbanTaskCardProps) {
  const isCompleted = task.status === "COMPLETED";

  const priority = priorityInfo || {
    label: labels.priorityMedium ?? "Medium",
    colorClass: "text-blue-500",
    bgSolid: "#eff6ff", // blue-50
  };

  const accentColor = task.project?.color || "#8b5cf6";
  const moreOptionsLabel = labels.moreOptions || "More options";

  const handleCardClick = () => {
    if (onTaskClick && task.id) onTaskClick(String(task.id));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick && task.id) onEditClick(String(task.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick && task.id) onDeleteClick(String(task.id));
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all cursor-pointer",
        "hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900",
        isCompleted && "opacity-60 grayscale",
        className
      )}
      style={{
        ...style,
        borderLeftWidth: "3px",
        borderLeftColor: accentColor,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          className={cn(
            "font-medium text-sm leading-tight line-clamp-2 text-foreground",
            isCompleted && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button 
              className="transition-opacity p-1 hover:bg-muted rounded-md -mr-1 -mt-1 text-muted-foreground"
              aria-label={moreOptionsLabel}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-3.5 w-3.5" />
              {labels.viewEdit ?? "View/Edit"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive focus:bg-destructive-foreground"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {labels.delete ?? "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <div
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: "#f3f4f6", // Solid neutral background
                color: tag.color,
              }}
            >
              {tag.name}
            </div>
          ))}
          {task.tags.length > 3 && (
            <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{task.tags.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium",
            priority.colorClass
          )}
          style={{ backgroundColor: priority.bgSolid }}
        >
          <Flag className="h-3 w-3" />
          {priority.label}
        </div>

        {formattedDueDate && (
          <div
            className={cn(
              "flex items-center gap-1 text-[10px]",
              isOverdue
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            <Calendar className="h-3 w-3" />
            {formattedDueDate}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
}
