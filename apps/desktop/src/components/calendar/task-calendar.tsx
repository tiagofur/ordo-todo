"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, addHours, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useTasks } from "@/hooks/api/use-tasks";
import { useUpdateTask } from "@/hooks/api/use-tasks";
import { Task } from "@ordo-todo/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Setup the localizer for react-big-calendar
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
  const { t } = useTranslation();
  
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
            {t('calendar.today') || 'Today'}
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
          {t('common.month') || 'Month'}
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
          {t('common.week') || 'Week'}
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
          {t('common.today') || 'Day'}
        </Button>
      </div>
    </div>
  );
};

// Custom Event Component
const CustomEvent = ({ event }: { event: TaskEvent }) => {
  const task = event.resource;
  
  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

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
      {/* Show time if not month view or if it's explicitly set? BigCalendar handles this layout mostly */}
    </div>
  );
};


export function TaskCalendar() {
  const { t } = useTranslation();
  const { data: tasks, isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask(); // Desktop api hook might differ slightly from web wrapper, verify if useUpdateTask is exported or if I need useTask mutation
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        // Default logic: assume 1 hour duration for visualization
        let start = dueDate;
        let end = addHours(dueDate, 1);

        // Check for validity
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

  const dayPropGetter = (date: Date) => {
    const isToday = isSameDay(date, new Date());
    return {
        className: cn(
            "bg-background",
            isToday && "bg-accent/5"
        )
    };
  };

  if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground p-8">
            <div className="flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 animate-pulse" />
                <span>{t('common.loading') || 'Loading...'}</span>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full bg-background/50 backdrop-blur-sm calendar-wrapper text-foreground">
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
            next: t("common.next") || "Next",
            previous: t("common.previous") || "Previous",
            today: t("common.today") || "Today",
            month: t("common.month") || "Month",
            week: t("common.week") || "Week",
            day: t("common.day") || "Day",
            agenda: t("common.agenda") || "Agenda",
        }}
        onEventDrop={onEventDrop}
        resizable
        selectable
      />
    </div>
  );
}
