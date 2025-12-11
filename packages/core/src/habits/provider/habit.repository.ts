export interface IHabitRepository {
    findById(id: string): Promise<any>;
    findByUserId(userId: string): Promise<any[]>;
    findActiveByUserId(userId: string): Promise<any[]>;
    findTodayHabits(userId: string): Promise<any[]>;
    create(habit: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;

    // Completions
    createCompletion(habitId: string, data: any): Promise<any>;
    deleteCompletion(habitId: string, date: Date): Promise<void>;
    getCompletions(habitId: string, startDate: Date, endDate: Date): Promise<any[]>;
    getCompletionForDate(habitId: string, date: Date): Promise<any | null>;

    // Stats
    getStats(habitId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        totalCompletions: number;
        completionRate: number;
        thisWeekCompletions: number;
        thisMonthCompletions: number;
    }>;
}
