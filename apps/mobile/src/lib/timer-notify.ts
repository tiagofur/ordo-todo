import { useEffect, useMemo, useRef } from "react";
import {
  Schedule,
  cancel,
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import type { TimerBackendMode } from "@ordo-todo/hooks";

/**
 * Ids fijos (32-bit) distintos para las dos capas: la publicación inmediata
 * del fin de fase y la alarma programada. Necesitan ids separados porque
 * `cancel()` y programar una notificación descartan lo visible con ese id
 * (Android), y no deben pisarse entre capas.
 */
const COMPLETION_NOTIFICATION_ID = 7001;
const DEADLINE_ALARM_NOTIFICATION_ID = 7002;

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
 * pendiente de useDeadlineNotification (capa 7002) para que no reposte
 * minutos después: las alarmas son inexactas sin permiso de alarma exacta, y
 * el id de la inmediata (7001) es distinto, así no se pisan.
 */
async function postCompletionNow(mode: TimerBackendMode) {
  try {
    if (!(await ensurePermission())) return;
    await cancel([DEADLINE_ALARM_NOTIFICATION_ID]).catch(() => undefined);
    sendNotification({
      id: COMPLETION_NOTIFICATION_ID,
      ...completionContent(mode),
    });
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
 * programada al deadline de la fase corriendo (capa 7002). Depende solo del
 * run-state — nunca de timeLeft (no re-agenda por tick). En el cleanup solo
 * cancela si la fase ya NO está activa (pausa/parada/salto): si el efecto se
 * desmonta con la fase corriendo (navegar fuera de /timer), la alarma se
 * deja viva — es exactamente la capa que avisa al usuario, y ya no hay JS
 * que publique la inmediata.
 */
export function useDeadlineNotification(timer: {
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerBackendMode;
  timeLeft: number;
}) {
  const { isRunning, isPaused, mode, timeLeft } = timer;

  // Estado de la fase leído por el cleanup del efecto: un desmonte con la
  // fase activa (unmount) no debe cancelar la alarma.
  const phaseActiveRef = useRef(isRunning && !isPaused);
  phaseActiveRef.current = isRunning && !isPaused;

  useEffect(() => {
    if (!isRunning || isPaused || mode === "CONTINUOUS" || timeLeft <= 0) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (!(await ensurePermission()) || cancelled) return;
        sendNotification({
          id: DEADLINE_ALARM_NOTIFICATION_ID,
          ...completionContent(mode),
          // allowWhileIdle: sin permiso de alarma exacta (Android 12+) el
          // plugin cae a setAndAllowWhileIdle (RTC_WAKEUP); sin este flag
          // usaría set(RTC), que no despierta el dispositivo en Doze.
          schedule: Schedule.at(
            new Date(Date.now() + timeLeft * 1000),
            false,
            true,
          ),
        });
      } catch {
        // best-effort: los mensajes en pantalla siguen al completar
      }
    })();

    return () => {
      cancelled = true;
      if (!phaseActiveRef.current) {
        cancel([DEADLINE_ALARM_NOTIFICATION_ID]).catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, mode]);
}
