import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  PRIORITY_STYLE,
  useCompleteTask,
  useDeleteTask,
  useTask,
  useUpdateTask,
} from "../lib/tasks";
import type { TaskPriority } from "@ordo-todo/api-client";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TaskDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading } = useTask(id);
  const update = useUpdateTask(id);
  const complete = useCompleteTask();
  const remove = useDeleteTask(id, () => navigate("/today", { replace: true }));

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="animate-pulse p-6 text-sm text-zinc-500">Cargando…</p>;
  }
  if (!task) {
    return (
      <div className="p-6 text-sm text-zinc-400">
        <p>Tarea no encontrada o sin conexión.</p>
        <Link to="/today" className="mt-3 inline-block text-emerald-400 underline">
          Volver a Hoy
        </Link>
      </div>
    );
  }

  const done = task.status === "COMPLETED";
  const tTitle = title ?? task.title;
  const tNotes = notes ?? task.description ?? "";
  const tPriority = priority ?? task.priority;

  const save = () => {
    setError(null);
    update.mutate(
      { title: tTitle, description: tNotes, priority: tPriority },
      { onError: () => setError("No se pudo guardar") },
    );
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-600";

  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-5">
      <header className="flex items-center justify-between">
        <Link
          to="/today"
          className="flex items-center gap-1.5 text-xs text-zinc-400 active:text-zinc-200"
        >
          <ArrowLeft className="size-4" /> Hoy
        </Link>
        <button
          onClick={() => {
            remove.mutate(undefined, {
              onError: () => setError("No se pudo eliminar"),
            });
          }}
          disabled={remove.isPending}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-400 active:bg-red-500/10"
        >
          <Trash2 className="size-4" /> Eliminar
        </button>
      </header>

      <div className="flex items-start gap-3">
        <button
          aria-label={done ? "Reabrir" : "Completar"}
          disabled={complete.isPending}
          onClick={() => complete.mutate({ id: task.id, completed: !done })}
          className="mt-1 shrink-0"
        >
          {done ? (
            <span className="text-emerald-400">✓ Completada</span>
          ) : (
            <span className="text-zinc-400 underline">Marcar hecha</span>
          )}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <input
            className={inputClass}
            value={tTitle}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="Notas"
            value={tNotes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`rounded-lg border px-1 py-2 text-[11px] ${
                  tPriority === p
                    ? "border-emerald-600 bg-emerald-600/10 text-emerald-400"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400"
                }`}
              >
                {PRIORITY_STYLE[p].label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={update.isPending}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(null);
                setNotes(null);
                setPriority(null);
              }}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-sm text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h1
            className={`text-lg font-semibold ${
              done ? "text-zinc-500 line-through" : ""
            }`}
          >
            {task.title}
          </h1>
          <div className="flex items-center gap-2 text-[11px]">
            <span
              className={`rounded-full border px-2 py-0.5 ${
                done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400"
              }`}
            >
              {done ? "Completada" : task.status}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 ${
                "border-zinc-700 bg-zinc-900 text-zinc-400"
              }`}
            >
              {PRIORITY_STYLE[task.priority].label}
            </span>
          </div>
          {task.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {task.description}
            </p>
          )}
          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-sm text-zinc-200 active:bg-zinc-800"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
