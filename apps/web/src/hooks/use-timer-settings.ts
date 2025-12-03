import { useContext } from "react";
import { TimerSettingsContext } from "@/components/providers/timer-settings-provider";

export type { TimerSettings } from "@/components/providers/timer-settings-provider";

export function useTimerSettings() {
    const context = useContext(TimerSettingsContext);
    if (context === undefined) {
        throw new Error("useTimerSettings must be used within a TimerSettingsProvider");
    }
    return context;
}
