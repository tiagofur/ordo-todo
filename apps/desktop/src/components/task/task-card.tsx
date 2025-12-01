import { useState } from "react";
import { CheckCircle2, Circle, Flag, Calendar, MoreVertical, Trash2 } from "lucide-react";
import { api } from "@/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TagSelector } from "@/components/tag/tag-selector";
import { TaskDetailPanel } from "./task-detail-panel";

interface TaskCardProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
  };
}

const priorityConfig = {
  LOW: { label: "Baja", color: "text-gray-500", bg: "bg-gray-100" },
  MEDIUM: { label: "Media", color: "text-blue-500", bg: "bg-blue-100" },
  HIGH: { label: "Alta", color: "text-orange-500", bg: "bg-orange-100" },
  URGENT: { label: "Urgente", color: "text-red-500", bg: "bg-red-100" },
};

export function TaskCard({ task }: TaskCardProps) {
  const utils = api.useUtils();
  const [showDetail, setShowDetail] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

  // Fetch tags for this task
  const { data: taskTags } = api.tag.listByTask.useQuery(
    { taskId: String(task.id) },
    { enabled: !!task.id }
  );

  const completeTask = api.task.complete.useMutation({
    onSuccess: () => {
      toast.success("Tarea completada");
      utils.task.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al completar tarea");
    },
  });

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.id) return;
    completeTask.mutate({ id: String(task.id) });
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };

  const isOverdue = (date: Date | string | null | undefined) => {
    if (!date || isCompleted) return false;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj < new Date();
  };

  return (
    <>
      <div 
        onClick={() => setShowDetail(true)}
        className={`group rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer ${
          isCompleted ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
            disabled={completeTask.isPending}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium ${isCompleted ? "line-through" : ""}`}>
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-1 hover:bg-accent"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                  }}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={(e) => {
                    e.stopPropagation();
                    // Add delete handler here
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs">
              {/* Priority */}
              <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${priority.bg}`}>
                <Flag className={`h-3 w-3 ${priority.color}`} />
                <span className={priority.color}>{priority.label}</span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue(task.dueDate) ? "text-red-500" : "text-muted-foreground"
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.id && (
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                <TagSelector
                  taskId={String(task.id)}
                  selectedTags={taskTags || []}
                  onTagsChange={() => utils.tag.listByTask.invalidate()}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDetailPanel 
        taskId={task.id ? String(task.id) : null} 
        open={showDetail} 
        onOpenChange={setShowDetail} 
      />
    </>
  );
}
