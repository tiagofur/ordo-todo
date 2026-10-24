import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import type {
  CreateTaskDto,
  TaskPriority,
  UpdateTaskDto,
} from "@ordo-todo/api-client";

export const TASKS_TODAY_KEY = ["tasks", "today"] as const;
export const taskKey = (id: string) => ["tasks", "detail", id] as const;

/** Workspace + proyecto por defecto para crear tareas (primero disponible). */
export function useDefaultProject() {
  return useQuery({
    queryKey: ["projects", "default"],
    queryFn: async () => {
      const workspaces = await apiClient.getWorkspaces();
      for (const ws of workspaces) {
        const projects = await apiClient.getProjects(ws.id);
        if (projects.length > 0) {
          return { workspace: ws, project: projects[0]! };
        }
      }
      return null;
    },
    staleTime: 5 * 60_000,
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: TASKS_TODAY_KEY,
    queryFn: () => apiClient.getTasksToday(),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKey(id),
    queryFn: () => apiClient.getTask(id),
    enabled: id.length > 0,
  });
}

function useInvalidateTasks() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: TASKS_TODAY_KEY });
    void qc.invalidateQueries({ queryKey: ["tasks", "detail"] });
  };
}

export function useCreateTask(onDone: () => void) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => apiClient.createTask(dto),
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });
}

export function useUpdateTask(id: string, onDone?: () => void) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (dto: UpdateTaskDto) => apiClient.updateTask(id, dto),
    onSuccess: () => {
      invalidate();
      onDone?.();
    },
  });
}

export function useCompleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completed
        ? apiClient.completeTask(id)
        : apiClient.updateTask(id, { status: "TODO" }),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(id: string, onDone: () => void) {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: () => apiClient.deleteTask(id),
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });
}

export const PRIORITY_STYLE: Record<
  TaskPriority,
  { dot: string; label: string }
> = {
  URGENT: { dot: "bg-red-500", label: "Urgente" },
  HIGH: { dot: "bg-orange-400", label: "Alta" },
  MEDIUM: { dot: "bg-sky-400", label: "Media" },
  LOW: { dot: "bg-zinc-500", label: "Baja" },
};

export function fmtDue(iso: Date | string | null): string | null {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}
