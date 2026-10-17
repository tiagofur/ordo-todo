"use client";

import { useMemo } from "react";
import { useAvailableTasks } from "@/lib/api-hooks";
import { format } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { GripVertical, AlertCircle, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, ScrollArea, Badge } from "@ordo-todo/ui";
import { DragStore } from "@/lib/drag-store";
import { useLocale, useTranslations } from "next-intl";

import { Task } from "@ordo-todo/api-client";
import { isCalendarDateOverdue } from "@ordo-todo/core";

const dateLocaleMap: Record<string, typeof es> = {
  es,
  en: enUS,
  "pt-br": ptBR,
};

const priorityColors: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

export function UnscheduledTasks() {
  const t = useTranslations("Calendar");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = dateLocaleMap[locale] || es;

  // Use available tasks (not scheduled)
  const { data: tasks, isLoading } = useAvailableTasks();
  
  // Filter only tasks that don't have a scheduled date/time yet
  const unscheduledTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task: Task) => !task.scheduledDate && !task.scheduledTime && task.status !== 'COMPLETED');
  }, [tasks]);

  const onDragStart = (e: React.DragEvent, task: Task) => {
    // Set data for react-big-calendar
    // We pass the task ID or the whole task object as JSON
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "copy";
    DragStore.setDraggedTask(task);
  };

  if (isLoading) {
    return (
      <Card className="h-full border-l-0 rounded-l-none border-y-0 text-card-foreground shadow-none bg-muted/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{tCommon('loading') || 'Loading...'}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-l border-y-0 rounded-none border-r-0 shadow-sm bg-background">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">{t("unscheduledTasks")}</CardTitle>
          <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-[20px] justify-center">
            {unscheduledTasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {unscheduledTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">{t("noUnscheduledTasks")}</p>
                <p className="text-xs opacity-70">{t("noUnscheduledTasksDescription")}</p>
              </div>
            ) : (
              unscheduledTasks.map((task: Task) => (
                <div
                  key={task.id}
                  draggable="true"
                  onDragStart={(e) => onDragStart(e, task)}
                  className="group relative flex items-start gap-2 p-2.5 rounded-md border border-border/80 bg-card hover:bg-accent/40 hover:border-border transition-all cursor-grab active:cursor-grabbing shadow-xs"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: priorityColors[task.priority] || priorityColors.LOW }}
                    aria-hidden="true"
                  />
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-muted-foreground transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                       {(task as any).project && (
                          <div className="flex items-center gap-1">
                            <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: (task as any).project.color || '#666' }}
                            />
                            <span className="truncate max-w-[80px]">{(task as any).project.name}</span>
                          </div>
                       )}
                       {task.estimatedMinutes && (
                         <span>• {task.estimatedMinutes}m</span>
                       )}
                       {task.dueDate && (
                         <span className={isCalendarDateOverdue(task.dueDate) ? "text-destructive" : ""}>
                           • {format(new Date(task.dueDate), "d MMM", { locale: dateLocale })}
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
