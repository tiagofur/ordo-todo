/**
 * Habit-related types and DTOs
 */

export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS' | 'MONTHLY';
export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';

export interface HabitCompletion {
    id: string;
    habitId: string;
    completedAt: Date;
    completedDate: Date;
    note: string | null;
    value: number | null;
}

export interface Habit {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string;
    userId: string;
    workspaceId: string | null;
    frequency: HabitFrequency;
    targetDaysOfWeek: number[];
    targetCount: number;
    preferredTime: string | null;
    timeOfDay: TimeOfDay | null;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    isActive: boolean;
    isPaused: boolean;
    pausedAt: Date | null;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    completions?: HabitCompletion[];
}

export interface CreateHabitDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    frequency?: HabitFrequency;
    targetDaysOfWeek?: number[];
    targetCount?: number;
    preferredTime?: string;
    timeOfDay?: TimeOfDay;
    workspaceId?: string;
}

export interface UpdateHabitDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    frequency?: HabitFrequency;
    targetDaysOfWeek?: number[];
    targetCount?: number;
    preferredTime?: string;
    timeOfDay?: TimeOfDay;
    isPaused?: boolean;
    isActive?: boolean;
}

export interface CompleteHabitDto {
    note?: string;
    value?: number;
    completedAt?: string;
}

export interface HabitStats {
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
    thisWeekCompletions: number;
    thisMonthCompletions: number;
    calendarData: Array<{
        date: string;
        completed: boolean;
    }>;
}

export interface TodayHabitsResponse {
    habits: Habit[];
    grouped: {
        MORNING: Habit[];
        AFTERNOON: Habit[];
        EVENING: Habit[];
        ANYTIME: Habit[];
    };
    summary: {
        total: number;
        completed: number;
        remaining: number;
        percentage: number;
    };
}

export interface CompleteHabitResponse {
    completion: HabitCompletion;
    habit: {
        id: string;
        name: string;
        currentStreak: number;
        longestStreak: number;
        totalCompletions: number;
    };
    xpAwarded: number;
    xpReason: string;
}
