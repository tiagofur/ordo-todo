import { useCallback, useEffect, useState } from "react";
import { AlarmClock, BellRing, ListChecks, ScrollText } from "lucide-react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  Schedule,
} from "@tauri-apps/plugin-notification";
import { openUrl } from "@tauri-apps/plugin-opener";

/**
 * Pantalla validadora del spike (ODD 020 P0). Cada tarjeta es un criterio
 * de aceptación que se verifica a mano en el emulador/dispositivo:
 *  1. Permiso y notificación inmediata
 *  2. Notificación programada (el caso real del timer: app en background)
 *  3. Scroll fluido de una lista larga (200 filas)
 *  4. Apertura del navegador del sistema (flujo OAuth de la fase P1)
 */
type CheckState = "pendiente" | "ok" | "error";

const CHECKS = [
  { id: "permiso", label: "Permiso de notificaciones concedido" },
  { id: "inmediata", label: "Notificación inmediata recibida" },
  { id: "programada", label: "Notificación programada (5 s) recibida" },
  { id: "scroll", label: "Scroll de 200 filas sin cortes" },
  { id: "browser", label: "Navegador del sistema abre URL externa" },
] as const;

type CheckId = (typeof CHECKS)[number]["id"];

export default function Spike() {
  const [checks, setChecks] = useState<Record<CheckId, CheckState>>({
    permiso: "pendiente",
    inmediata: "pendiente",
    programada: "pendiente",
    scroll: "pendiente",
    browser: "pendiente",
  });
  const [log, setLog] = useState<string[]>([]);

  const appendLog = useCallback((line: string) => {
    const now = new Date().toLocaleTimeString();
    setLog((prev) => [`[${now}] ${line}`, ...prev].slice(0, 30));
  }, []);

  const mark = useCallback((id: CheckId, state: CheckState) => {
    setChecks((prev) => ({ ...prev, [id]: state }));
  }, []);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    let granted = await isPermissionGranted();
    if (!granted) {
      appendLog("pidiendo permiso de notificaciones…");
      granted = (await requestPermission()) === "granted";
    }
    mark("permiso", granted ? "ok" : "error");
    return granted;
  }, [appendLog, mark]);

  const notifyNow = useCallback(async () => {
    try {
      if (!(await ensurePermission())) return;
      await sendNotification({
        title: "Ordo · spike",
        body: "Notificación inmediata",
      });
      mark("inmediata", "ok");
      appendLog("notificación inmediata enviada");
    } catch (e) {
      mark("inmediata", "error");
      appendLog(`error inmediata: ${String(e)}`);
    }
  }, [appendLog, ensurePermission, mark]);

  const notifyIn5s = useCallback(async () => {
    try {
      if (!(await ensurePermission())) return;
      const at = new Date(Date.now() + 5_000);
      await sendNotification({
        title: "Ordo · timer",
        body: "Pomodoro terminado (programada a 5 s)",
        schedule: Schedule.at(at),
      });
      appendLog(
        `programada para ${at.toLocaleTimeString()} — poner la app en background y esperar`,
      );
    } catch (e) {
      appendLog(`error programada: ${String(e)}`);
    }
  }, [appendLog, ensurePermission]);

  const openExternal = useCallback(async () => {
    try {
      await openUrl("https://ordotodo.app");
      mark("browser", "ok");
      appendLog("openUrl lanzó el navegador del sistema");
    } catch (e) {
      mark("browser", "error");
      appendLog(`error openUrl: ${String(e)}`);
    }
  }, [appendLog, mark]);

  useEffect(() => {
    appendLog(`webview: ${navigator.userAgent.slice(0, 90)}…`);
  }, [appendLog]);

  const badge = (state: CheckState) =>
    state === "ok"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : state === "error"
        ? "bg-red-500/15 text-red-400 border-red-500/30"
        : "bg-zinc-800 text-zinc-400 border-zinc-700";

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header>
        <h1 className="text-lg font-semibold">Ordo · spike Tauri 2 mobile</h1>
        <p className="text-xs text-zinc-500">
          ODD 020 P0 — validación en emulador/dispositivo
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3">
        <button
          onClick={notifyNow}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
        >
          <BellRing className="size-5 text-emerald-400" />
          <span className="flex-1 text-sm font-medium">
            Notificación inmediata
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${badge(checks.inmediata)}`}
          >
            {checks.inmediata}
          </span>
        </button>

        <button
          onClick={notifyIn5s}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
        >
          <AlarmClock className="size-5 text-amber-400" />
          <span className="flex-1 text-sm font-medium">
            Programar notificación en 5 s
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${badge(checks.programada)}`}
          >
            {checks.programada}
          </span>
        </button>

        <button
          onClick={openExternal}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left active:bg-zinc-800"
        >
          <ScrollText className="size-5 text-sky-400" />
          <span className="flex-1 text-sm font-medium">
            Abrir navegador del sistema
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${badge(checks.browser)}`}
          >
            {checks.browser}
          </span>
        </button>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <ListChecks className="size-4 text-zinc-400" />
          Lista larga (200 filas) — hacer scroll
        </div>
        <div className="h-56 overflow-y-auto rounded-lg border border-zinc-800">
          {Array.from({ length: 200 }, (_, i) => (
            <button
              key={i}
              onClick={() => mark("scroll", "ok")}
              className="flex w-full items-center justify-between border-b border-zinc-800/60 px-3 py-2 text-left text-xs active:bg-zinc-800"
            >
              <span>Tarea de prueba #{i + 1}</span>
              <span className="text-zinc-500">
                {i % 3 === 0 ? "hoy" : "pendiente"}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Toca cualquier fila para marcar el check de scroll:{" "}
          <span className={checks.scroll === "ok" ? "text-emerald-400" : ""}>
            {checks.scroll}
          </span>
        </p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-sm font-medium">Estado de checks</h2>
        <ul className="space-y-1.5">
          {CHECKS.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{c.label}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${badge(checks[c.id])}`}
              >
                {checks[c.id]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-sm font-medium">Log</h2>
        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-500">
          {log.length > 0 ? log.join("\n") : "sin eventos todavía"}
        </pre>
      </section>
    </div>
  );
}
