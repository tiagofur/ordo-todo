/**
 * Analytics-related types and DTOs
 */
export interface DailyMetrics {
    id: string;
    userId: string;
    date: Date;
    tasksCompleted: number;
    tasksCreated: number;
    focusTime: number;
    breakTime: number;
    pomodorosCompleted: number;
    productivityScore: number;
    focusScore?: number;
    streakDays: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface GetDailyMetricsParams {
    startDate?: Date | string;
    endDate?: Date | string;
}
export interface ProductivityStats {
    totalTasks: number;
    completedTasks: number;
    totalFocusTime: number;
    averageProductivity: number;
    currentStreak: number;
}
//# sourceMappingURL=analytics.types.d.ts.map