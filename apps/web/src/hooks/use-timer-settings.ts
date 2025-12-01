import { useState, useEffect } from "react";

export interface TimerSettings {
    defaultMode: "POMODORO" | "CONTINUOUS";
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
    defaultMode: "POMODORO",
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
};

export function useTimerSettings() {
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("ordo-timer-settings");
        if (saved) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse timer settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem("ordo-timer-settings", JSON.stringify(updated));
    };

    return { settings, updateSettings, isLoaded };
}
