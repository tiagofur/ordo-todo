import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Circle, CircleCheck, LogOut, Plus } from "lucide-react";
import { useAuth } from "@ordo-todo/auth-provider";
import type { Task } from "@ordo-todo/api-client";
import {
  fmtDue,
  PRIORITY_STYLE,
  useCompleteTask,
  useTodayTasks,
} from "../lib/tasks";

function TaskRow({ task }: { task: Task }) {
  const complete = useCompleteTask();
  const done = task.status === "COMPLETED";
  const due = fmtDue(task.dueDate ?? task.scheduledDate);

  return (
    <li className="flex items-center gap-3 border-b border-zinc-800/60 px-3 py-2.5 last:border-0">
      <button
        aria-label={done ? "Reabrir tarea" : "Completar tarea"}
        disabled={complete.isPending}
        onClick={() => complete.mutate({ id: task.id, completed: !done })}
        className="shrink-0"
      >
        {done ? (
          <CircleCheck className="size-5 text-emerald-400" />
        ) : (
          <Circle className="size-5 text-zinc-500" />
        )}
      </button>
      <Link
        to={`/tasks/${task.id}`}
        className="min-w-0 flex-1 active:opacity-70"
      >
        <p
          className={`truncate text-sm ${
            done ? "text-zinc-500 line-through" : "text-zinc-100"
          }`}
        >
          <span
            className={`mr-2 inline-block size-1.5 rounded-full align-middle ${
              PRIORITY_STYLE[task.priority].dot
            }`}
          />
          {task.title}
        </p>
      </Link>
      {due && <span className="shrink-0 text-[11px] text-zinc-500">{due}</span>}
    </li>
  );
}

function Section({ title, tasks }: { title: string; tasks: Task[] }) {
  if (tasks.length === 0) return null;
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900">
      <h2 className="border-b border-zinc-800 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        {title} · {tasks.length}
      </h2>
      <ul>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </ul>
    </section>
  );
}

export default function Today() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError } = useTodayTasks();

  const sections = useMemo(() => {
    if (!data) return [];
    return (
      [
        ["Vencidas", data.overdue],
        ["Vencen hoy", data.dueToday],
        ["Programadas hoy", data.scheduledToday],
        ["Disponibles", data.available],
      ] as const
    ).filter(([, tasks]) => tasks.length > 0);
  }, [data]);

  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            Hola, {user?.name || user?.username}
          </p>
          <h1 className="text-xl font-semibold">Hoy</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/tasks/new"
            aria-label="Nueva tarea"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white active:bg-emerald-700"
          >
            <Plus className="size-4" /> Nueva
          </Link>
          <button
            onClick={() => void logout()}
            aria-label="Cerrar sesión"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 active:bg-zinc-800"
          >
            <LogOut className="size-4" /> Salir
          </button>
        </div>
      </header>

      {isLoading && (
        <p className="animate-pulse text-sm text-zinc-500">Cargando tareas…</p>
      )}
      {isError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          No se pudieron cargar las tareas (sin conexión mostrando caché).
        </p>
      )}

      {!isLoading && sections.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
          {isError
            ? "Sin conexión y sin caché local — reconecta para cargar tus tareas."
            : "Sin tareas pendientes. ¡Disfruta el día! 🎉"}
        </div>
      )}

      {sections.map(([title, tasks]) => (
        <Section key={title} title={title} tasks={tasks} />
      ))}
    </div>
  );
}
