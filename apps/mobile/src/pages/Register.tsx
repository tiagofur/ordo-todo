import { useState } from "react";
import { useAuth } from "@ordo-todo/auth-provider";

export default function Register({ onGoLogin }: { onGoLogin: () => void }) {
  const { register, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    inviteCode: "",
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        ...(form.inviteCode ? { inviteCode: form.inviteCode.trim() } : {}),
      });
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string; errorCode?: string } } })
        ?.response?.data;
      setFormError(String(data?.message || data?.errorCode || "No se pudo registrar"));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-600";

  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-6">
      <header>
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="text-xs text-zinc-500">
          El registro requiere un código de invitación (beta cerrada)
        </p>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <input
          className={inputClass}
          placeholder="Nombre"
          value={form.name}
          onChange={set("name")}
          required
        />
        <input
          className={inputClass}
          placeholder="Usuario"
          value={form.username}
          onChange={set("username")}
          required
        />
        <input
          className={inputClass}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={set("email")}
          required
        />
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          placeholder="Contraseña (mayús, minús, número y símbolo)"
          value={form.password}
          onChange={set("password")}
          required
        />
        <input
          className={inputClass}
          placeholder="Código de invitación (ORDO-XXXX-XXXX)"
          value={form.inviteCode}
          onChange={set("inviteCode")}
        />
        {formError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {formError}
          </p>
        )}
        {Boolean(error) && !formError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {String((error as Error)?.message ?? error)}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <button onClick={onGoLogin} className="text-emerald-400 underline">
          Entrar
        </button>
      </p>
    </div>
  );
}
