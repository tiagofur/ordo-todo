"use client";

import { createContext, useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/api-hooks";

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

interface TimerSettingsContextType {
    settings: TimerSettings;
    updateSettings: (newSettings: Partial<TimerSettings>) => void;
    isLoaded: boolean;
}

export const TimerSettingsContext = createContext<TimerSettingsContextType | undefined>(undefined);

export function TimerSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);
    const { data: userPreferences } = useUserPreferences();

    useEffect(() => {
        const loadSettings = () => {
            const saved = localStorage.getItem("ordo-timer-settings");
            let local: Partial<TimerSettings> = {};
            if (saved) {
                try {
                    local = JSON.parse(saved);
                } catch {
                    // Invalid stored settings, use defaults
                }
            }

            const backend: Partial<TimerSettings> = {};
            if (userPreferences) {
                if (userPreferences.timerMode) {
                    backend.defaultMode = userPreferences.timerMode === "CONTINUOUS" ? "CONTINUOUS" : "POMODORO";
                }
                if (userPreferences.pomodoroDuration !== undefined) {
                    backend.workDuration = userPreferences.pomodoroDuration;
                }
                if (userPreferences.shortBreakDuration !== undefined) {
                    backend.shortBreakDuration = userPreferences.shortBreakDuration;
                }
                if (userPreferences.longBreakDuration !== undefined) {
                    backend.longBreakDuration = userPreferences.longBreakDuration;
                }
                if (userPreferences.pomodorosUntilLongBreak !== undefined) {
                    backend.pomodorosUntilLongBreak = userPreferences.pomodorosUntilLongBreak;
                }
                if (userPreferences.enableSounds !== undefined) {
                    backend.soundEnabled = userPreferences.enableSounds;
                }
                if (userPreferences.enableNotifications !== undefined) {
                    backend.notificationsEnabled = userPreferences.enableNotifications;
                }
            }

            const merged = { ...DEFAULT_SETTINGS, ...local, ...backend };
            setSettings(merged);
            localStorage.setItem("ordo-timer-settings", JSON.stringify(merged));
        };

        loadSettings();
        setIsLoaded(true);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "ordo-timer-settings") {
                loadSettings();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [userPreferences]);

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem("ordo-timer-settings", JSON.stringify(updated));
    };

    return (
        <TimerSettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
            {children}
        </TimerSettingsContext.Provider>
    );
}
