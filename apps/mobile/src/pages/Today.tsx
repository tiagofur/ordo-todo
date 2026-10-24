import { LogOut } from "lucide-react";
import type { UserResponse } from "@ordo-todo/api-client";

export default function Today({
  user,
  onLogout,
}: {
  user: UserResponse;
  onLogout: () => void;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500">Hola de nuevo</p>
          <h1 className="text-xl font-semibold">{user.name || user.username}</h1>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 active:bg-zinc-800"
        >
          <LogOut className="size-4" />
          Salir
        </button>
      </header>

      <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        Sesión activa (P1) — llamadas autenticadas funcionando contra el
        backend.
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">
        <h2 className="mb-1 font-medium text-zinc-200">Hoy (P2)</h2>
        La pantalla de tareas llega en la fase P2. Este placeholder confirma
        que el gate de sesión y el token funcionan.
      </section>
    </div>
  );
}
