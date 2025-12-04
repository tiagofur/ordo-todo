/**
 * Time utility functions
 * Used across all applications for consistent time formatting and calculations
 */

/**
 * Format duration in minutes to human-readable string (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format duration in seconds to human-readable string (e.g., "1h 23m 45s")
 */
export function formatDurationFromSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
}

/**
 * Format time for timer display (MM:SS)
 */
export function formatTimerDisplay(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time for extended timer display (HH:MM:SS)
 */
export function formatTimerDisplayExtended(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Convert minutes to hours (decimal)
 */
export function minutesToHours(minutes: number): number {
    return Math.round((minutes / 60) * 100) / 100;
}

/**
 * Convert hours to minutes
 */
export function hoursToMinutes(hours: number): number {
    return Math.round(hours * 60);
}

/**
 * Convert seconds to minutes
 */
export function secondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
}

/**
 * Convert minutes to seconds
 */
export function minutesToSeconds(minutes: number): number {
    return minutes * 60;
}

/**
 * Parse duration string to minutes (e.g., "2h 30m" -> 150)
 */
export function parseDuration(duration: string): number {
    const hourMatch = duration.match(/(\d+)h/);
    const minMatch = duration.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

    return hours * 60 + minutes;
}

/**
 * Calculate total time worked from time entries
 */
export function calculateTotalTimeWorked(timeEntries: Array<{ duration: number }>): number {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0);
}

/**
 * Calculate average time per task
 */
export function calculateAverageTime(totalMinutes: number, taskCount: number): number {
    if (taskCount === 0) return 0;
    return Math.round(totalMinutes / taskCount);
}

/**
 * Format time of day (e.g., "14:30" -> "2:30 PM")
 */
export function formatTimeOfDay(time: string, use24Hour: boolean = false): string {
    const [hours, minutes] = time.split(":").map(Number);

    if (use24Hour) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Check if time is within working hours (9 AM - 6 PM by default)
 */
export function isWorkingHours(
    date: Date = new Date(),
    startHour: number = 9,
    endHour: number = 18
): boolean {
    const hour = date.getHours();
    return hour >= startHour && hour < endHour;
}
