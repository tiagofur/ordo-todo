"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, addHours, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Task } from "@ordo-todo/api-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

// Setup localizer
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TaskEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: Task;
}

const DnDCalendar = withDragAndDrop<TaskEvent>(Calendar);

// Custom Toolbar Component
const CustomToolbar = (toolbar: any) => {
  const t = useTranslations("Calendar");
  const tCommon = useTranslations("common"); // Check if common namespace is available or use keys directly
  
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = toolbar.date;
    return (
      <span className="capitalize text-lg font-semibold">
        {format(date, 'MMMM yyyy', { locale: es })}
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between py-4 px-2 mb-2">
      <div className="flex items-center gap-4">
        {label()}
        <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
          <Button variant="ghost" size="icon" onClick={goToBack} className="h-7 w-7 rounded-sm hover:bg-background hover:shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrent} className="h-7 px-3 text-xs font-medium rounded-sm hover:bg-background hover:shadow-sm">
            {t('today')}
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNext} className="h-7 w-7 rounded-sm hover:bg-background hover:shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toolbar.onView('month')}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-sm transition-all",
            toolbar.view === 'month' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('month')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toolbar.onView('week')}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-sm transition-all",
            toolbar.view === 'week' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('week')}
        </Button>
         <Button
          variant="ghost"
          size="sm"
          onClick={() => toolbar.onView('day')}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-sm transition-all",
            toolbar.view === 'day' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('day')}
        </Button>
      </div>
    </div>
  );
};

// Custom Event Component
const CustomEvent = ({ event }: { event: TaskEvent }) => {
  const task = event.resource;
  
  return (
    <div className={cn(
       "h-full w-full px-2 py-1 rounded-md border-l-4 overflow-hidden text-xs transition-all hover:brightness-95",
       task.status === 'COMPLETED' ? "bg-muted text-muted-foreground line-through opacity-70" : "bg-primary/10 text-primary-foreground border-primary/50"
    )}
    style={{
        backgroundColor: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
        borderLeftColor: task.priority === 'URGENT' ? '#ef4444' : 
                         task.priority === 'HIGH' ? '#f97316' : 
                         task.priority === 'MEDIUM' ? '#eab308' : '#3b82f6',
        border: '1px solid hsl(var(--border))',
        borderLeftWidth: '4px'
    }}
    >
      <div className="font-medium truncate">{event.title}</div>
    </div>
  );
};

export function TaskCalendar() {
  const t = useTranslations("Calendar");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: tasks, isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task: Task) => task.dueDate)
      .map((task: Task) => {
        const dueDate = new Date(task.dueDate!);
        
        let start = dueDate;
        let end = addHours(dueDate, 1);
        
        // Validation
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        if (end < start) end = addHours(start, 1);

        return {
          id: task.id,
          title: task.title,
          start,
          end,
          resource: task,
        };
      })
      .filter(Boolean) as TaskEvent[];
  }, [tasks]);

  const onEventDrop = async ({ event, start, end }: any) => {
    const task = event.resource as Task;
    if (!task) return;
    
    try {
        await updateTaskMutation.mutateAsync({
            taskId: task.id,
            data: {
                dueDate: start.toISOString(),
            }
        });
    } catch (error) {
        console.error("Failed to update task date", error);
    }
  };

  const handleSelectEvent = (event: TaskEvent) => {
      // Navigate to task details or open modal
      // For now, let's just log or maybe navigate if we had a route
      // router.push(`/tasks/${event.id}`);
  };

  if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground p-8">
            <div className="flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 animate-pulse" />
                <span>{tCommon('loading') || 'Loading...'}</span>
            </div>
        </div>
      );
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-background/50 backdrop-blur-sm calendar-wrapper text-foreground p-4">
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 12px 4px; font-weight: 500; font-size: 0.875rem; text-transform: uppercase; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)) !important; }
        .rbc-month-view { border: none !important; }
        .rbc-day-bg { border-left: 1px solid hsl(var(--border)) !important; }
        .rbc-off-range-bg { background-color: hsl(var(--muted) / 0.3) !important; }
        .rbc-today { background-color: hsl(var(--accent) / 0.05) !important; }
        .rbc-event { background: transparent !important; padding: 1px !important; }
        .rbc-row-segment { padding: 2px 4px !important; }
        .rbc-date-cell { padding: 8px !important; font-size: 0.875rem; font-weight: 500; }
        .rbc-off-range .rbc-button-link { color: hsl(var(--muted-foreground)) !important; opacity: 0.5; }
        .rbc-now .rbc-button-link { color: hsl(var(--primary)) !important; background: hsl(var(--primary) / 0.1); width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-left: auto; }
        .rbc-header + .rbc-header { border-left: 1px solid hsl(var(--border)) !important; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)) !important; }
      `}</style>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        culture="es"
        components={{
            toolbar: CustomToolbar,
            event: CustomEvent
        }}
        messages={{
            next: t("next"),
            previous: t("previous"),
            today: t("today"),
            month: t("month"),
            week: t("week"),
            day: t("day"),
            agenda: t("agenda"),
        }}
        onEventDrop={onEventDrop}
        onSelectEvent={handleSelectEvent}
        resizable
        selectable
      />
    </div>
  );
}
