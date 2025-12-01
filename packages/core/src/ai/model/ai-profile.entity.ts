import { Entity, EntityProps } from "../../shared/entity";

export interface AIProfileProps extends EntityProps {
    userId: string;
    peakHours: Record<number, number>; // hour (0-23) -> productivity score (0-1)
    peakDays: Record<number, number>; // day of week (0-6) -> productivity score (0-1)
    avgTaskDuration: number; // in minutes
    completionRate: number; // 0-1 (percentage)
    categoryPreferences: Record<string, number>; // category -> preference score (0-1)
    updatedAt?: Date;
}

export class AIProfile extends Entity<AIProfileProps> {
    constructor(props: AIProfileProps) {
        super({
            ...props,
            peakHours: props.peakHours ?? {},
            peakDays: props.peakDays ?? {},
            avgTaskDuration: props.avgTaskDuration ?? 30,
            completionRate: props.completionRate ?? 0.7,
            categoryPreferences: props.categoryPreferences ?? {},
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(userId: string): AIProfile {
        return new AIProfile({
            userId,
            peakHours: {},
            peakDays: {},
            avgTaskDuration: 30,
            completionRate: 0.7,
            categoryPreferences: {},
        });
    }

    /**
     * Update productivity score for a specific hour of the day (0-23)
     * Uses exponential moving average to smooth out variations
     */
    updatePeakHour(hour: number, score: number): AIProfile {
        if (hour < 0 || hour > 23) {
            throw new Error("Hour must be between 0 and 23");
        }
        if (score < 0 || score > 1) {
            throw new Error("Score must be between 0 and 1");
        }

        const currentScore = this.props.peakHours[hour] ?? 0.5;
        // Exponential moving average: 70% old value, 30% new value
        const newScore = currentScore * 0.7 + score * 0.3;

        return this.clone({
            peakHours: {
                ...this.props.peakHours,
                [hour]: newScore,
            },
            updatedAt: new Date(),
        });
    }

    /**
     * Update productivity score for a specific day of the week (0=Sunday, 6=Saturday)
     * Uses exponential moving average to smooth out variations
     */
    updatePeakDay(dayOfWeek: number, score: number): AIProfile {
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            throw new Error("Day of week must be between 0 and 6");
        }
        if (score < 0 || score > 1) {
            throw new Error("Score must be between 0 and 1");
        }

        const currentScore = this.props.peakDays[dayOfWeek] ?? 0.5;
        // Exponential moving average: 70% old value, 30% new value
        const newScore = currentScore * 0.7 + score * 0.3;

        return this.clone({
            peakDays: {
                ...this.props.peakDays,
                [dayOfWeek]: newScore,
            },
            updatedAt: new Date(),
        });
    }

    /**
     * Recalculate average task duration based on recent completed tasks
     * Uses exponential moving average to give more weight to recent data
     */
    recalculateAvgDuration(recentDurations: number[]): AIProfile {
        if (recentDurations.length === 0) {
            return this;
        }

        const avgRecent = recentDurations.reduce((sum, d) => sum + d, 0) / recentDurations.length;
        // Exponential moving average: 60% old value, 40% new value
        const newAvg = this.props.avgTaskDuration * 0.6 + avgRecent * 0.4;

        return this.clone({
            avgTaskDuration: Math.round(newAvg),
            updatedAt: new Date(),
        });
    }

    /**
     * Update completion rate based on completed and total tasks
     * Uses exponential moving average
     */
    updateCompletionRate(completed: number, total: number): AIProfile {
        if (total === 0) {
            return this;
        }
        if (completed > total) {
            throw new Error("Completed tasks cannot exceed total tasks");
        }

        const newRate = completed / total;
        // Exponential moving average: 80% old value, 20% new value
        const updatedRate = this.props.completionRate * 0.8 + newRate * 0.2;

        return this.clone({
            completionRate: Math.max(0, Math.min(1, updatedRate)),
            updatedAt: new Date(),
        });
    }

    /**
     * Update preference score for a category
     * Higher score means user works better/prefers this category
     */
    updateCategoryPreference(category: string, score: number): AIProfile {
        if (score < 0 || score > 1) {
            throw new Error("Score must be between 0 and 1");
        }

        const currentScore = this.props.categoryPreferences[category] ?? 0.5;
        // Exponential moving average: 70% old value, 30% new value
        const newScore = currentScore * 0.7 + score * 0.3;

        return this.clone({
            categoryPreferences: {
                ...this.props.categoryPreferences,
                [category]: newScore,
            },
            updatedAt: new Date(),
        });
    }

    /**
     * Get the top N most productive hours
     */
    getTopPeakHours(limit: number = 3): number[] {
        return Object.entries(this.props.peakHours)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([hour]) => parseInt(hour));
    }

    /**
     * Get the top N most productive days
     */
    getTopPeakDays(limit: number = 3): number[] {
        return Object.entries(this.props.peakDays)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([day]) => parseInt(day));
    }

    /**
     * Get the top N preferred categories
     */
    getTopCategories(limit: number = 5): string[] {
        return Object.entries(this.props.categoryPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([category]) => category);
    }

    /**
     * Check if a specific hour is a peak productivity hour (score > 0.7)
     */
    isPeakHour(hour: number): boolean {
        return (this.props.peakHours[hour] ?? 0) > 0.7;
    }

    /**
     * Check if a specific day is a peak productivity day (score > 0.7)
     */
    isPeakDay(dayOfWeek: number): boolean {
        return (this.props.peakDays[dayOfWeek] ?? 0) > 0.7;
    }
}
