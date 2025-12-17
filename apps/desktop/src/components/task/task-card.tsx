import { useState } from "react";
import { CheckSquare, MoreVertical, Trash2, Flag, Calendar, Edit, ListTodo, CalendarClock, CalendarCheck, Share2 } from "lucide-react";
import { useUpdateTask, useTask } from "@/hooks/api/use-tasks";
import {
  cn,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import { ShareTaskDialog } from "@/components/sharing";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { TaskDetailPanel } from "./task-detail-panel";
import { useTranslation } from "react-i18next";

interface TaskCardProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    startDate?: Date | string | null;
    scheduledDate?: Date | string | null;
    scheduledTime?: string | null;
    isTimeBlocked?: boolean;
    tags?: any[];
    project?: { id: string; name: string; color: string };
    subTasks?: Array<{
      id: string | number;
      title: string;
      status: string;
    }>;
  };
  isSelected?: boolean;
  onOpenDetail?: () => void;
  index?: number;
}

export function TaskCard({ task: initialTask, isSelected, onOpenDetail, index = 0 }: TaskCardProps) {
  const { t } = (useTranslation as any)();
  const [showDetail, setShowDetail] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Fetch full task details to ensure we have tags and subtasks
  const { data: fullTask } = useTask(String(initialTask.id));
  const task = (fullTask || initialTask) as any;

  const isCompleted = task.status === "COMPLETED";

  const priorityConfig = {
    LOW: { label: t('TaskCard.priority.LOW'), color: "text-gray-500" },
    MEDIUM: { label: t('TaskCard.priority.MEDIUM'), color: "text-blue-500" },
    HIGH: { label: t('TaskCard.priority.HIGH'), color: "text-orange-500" },
    URGENT: { label: t('TaskCard.priority.URGENT'), color: "text-red-500" },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
  
  // Use project color if available, otherwise fallback to purple
  const accentColor = task.project?.color || "#8b5cf6"; // Purple fallback

  // Subtask progress calculation
  const subtasks = task.subTasks || [];
  const completedSubtasks = subtasks.filter((st: any) => st.status === "COMPLETED").length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };
  
  const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  // Handle completion toggle
  const updateTaskMutation = useUpdateTask();

  const handleOpenDetailFn = () => {
     if (onOpenDetail) {
         onOpenDetail();
     } else {
         setShowDetail(true);
     }
  };

  const handleDelete = () => {
    // Implement delete logic or emit event
    // For now we just console log as the desktop version handles this usually via parent or context
    console.log("Delete not implemented in card directly for desktop yet, requires context");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={handleOpenDetailFn}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
          "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
          isCompleted && "opacity-60 grayscale",
          isSelected && "ring-2 ring-primary"
        )}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: accentColor,
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <CheckSquare className="h-7 w-7" />
              </div>
              <h3 className={cn("font-bold text-xl leading-tight truncate max-w-[200px]", isCompleted && "line-through")}>
                {task.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleOpenDetailFn();}}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('TaskCard.actions.viewEdit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShareDialogOpen(true); }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add delete handler */ }} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('TaskCard.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
              {task.description}
            </p>
          )}

          {/* Subtasks Progress Bar & Stats */}
          <div className="mt-auto space-y-3">
             {totalSubtasks > 0 && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-dashed border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                    <div className={cn("flex items-center gap-1.5", priority.color)}>
                      <Flag className="h-3.5 w-3.5" />
                      <span>{priority.label}</span>
                    </div>
                    {/* Scheduled Date Badge */}
                    {task.scheduledDate && (
                      <div className="flex items-center gap-1.5 text-blue-500">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <span>
                          {formatDueDate(task.scheduledDate)}
                          {task.scheduledTime && ` ${task.scheduledTime}`}
                        </span>
                      </div>
                    )}
                    {/* Due Date Badge */}
                    {task.dueDate && (
                      <div className={cn("flex items-center gap-1.5", isOverdue ? "text-red-500" : "text-orange-500")}>
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDueDate(task.dueDate)}</span>
                      </div>
                    )}
                    {/* Start Date Badge - only show if not yet available */}
                    {task.startDate && new Date(task.startDate) > new Date() && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>{formatDueDate(task.startDate)}</span>
                      </div>
                    )}
                  </div>
                  {isCompleted && (
                     <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                        {t('tasks.statuses.completed')}
                     </div>
                  )}
                </div>
              </div>
          </div>
        </div>

        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      </motion.div>

      {!onOpenDetail && (
        <TaskDetailPanel
          taskId={task.id ? String(task.id) : null}
          open={showDetail}
          onOpenChange={setShowDetail}
        />
      )}

      <ShareTaskDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        taskId={task.id ? String(task.id) : ""}
        taskTitle={task.title}
      />
    </>
  );
}
