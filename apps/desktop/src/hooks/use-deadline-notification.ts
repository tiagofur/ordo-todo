import { useEffect, useRef } from "react";
import type { TimerBackendMode } from "@ordo-todo/hooks";
import { desktopBridge } from "@/lib/desktop-bridge";

/**
 * Id fijo (32-bit) de la alarma del sistema programada al deadline. Distinto
 * del de la notificación inmediata que publica el bridge, porque en Android
 * `cancel()` y programar descartan la notificación visible con ese id.
 */
export const DEADLINE_ALARM_NOTIFICATION_ID = 7002;

function completionContent(mode: TimerBackendMode) {
  return mode === "WORK"
    ? {
        title: "🍅 Pomodoro completado",
        body: "Excelente trabajo. Hora de tomar un descanso.",
      }
    : { title: "☕ Descanso terminado", body: "Hora de volver al trabajo." };
}

/** Cancela la alarma pendiente (no-op fuera de móvil). Best-effort. */
export async function cancelDeadlineAlarm(): Promise<void> {
  if (!desktopBridge.isMobile()) return;
  try {
    const { cancel } = await import("@tauri-apps/plugin-notification");
    await cancel([DEADLINE_ALARM_NOTIFICATION_ID]);
  } catch {
    // best-effort
  }
}

/**
 * Solo móvil (ODD 020 P3): fallback para proceso suspendido o muerto.
 * Mantiene una alarma del sistema programada al deadline de la fase corriendo.
 * Depende solo del run-state — nunca de timeLeft (no re-agenda por tick). En el
 * cleanup solo cancela si la fase ya NO está activa (pausa/parada/salto): si el
 * efecto se desmonta con la fase corriendo (navegar fuera del timer), la alarma
 * se deja viva. En desktop no hace nada: el JS nunca se suspende.
 */
export function useDeadlineNotification(timer: {
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerBackendMode;
  timeLeft: number;
}) {
  const { isRunning, isPaused, mode, timeLeft } = timer;
  const phaseActiveRef = useRef(isRunning && !isPaused);
  phaseActiveRef.current = isRunning && !isPaused;

  useEffect(() => {
    if (!desktopBridge.isMobile()) return;
    if (!isRunning || isPaused || mode === "CONTINUOUS" || timeLeft <= 0)
      return;

    let cancelled = false;
    (async () => {
      try {
        const {
          Schedule,
          isPermissionGranted,
          requestPermission,
          sendNotification,
        } = await import("@tauri-apps/plugin-notification");
        let granted = await isPermissionGranted();
        if (!granted) granted = (await requestPermission()) === "granted";
        if (!granted || cancelled) return;
        sendNotification({
          id: DEADLINE_ALARM_NOTIFICATION_ID,
          ...completionContent(mode),
          // allowWhileIdle: sin permiso de alarma exacta (Android 12+) el
          // plugin cae a setAndAllowWhileIdle (RTC_WAKEUP); sin el flag
          // usaría set(RTC), que no despierta el dispositivo en Doze.
          schedule: Schedule.at(
            new Date(Date.now() + timeLeft * 1000),
            false,
            true,
          ),
        });
      } catch {
        // best-effort: la notificación inmediata del bridge sigue al completar
      }
    })();

    return () => {
      cancelled = true;
      if (!phaseActiveRef.current) void cancelDeadlineAlarm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, mode]);
}
