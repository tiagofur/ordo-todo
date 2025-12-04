/**
 * Date utility functions
 * Used across all applications for consistent date handling
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, locale: string = "en-US"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Format a date to a short string (e.g., "Dec 4, 2025")
 */
export function formatDateShort(date: Date | string, locale: string = "en-US"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Format a date to relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string, locale: string = "en-US"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (Math.abs(diffSec) < 60) {
        return diffSec >= 0 ? "in a few seconds" : "a few seconds ago";
    } else if (Math.abs(diffMin) < 60) {
        return diffMin >= 0 ? `in ${diffMin} minute${diffMin !== 1 ? "s" : ""}` : `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? "s" : ""} ago`;
    } else if (Math.abs(diffHour) < 24) {
        return diffHour >= 0 ? `in ${diffHour} hour${diffHour !== 1 ? "s" : ""}` : `${Math.abs(diffHour)} hour${Math.abs(diffHour) !== 1 ? "s" : ""} ago`;
    } else if (Math.abs(diffDay) < 30) {
        return diffDay >= 0 ? `in ${diffDay} day${diffDay !== 1 ? "s" : ""}` : `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? "s" : ""} ago`;
    } else {
        return formatDateShort(d, locale);
    }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.getTime() > new Date().getTime();
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate: Date | string | null | undefined): boolean {
    if (!dueDate) return false;
    const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    return isPast(d) && !isToday(d);
}

/**
 * Get the difference in days between two dates
 */
export function getDaysDiff(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the start of day for a date
 */
export function startOfDay(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of day for a date
 */
export function endOfDay(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Get the start of week for a date
 */
export function startOfWeek(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startDate = new Date(d.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

/**
 * Get the end of week for a date
 */
export function endOfWeek(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
    const endDate = new Date(d.setDate(diff));
    endDate.setHours(23, 59, 59, 999);
    return endDate;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string, hours: number): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date | string, minutes: number): Date {
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
}
