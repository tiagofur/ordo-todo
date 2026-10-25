import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pause,
  Play,
  SkipForward,
  Square,
  Timer as TimerIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_ENGINE_CONFIG } from "@ordo-todo/core";
import {
  useTimerBackend,
  type LastClosedSession,
  type TimerBackendApi,
  type TimerBackendMode,
} from "@ordo-todo/hooks";
import {
  useActiveTimer,
  usePauseTimer,
  useResumeTimer,
  useSessionHistory,
  useStartTimer,
  useStopTimer,
  useTimerStats,
} from "../lib/timer-queries";
import { useDeadlineNotification, useTimerNotifier } from "../lib/timer-notify";

const MODE_LABEL: Record<TimerBackendMode, string> = {
  WORK: "Focus",
  SHORT_BREAK: "Descanso corto",
  LONG_BREAK: "Descanso largo",
  CONTINUOUS: "Continuo",
};

function startOfTodayISO(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

type Banner = { kind: "ok" | "error"; text: string } | null;
const BANNER_AUTO_DISMISS_MS = 8_000;

export default function Timer() {
  const qc = useQueryClient();
  const [banner, setBanner] = useState<Banner>(null);
  const showOk = useCallback(
    (text: string) => setBanner({ kind: "ok", text }),
    [],
  );
  const showError = useCallback(
    (text: string) => setBanner({ kind: "error", text }),
    [],
  );

  // Se estabiliza dentro del día; una vez por montaje evita recalcular por render.
  const [todayISO] = useState(startOfTodayISO);

  const config = DEFAULT_ENGINE_CONFIG;
  const notifier = useTimerNotifier(config, showOk);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), BANNER_AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [banner]);

  const { data: active } = useActiveTimer();
  const { data: todayStats } = useTimerStats({ startDate: todayISO });
  const { data: lastClosedPage } = useSessionHistory({
    completedOnly: true,
    limit: 1,
  });

  const { mutateAsync: startTimer, isPending: starting } = useStartTimer();
  const { mutateAsync: stopTimer, isPending: stopping } = useStopTimer();
  const { mutateAsync: pauseTimer, isPending: pausing } = usePauseTimer();
  const { mutateAsync: resumeTimer, isPending: resuming } = useResumeTimer();

  // Solo cuenta como "cerrada" si el backend ya fijó endedAt.
  const lastClosed = lastClosedPage?.sessions?.[0];
  const lastClosedSession: LastClosedSession | null = lastClosed?.endedAt
    ? {
        type: lastClosed.type as TimerBackendMode,
        endedAt: lastClosed.endedAt,
        wasCompleted: lastClosed.wasCompleted ?? true,
      }
    : null;

  // api memoizado: el motor lo usa en deps de useCallback/useEffect y los
  // mutateAsync de TanStack v5 son estables.
  const api: TimerBackendApi = useMemo(
    () => ({
      activeSession: active
        ? {
            type: active.type as TimerBackendMode,
            elapsedSeconds: active.elapsedSeconds,
            isPaused: active.isPaused,
            taskId: active.taskId ?? null,
            pauseCount: active.pauseCount ?? 0,
            totalPauseTime: active.totalPauseTime ?? 0,
            currentPauseStart: active.currentPauseStart ?? null,
          }
        : null,
      start: (input) =>
        startTimer({ taskId: input.taskId || undefined, type: input.type }),
      stop: (input) => stopTimer({ wasCompleted: input.wasCompleted }),
      pause: (input) => pauseTimer({ pauseStartedAt: input.pauseStartedAt }),
      resume: (input) => resumeTimer({ pauseStartedAt: input.pauseStartedAt }),
      switchTask: async () => {
        // El selector de tarea llega en P4; hoy no se usa.
      },
      refetch: () => qc.invalidateQueries({ queryKey: ["timer", "active"] }),
    }),
    [active, startTimer, stopTimer, pauseTimer, resumeTimer, qc],
  );

  const timer = useTimerBackend({
    type: "POMODORO",
    config,
    taskId: null,
    api,
    notify: notifier,
    completedToday: todayStats?.pomodorosCompleted ?? null,
    lastClosedSession,
  });

  useDeadlineNotification(timer);

  const { mode, timeLeft, isRunning, isPaused } = timer;
  const busy = starting || stopping || pausing || resuming;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center space-y-6 p-6">
      <header className="flex w-full items-center gap-2">
        <TimerIcon className="size-5 text-emerald-400" />
        <h1 className="text-lg font-semibold">Timer</h1>
      </header>

      <div className="relative flex size-56 items-center justify-center rounded-full border-4 border-zinc-800">
        <div
          className="absolute inset-1 rounded-full border-4 border-emerald-500/70"
          style={{
            clipPath: `inset(0 ${timer.getProgress().toFixed(1)}% 0 0)`,
          }}
        />
        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums">
            {timer.formatTime(timeLeft)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            {MODE_LABEL[mode]}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Pomodoros hoy:{" "}
        <span className="font-semibold text-zinc-300">
          {timer.completedPomodoros}
        </span>
      </p>

      {banner && (
        <p
          role="status"
          className={
            banner.kind === "error"
              ? "w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400"
              : "w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-400"
          }
        >
          {banner.text}
        </p>
      )}

      <div className="flex w-full items-center justify-center gap-3">
        {!isRunning && !isPaused && (
          <button
            onClick={() => void timer.start()}
            disabled={busy}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
          >
            Iniciar {mode === "WORK" ? "focus" : "descanso"}
          </button>
        )}
        {isRunning && !isPaused && (
          <button
            onClick={() => void timer.pause()}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm text-zinc-200 active:bg-zinc-800 disabled:opacity-50"
          >
            <Pause className="size-4" /> Pausar
          </button>
        )}
        {isPaused && (
          <button
            onClick={() => void timer.resume()}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
          >
            <Play className="size-4" /> Reanudar
          </button>
        )}
        {(isRunning || isPaused) && (
          <>
            <button
              onClick={() => void timer.skipToNext()}
              disabled={busy}
              aria-label="Saltar fase"
              className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-200 active:bg-zinc-800 disabled:opacity-50"
            >
              <SkipForward className="size-4" />
            </button>
            <button
              onClick={() => void timer.stop(false)}
              disabled={busy}
              aria-label="Detener"
              className="flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-400 active:bg-red-500/20 disabled:opacity-50"
            >
              <Square className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
