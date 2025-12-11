import { Entity, EntityProps } from "../../shared/entity";

export type HabitFrequency = "DAILY" | "WEEKLY" | "SPECIFIC_DAYS" | "MONTHLY";
export type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";

export interface HabitCompletionProps extends EntityProps {
    habitId: string;
    completedAt: Date;
    completedDate: Date;
    note?: string;
    value?: number;
}

export interface HabitProps extends EntityProps {
    name: string;
    description?: string;
    icon?: string;
    color: string;
    userId: string;
    workspaceId?: string;

    // Schedule
    frequency: HabitFrequency;
    targetDaysOfWeek: number[];
    targetCount: number;
    preferredTime?: string;
    timeOfDay?: TimeOfDay;

    // Gamification
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;

    // State
    isActive: boolean;
    isPaused: boolean;
    pausedAt?: Date;
    archivedAt?: Date;

    // Completions
    completions?: HabitCompletionProps[];

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

export class Habit extends Entity<HabitProps> {
    constructor(props: HabitProps) {
        super({
            ...props,
            frequency: props.frequency ?? "DAILY",
            targetDaysOfWeek: props.targetDaysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
            targetCount: props.targetCount ?? 1,
            color: props.color ?? "#10B981",
            currentStreak: props.currentStreak ?? 0,
            longestStreak: props.longestStreak ?? 0,
            totalCompletions: props.totalCompletions ?? 0,
            isActive: props.isActive ?? true,
            isPaused: props.isPaused ?? false,
            completions: props.completions ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(
        props: Omit<
            HabitProps,
            | "id"
            | "currentStreak"
            | "longestStreak"
            | "totalCompletions"
            | "createdAt"
            | "updatedAt"
            | "isActive"
            | "isPaused"
        >
    ): Habit {
        return new Habit({
            ...props,
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            isActive: true,
            isPaused: false,
        });
    }

    /**
     * Check if habit is scheduled for a given day of week (0=Sunday, 6=Saturday)
     */
    isScheduledForDay(dayOfWeek: number): boolean {
        if (this.props.frequency === "DAILY") {
            return true;
        }
        if (this.props.frequency === "SPECIFIC_DAYS") {
            return this.props.targetDaysOfWeek.includes(dayOfWeek);
        }
        // For WEEKLY and MONTHLY, we need more context
        return true;
    }

    /**
     * Mark habit as completed, updating streak
     */
    complete(isConsecutive: boolean = true): Habit {
        const newTotal = this.props.totalCompletions + 1;
        const newStreak = isConsecutive ? this.props.currentStreak + 1 : 1;
        const newLongest = Math.max(this.props.longestStreak, newStreak);

        return this.clone({
            totalCompletions: newTotal,
            currentStreak: newStreak,
            longestStreak: newLongest,
            updatedAt: new Date(),
        });
    }

    /**
     * Reset streak (when habit is missed)
     */
    resetStreak(): Habit {
        return this.clone({
            currentStreak: 0,
            updatedAt: new Date(),
        });
    }

    /**
     * Pause habit tracking (vacation, illness, etc.)
     */
    pause(): Habit {
        return this.clone({
            isPaused: true,
            pausedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * Resume habit tracking
     */
    resume(): Habit {
        return this.clone({
            isPaused: false,
            pausedAt: undefined,
            updatedAt: new Date(),
        });
    }

    /**
     * Archive habit (soft delete)
     */
    archive(): Habit {
        return this.clone({
            isActive: false,
            archivedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * Update habit properties
     */
    update(
        props: Partial<
            Omit<HabitProps, "id" | "userId" | "createdAt" | "currentStreak" | "longestStreak" | "totalCompletions">
        >
    ): Habit {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
