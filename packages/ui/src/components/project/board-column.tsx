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
}: BoardColumnProps) {
  return (
    <div 
      className={cn("flex-shrink-0 w-80 flex flex-col gap-4", className)}
      style={style}
    >
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900",
          headerColorClass
        )}
      >
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="text-xs font-medium bg-white dark:bg-black px-2 py-0.5 rounded-full border border-border shadow-sm">
          {tasksCount}
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
