import { type ReactNode } from "react";
import { Button } from "../ui/button.js";
import { Plus } from "lucide-react";
import { cn } from "../../utils/index.js";

interface BoardColumnProps {
  id: string;
  title: string;
  color: string;
  /** Tasks to display (already filtered for this column) */
  tasksCount?: number;
  /** Header color classes or hex (solid) */
  headerColorClass?: string;
  /** Callback to add task */
  onAddTask?: () => void;
  /** Content of the column (tasks) */
  children?: ReactNode;
  /** Labels for i18n */
  labels?: {
    addTask?: string;
  };
  className?: string;
  /** Style for container (e.g. for droppable ref) */
  style?: React.CSSProperties;
  /** Reference for droppable node - passed as callback/prop to be agnostic */
  setNodeRef?: (node: HTMLElement | null) => void;
  /** Optional Work-In-Progress (WIP) limit */
  wipLimit?: number;
}

/**
 * BoardColumn - Platform-agnostic Kanban column layout
 */
export function BoardColumn({
  id: _id,
  title,
  tasksCount = 0,
  headerColorClass,
  onAddTask,
  children,
  labels = {},
  className = '',
  style,
  setNodeRef,
  wipLimit,
}: BoardColumnProps) {
  const isWipExceeded = typeof wipLimit === 'number' && wipLimit > 0 && tasksCount > wipLimit;

  return (
    <div 
      className={cn("flex-shrink-0 w-80 flex flex-col gap-4", className)}
      style={style}
    >
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 transition-colors",
          isWipExceeded
            ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
            : headerColorClass
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          {isWipExceeded && (
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              WIP
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border border-border shadow-sm",
            isWipExceeded
              ? "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
              : "bg-white dark:bg-black"
          )}
        >
          {wipLimit ? `${tasksCount}/${wipLimit}` : tasksCount}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className="flex flex-col gap-3 min-h-[200px] flex-1"
      >
        {children}

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900"
          onClick={onAddTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          {labels.addTask ?? 'Add Task'}
        </Button>
      </div>
    </div>
  );
}
