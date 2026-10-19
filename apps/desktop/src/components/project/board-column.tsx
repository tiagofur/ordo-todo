import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTask } from "./sortable-task";
import { Button, cn } from "@ordo-todo/ui";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BoardColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: any[];
  onAddTask: () => void;
  wipLimit?: number;
}

export function BoardColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  wipLimit,
}: BoardColumnProps) {
  const { t } = (useTranslation as any)();
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const isWipExceeded =
    typeof wipLimit === "number" && wipLimit > 0 && tasks.length > wipLimit;

  return (
    <div className="flex-shrink-0 w-80 flex flex-col gap-4">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          isWipExceeded
            ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
            : color
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
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
              : "bg-background/80"
          )}
        >
          {wipLimit ? `${tasks.length}/${wipLimit}` : tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[200px] flex-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, index) => (
            <SortableTask key={task.id} task={task} index={index} />
          ))}
        </SortableContext>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
          onClick={onAddTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("ProjectBoard.addTask", "Añadir tarea")}
        </Button>
      </div>
    </div>
  );
}
