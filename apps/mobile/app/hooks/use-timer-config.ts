/**
 * Mobile timer config (ODD 014, T6/S6).
 *
 * Single source of timer configuration for the mobile timer screens:
 * backend user preferences first (shared with web/desktop), then the legacy
 * on-device settings (`ordo-mobile-settings`, still written by the mobile
 * Settings screen), then Pomodoro defaults.
 */
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserPreferences } from "@/app/lib/shared-hooks";
import type { TimerConfig, TimerType } from "./use-timer-backend";

const SETTINGS_KEY = "ordo-mobile-settings";

const DEFAULTS: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
};

interface LocalSettings {
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
    soundEnabled?: boolean;
    notificationsEnabled?: boolean;
}

function num(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) && value > 0
        ? value
        : undefined;
}

function bool(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

export function useTimerConfig(): { config: TimerConfig; type: TimerType; isLoaded: boolean } {
    const { data: prefs } = useUserPreferences();
    const [local, setLocal] = useState<LocalSettings | null>(null);
    const [localLoaded, setLocalLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(SETTINGS_KEY);
                if (!cancelled && saved) {
                    setLocal(JSON.parse(saved) as LocalSettings);
                }
            } catch {
                // Best-effort: fall through to defaults.
            } finally {
                if (!cancelled) setLocalLoaded(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const config = useMemo<TimerConfig>(() => {
        const p = (prefs ?? {}) as Record<string, unknown>;
        return {
            workDuration:
                num(p.pomodoroDuration) ?? num(local?.workDuration) ?? DEFAULTS.workDuration,
            shortBreakDuration:
                num(p.shortBreakDuration) ?? num(local?.shortBreakDuration) ?? DEFAULTS.shortBreakDuration,
            longBreakDuration:
                num(p.longBreakDuration) ?? num(local?.longBreakDuration) ?? DEFAULTS.longBreakDuration,
            pomodorosUntilLongBreak:
                num(p.pomodorosUntilLongBreak) ?? DEFAULTS.pomodorosUntilLongBreak,
            autoStartBreaks: DEFAULTS.autoStartBreaks,
            autoStartPomodoros: DEFAULTS.autoStartPomodoros,
            soundEnabled:
                bool(p.enableSounds) ?? bool(local?.soundEnabled) ?? DEFAULTS.soundEnabled,
            notificationsEnabled:
                bool(p.enableNotifications) ?? bool(local?.notificationsEnabled) ?? DEFAULTS.notificationsEnabled,
        };
    }, [prefs, local]);

    const type: TimerType =
        (prefs as { timerMode?: string } | undefined)?.timerMode === "CONTINUOUS"
            ? "CONTINUOUS"
            : "POMODORO";

    return { config, type, isLoaded: localLoaded };
}
