"use client";


import { STATUS_COLORS, ProjectTimeChart as ProjectTimeChartUI, TaskStatusChart as TaskStatusChartUI } from "@ordo-todo/ui";
interface ProjectTimeChartProps {
  data: { name: string; value: number }[];
  className?: string;
  title?: string;
  noDataMessage?: string;
}

/**
 * ProjectTimeChart - Re-export with STATUS_COLORS integration
 */
export function ProjectTimeChart({ 
  data, 
  className,
  title = "Tiempo por Proyecto",
  noDataMessage = "No hay datos suficientes"
}: ProjectTimeChartProps) {
  return (
    <ProjectTimeChartUI 
      data={data} 
      title={title} 
      noDataMessage={noDataMessage}
      className={className}
    />
  );
}

interface TaskStatusChartProps {
  data: { status: string; count: number }[];
  className?: string;
  title?: string;
  noDataMessage?: string;
}

/**
 * TaskStatusChart - Re-export with STATUS_COLORS from @ordo-todo/ui
 */
export function TaskStatusChart({ 
  data, 
  className,
  title = "Estado de Tareas",
  noDataMessage = "No hay tareas"
}: TaskStatusChartProps) {
  // Create status colors mapping from the UI package
  const statusColors: Record<string, string> = {};
  Object.entries(STATUS_COLORS).forEach(([key, value]) => {
    statusColors[key] = value.hex;
  });

  return (
    <TaskStatusChartUI 
      data={data} 
      title={title} 
      noDataMessage={noDataMessage}
      statusColors={statusColors}
      className={className}
    />
  );
}
