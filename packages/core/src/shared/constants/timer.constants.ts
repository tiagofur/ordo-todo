/**
 * Pomodoro Timer constants
 * Used across all applications for consistent timer behavior
 */

export const TIMER_MODES = {
    WORK: {
        value: "WORK" as const,
        label: "Work",
        color: "#EF4444", // red
        defaultDuration: 25, // minutes
    },
    SHORT_BREAK: {
        value: "SHORT_BREAK" as const,
        label: "Short Break",
        color: "#10B981", // light green
        defaultDuration: 5, // minutes
    },
    LONG_BREAK: {
        value: "LONG_BREAK" as const,
        label: "Long Break",
        color: "#059669", // dark green
        defaultDuration: 15, // minutes
    },
    CONTINUOUS: {
        value: "CONTINUOUS" as const,
        label: "Continuous",
        color: "#3B82F6", // blue
        defaultDuration: 0, // no limit
    },
} as const;

export const TIMER_MODE_VALUES = [
    "WORK",
    "SHORT_BREAK",
    "LONG_BREAK",
    "CONTINUOUS",
] as const;

export type TimerMode = typeof TIMER_MODE_VALUES[number];

/**
 * Default Pomodoro settings
 */
export const DEFAULT_POMODORO_SETTINGS = {
    workDuration: 25, // minutes
    shortBreakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    pomodorosUntilLongBreak: 4, // number of work sessions
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
} as const;

/**
 * Timer limits and constraints
 */
export const TIMER_LIMITS = {
    MIN_DURATION: 1, // minutes
    MAX_DURATION: 120, // minutes
    MIN_POMODOROS_UNTIL_LONG_BREAK: 2,
    MAX_POMODOROS_UNTIL_LONG_BREAK: 10,
} as const;

/**
 * Get timer mode configuration
 */
export function getTimerModeConfig(mode: TimerMode) {
    return TIMER_MODES[mode];
}

/**
 * Get timer mode color
 */
export function getTimerModeColor(mode: TimerMode): string {
    return TIMER_MODES[mode].color;
}

/**
 * Get timer mode label
 */
export function getTimerModeLabel(mode: TimerMode): string {
    return TIMER_MODES[mode].label;
}

/**
 * Get timer mode default duration
 */
export function getTimerModeDefaultDuration(mode: TimerMode): number {
    return TIMER_MODES[mode].defaultDuration;
}

/**
 * Check if it's time for a long break
 */
export function shouldTakeLongBreak(
    completedPomodoros: number,
    pomodorosUntilLongBreak: number = DEFAULT_POMODORO_SETTINGS.pomodorosUntilLongBreak
): boolean {
    return completedPomodoros > 0 && completedPomodoros % pomodorosUntilLongBreak === 0;
}
