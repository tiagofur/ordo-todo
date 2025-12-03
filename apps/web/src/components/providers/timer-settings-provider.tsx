"use client";

import { createContext, useEffect, useState } from "react";

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

    useEffect(() => {
        const loadSettings = () => {
            const saved = localStorage.getItem("ordo-timer-settings");
            if (saved) {
                try {
                    setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
                } catch (e) {
                    console.error("Failed to parse timer settings", e);
                }
            }
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
    }, []);

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
