import { useEffect, useMemo, useRef } from "react";
import {
  Schedule,
  cancel,
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import type { TimerBackendMode } from "@ordo-todo/hooks";

/** Id fijo (32-bit) de la única notificación del timer; permite cancelarla sin tocar otras. */
const TIMER_NOTIFICATION_ID = 7001;
/** Si la fase se interrumpe a menos de esto del deadline, la alarma se deja al sistema. */
const DEADLINE_GRACE_MS = 1_000;

export interface TimerNotifier {
  sessionComplete: (mode: TimerBackendMode) => void;
  autoStart: (mode: TimerBackendMode) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

function completionContent(mode: TimerBackendMode) {
  return mode === "WORK"
    ? {
        title: "🍅 Pomodoro completado",
        body: "Excelente trabajo. Hora de tomar un descanso.",
      }
    : { title: "☕ Descanso terminado", body: "Hora de volver al trabajo." };
}

async function ensurePermission(): Promise<boolean> {
  let granted = await isPermissionGranted();
  if (!granted) granted = (await requestPermission()) === "granted";
  return granted;
}

/**
 * Publica la notificación de fin de fase ahora mismo. Antes cancela la alarma
 * pendiente de useDeadlineNotification para que no reposte la misma
 * notificación minutos después (las alarmas son inexactas sin permiso de
 * alarma exacta). Si la alarma ya disparó, cancel() la descarta y se vuelve a
 * publicar: neto, una sola notificación.
 */
async function postCompletionNow(mode: TimerBackendMode) {
  try {
    if (!(await ensurePermission())) return;
    await cancel([TIMER_NOTIFICATION_ID]).catch(() => undefined);
    sendNotification({ id: TIMER_NOTIFICATION_ID, ...completionContent(mode) });
  } catch {
    // best-effort
  }
}

/**
 * Adaptador de feedback del motor del timer para Tauri: mensajes en pantalla
 * y, al completar una fase, notificación del sistema inmediata (como desktop).
 * En Tauri Android el JS sigue vivo en background, así que esto es lo que
 * normalmente avisa al usuario; la alarma de useDeadlineNotification cubre el
 * caso de proceso suspendido o muerto.
 */
export function useTimerNotifier(
  config: { autoStartBreaks: boolean; autoStartPomodoros: boolean },
  onMessage: (text: string) => void,
): TimerNotifier {
  const { autoStartBreaks, autoStartPomodoros } = config;
  // Memoizado: el motor lo usa en deps de useCallback/useEffect.
  return useMemo(
    () => ({
      sessionComplete: (mode) => {
        if (mode === "WORK" && !autoStartBreaks) {
          onMessage("¡Pomodoro completado! Has terminado un pomodoro.");
        } else if (mode !== "WORK" && !autoStartPomodoros) {
          onMessage("¡Descanso completado! Hora de volver al trabajo.");
        }
        void postCompletionNow(mode);
      },
      autoStart: (mode) => {
        onMessage(
          mode === "WORK"
            ? "Pomodoro iniciado automáticamente"
            : "Descanso iniciado automáticamente",
        );
      },
      success: onMessage,
      error: (text) => onMessage(`Error: ${text}`),
    }),
    [autoStartBreaks, autoStartPomodoros, onMessage],
  );
}

/**
 * Fallback para proceso suspendido o muerto: mantiene una alarma del sistema
 * programada al deadline de la fase corriendo. Depende solo del run-state —
 * nunca de timeLeft (no re-agenda por tick). Adaptación del efecto de la app
 * Expo (ODD 014 T5) con una diferencia clave: `cancel()` de este plugin
 * también descarta la notificación ya entregada, así que solo se cancela
 * cuando la fase se interrumpe antes del deadline (pausa/parada/salto). Si la
 * fase llegó a su fin, quien manda es postCompletionNow (vía sessionComplete).
 */
export function useDeadlineNotification(timer: {
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerBackendMode;
  timeLeft: number;
}) {
  const { isRunning, isPaused, mode, timeLeft } = timer;
  const fireAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning || isPaused || mode === "CONTINUOUS" || timeLeft <= 0) {
      return;
    }

    const fireAt = Date.now() + timeLeft * 1000;
    let cancelled = false;
    (async () => {
      try {
        if (!(await ensurePermission()) || cancelled) return;
        fireAtRef.current = fireAt;
        sendNotification({
          id: TIMER_NOTIFICATION_ID,
          ...completionContent(mode),
          // allowWhileIdle: sin permiso de alarma exacta (Android 12+) el
          // plugin cae a setAndAllowWhileIdle (RTC_WAKEUP); sin este flag
          // usaría set(RTC), que no despierta el dispositivo en Doze.
          schedule: Schedule.at(new Date(fireAt), false, true),
        });
      } catch {
        // best-effort: los mensajes en pantalla siguen al completar
      }
    })();

    return () => {
      cancelled = true;
      const scheduled = fireAtRef.current;
      fireAtRef.current = null;
      // Margen de 1 s: el tick del motor detecta el fin hasta 1 s después del
      // deadline; dentro de ese margen la alarma ya es del sistema.
      if (scheduled !== null && Date.now() < scheduled - DEADLINE_GRACE_MS) {
        cancel([TIMER_NOTIFICATION_ID]).catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, mode]);
}
