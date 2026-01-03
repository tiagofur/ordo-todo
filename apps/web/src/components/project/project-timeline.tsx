"use client";

import { useTasks } from "@/lib/api-hooks";
import { ProjectTimeline as UIProjectTimeline } from "@ordo-todo/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import type { Task } from "@ordo-todo/api-client";

interface ProjectTimelineProps {
  projectId: string;
}

/**
 * ProjectTimeline Container - Handles business logic and data processing for the timeline.
 * Uses UIProjectTimeline from @ordo-todo/ui for presentation.
 */
export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const t = useTranslations("ProjectTimeline");
  const tCard = useTranslations("TaskCard");
  const { data: tasks, isLoading } = useTasks(projectId);

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case "URGENT": return { label: tCard("priority.URGENT"), color: "text-red-500 border-red-200" };
      case "HIGH": return { label: tCard("priority.HIGH"), color: "text-orange-500 border-orange-200" };
      case "MEDIUM": return { label: tCard("priority.MEDIUM"), color: "text-blue-500 border-blue-200" };
      case "LOW": return { label: tCard("priority.LOW"), color: "text-slate-500 border-slate-200" };
      default: return { label: priority, color: "text-muted-foreground border-border" };
    }
  };

  const timelineTasks = tasks
    ?.filter((t: Task) => t.dueDate)
    .sort((a: Task, b: Task) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .map((task: Task) => {
      const priorityInfo = getPriorityInfo(task.priority);
      return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        isCompleted: task.status === "COMPLETED",
        priorityLabel: priorityInfo.label,
        priorityColorClass: priorityInfo.color,
        formattedDate: format(new Date(task.dueDate!), "MMM d, yyyy", { locale: es }),
      };
    }) || [];

  return (
    <UIProjectTimeline
      tasks={timelineTasks}
      isLoading={isLoading}
      labels={{
        emptyTitle: t("emptyTitle"),
        emptyDescription: t("emptyDescription"),
      }}
    />
  );
}
