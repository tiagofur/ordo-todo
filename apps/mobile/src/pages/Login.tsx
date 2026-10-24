import { useState } from "react";
import { useAuth } from "@ordo-todo/auth-provider";
import { startOAuthFlow } from "../lib/oauth";

export default function Login({ onGoRegister }: { onGoRegister: () => void }) {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await login({ email, password });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo iniciar sesión";
      setFormError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    setBusy(true);
    try {
      await startOAuthFlow(provider);
      // La vuelta llega por el deep link ordo://auth/callback
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-600";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center space-y-5 p-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Ordo</h1>
        <p className="text-sm text-zinc-500">Tu productividad, organizada</p>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <input
          className={inputClass}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {(formError || Boolean(error)) && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {formError || String((error as Error)?.message ?? error)}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <span className="h-px flex-1 bg-zinc-800" />
        o continúa con
        <span className="h-px flex-1 bg-zinc-800" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => oauth("google")}
          disabled={busy}
          className="rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-medium active:bg-zinc-800 disabled:opacity-50"
        >
          Google
        </button>
        <button
          onClick={() => oauth("github")}
          disabled={busy}
          className="rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-medium active:bg-zinc-800 disabled:opacity-50"
        >
          GitHub
        </button>
      </div>

      <p className="text-center text-xs text-zinc-500">
        ¿No tienes cuenta?{" "}
        <button onClick={onGoRegister} className="text-emerald-400 underline">
          Regístrate
        </button>
      </p>
    </div>
  );
}
