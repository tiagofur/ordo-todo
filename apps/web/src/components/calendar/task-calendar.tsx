"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Task } from "@ordo-todo/api-client";
import { useRouter } from "next/navigation";

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

const DnDCalendar = withDragAndDrop(Calendar);

interface TaskEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Task;
}

export function TaskCalendar() {
  const t = useTranslations("Calendar");
  const router = useRouter();
  const { data: tasks, isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        // Assuming tasks take 1 hour by default if no duration specified, 
        // or we can use estimatedMinutes if available.
        // For now, let's just make them 1 hour long or all day if needed.
        // If we have start date, use it. Otherwise assume due date is end date.
        
        let start = dueDate;
        let end = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour default

        if (task.startDate) {
            start = new Date(task.startDate);
            end = dueDate;
        }

        return {
          id: task.id,
          title: task.title,
          start,
          end,
          allDay: !task.startDate, // If only due date, maybe treat as all day or specific time? 
                                   // Let's stick to specific time if it has time component, 
                                   // but usually due dates in this app might be just dates.
                                   // For now, let's default to allDay if no start date.
          resource: task,
        };
      });
  }, [tasks]);

  const onEventDrop = async ({ event, start, end, isAllDay }: any) => {
    const task = event.resource as Task;
    if (!task) return;

    // Update task due date
    // If it was all day, maybe we just update the date part.
    // If it has time, we update time.
    
    try {
        await updateTaskMutation.mutateAsync({
            taskId: task.id,
            data: {
                dueDate: end, // Use end as due date? Or start? usually due date is the deadline.
                              // If I drag to a day, 'start' is that day.
                              // Let's assume start is the new due date for simplicity if it's all day.
                startDate: isAllDay ? undefined : start,
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
      // Or maybe open a dialog if we have a global dialog state.
  };

  if (isLoading) {
      return <div className="p-8 text-center">Loading calendar...</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] p-4">
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
