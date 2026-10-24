import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { TaskPriority } from "@ordo-todo/api-client";
import { useCreateTask, useDefaultProject } from "../lib/tasks";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function NewTask() {
  const navigate = useNavigate();
  const { data: projectInfo, isLoading: loadingProject } = useDefaultProject();
  const create = useCreateTask(() => navigate("/today", { replace: true }));

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-600";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectInfo?.project) {
      setError(
        "No tienes ningún proyecto. Crea uno desde la web e inténtalo de nuevo.",
      );
      return;
    }
    setError(null);
    create.mutate(
      {
        title: title.trim(),
        description: notes.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectInfo.project.id,
      },
      { onError: () => setError("No se pudo crear la tarea") },
    );
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-5">
      <header className="flex items-center gap-2">
        <Link to="/today" className="text-zinc-400 active:text-zinc-200">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">Nueva tarea</h1>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <input
          className={inputClass}
          placeholder="¿Qué hay que hacer?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="grid grid-cols-4 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-lg border px-1 py-2 text-[11px] ${
                priority === p
                  ? "border-emerald-600 bg-emerald-600/10 text-emerald-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400"
              }`}
            >
              {p === "LOW" ? "Baja" : p === "MEDIUM" ? "Media" : p === "HIGH" ? "Alta" : "Urgente"}
            </button>
          ))}
        </div>
        <label className="block text-xs text-zinc-500">
          Vencimiento
          <input
            className={`${inputClass} mt-1`}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <p className="text-[11px] text-zinc-600">
          Proyecto:{" "}
          {loadingProject
            ? "cargando…"
            : (projectInfo?.project.name ?? "ninguno")}
        </p>
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={create.isPending || !title.trim()}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
        >
          {create.isPending ? "Creando…" : "Crear tarea"}
        </button>
      </form>
    </div>
  );
}
