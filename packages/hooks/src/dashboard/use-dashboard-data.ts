/**
 * useDashboardData - Composite Hook for Dashboard
 * 
 * This hook aggregates all the data needed for the Dashboard screen,
 * providing a consistent data structure across Web, Desktop, and Mobile.
 * 
 * @example
 * ```tsx
 * import { useDashboardData } from '@/lib/shared-hooks';
 * 
 * function Dashboard() {
 *   const { stats, tasks, streak, objectives, habits, isLoading } = useDashboardData();
 *   // ...
 * }
 * ```
 */

import { useMemo } from 'react';
import { format, startOfDay, endOfDay, isToday } from 'date-fns';

// Type definitions for the dashboard data
export interface DashboardStats {
    tasksCompleted: number;
    subtasksCompleted: number;
    totalMinutesWorked: number;
    productivityRate: number;
    pendingTasks: number;
    todayTasks: number;
}

export interface DashboardStreak {
    currentStreak: number;
    longestStreak: number;
}

export interface DashboardObjective {
    id: string;
    title: string;
    progress: number;
    color?: string;
    daysRemaining: number;
    keyResultsCount: number;
}

export interface DashboardObjectivesSummary {
    total: number;
    completed: number;
    atRisk: number;
    averageProgress: number;
    objectives: DashboardObjective[];
}

export interface DashboardHabit {
    id: string;
    name: string;
    color?: string;
    isPaused?: boolean;
    completions?: any[];
    currentStreak: number;
}

export interface DashboardHabitsSummary {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
    habits: DashboardHabit[];
}

export interface DashboardTask {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string | Date | null;
    completedAt?: string | Date | null;
    estimatedMinutes?: number;
    projectId?: string;
    project?: { name: string; color?: string } | null;
    isToday: boolean;
}

export interface DashboardData {
    stats: DashboardStats;
    streak: DashboardStreak;
    objectives: DashboardObjectivesSummary;
    habits: DashboardHabitsSummary;
    todaysTasks: DashboardTask[];
    allTasks: DashboardTask[];
    isLoading: boolean;
    errors: {
        tasks?: Error;
        metrics?: Error;
        streak?: Error;
        objectives?: Error;
        habits?: Error;
        timer?: Error;
    };
    refetch: () => Promise<void>;
}

interface HooksBundle {
    useTasks: (projectId?: string, tags?: string[], options?: { assignedToMe?: boolean }) => any;
    useDailyMetrics: (params?: { startDate?: Date | string; endDate?: Date | string }) => any;
    useProductivityStreak: () => any;
    useObjectivesDashboard: () => any;
    useTodayHabits: () => any;
    useTimerStats: (params?: { startDate?: string; endDate?: string }) => any;
}

/**
 * Creates the useDashboardData hook using the provided hooks bundle.
 * This allows each app to provide its own hooks implementation.
 */
export function createUseDashboardData(hooks: HooksBundle) {
    return function useDashboardData(): DashboardData {
        const today = new Date();
        const todayStart = format(startOfDay(today), 'yyyy-MM-dd');
        const todayEnd = format(endOfDay(today), 'yyyy-MM-dd');

        // Fetch all data
        const tasksQuery = hooks.useTasks();
        const metricsQuery = hooks.useDailyMetrics({
            startDate: todayStart,
            endDate: todayEnd
        });
        const streakQuery = hooks.useProductivityStreak();
        const objectivesQuery = hooks.useObjectivesDashboard();
        const habitsQuery = hooks.useTodayHabits();
        const timerQuery = hooks.useTimerStats({
            startDate: todayStart,
            endDate: todayEnd
        });

        // Process tasks
        const allTasks = useMemo(() => {
            const tasks = tasksQuery.data || [];
            return tasks.map((task: any) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                completedAt: task.completedAt,
                estimatedMinutes: task.estimatedMinutes,
                projectId: task.projectId,
                project: task.project,
                isToday: isTaskToday(task),
            }));
        }, [tasksQuery.data]);

        const todaysTasks = useMemo(() => {
            return allTasks.filter((task: DashboardTask) => task.isToday);
        }, [allTasks]);

        // Calculate stats
        const stats = useMemo<DashboardStats>(() => {
            const metrics = metricsQuery.data?.[0];
            const timerStats = timerQuery.data;

            return {
                tasksCompleted: metrics?.tasksCompleted ?? 0,
                subtasksCompleted: metrics?.subtasksCompleted ?? 0,
                totalMinutesWorked: timerStats?.totalMinutesWorked ?? 0,
                productivityRate: timerStats?.completionRate ?? 0,
                pendingTasks: allTasks.filter((t: DashboardTask) => t.status !== 'COMPLETED').length,
                todayTasks: todaysTasks.length,
            };
        }, [metricsQuery.data, timerQuery.data, allTasks, todaysTasks]);

        // Process streak
        const streak = useMemo<DashboardStreak>(() => {
            return {
                currentStreak: streakQuery.data?.currentStreak ?? 0,
                longestStreak: streakQuery.data?.longestStreak ?? 0,
            };
        }, [streakQuery.data]);

        // Process objectives
        const objectives = useMemo<DashboardObjectivesSummary>(() => {
            const data = objectivesQuery.data;
            return {
                total: data?.total ?? 0,
                completed: data?.completed ?? 0,
                atRisk: data?.atRisk ?? 0,
                averageProgress: data?.averageProgress ?? 0,
                objectives: (data?.objectives ?? []).map((obj: any) => ({
                    id: obj.id,
                    title: obj.title,
                    progress: obj.progress,
                    color: obj.color,
                    daysRemaining: obj.daysRemaining,
                    keyResultsCount: obj.keyResultsCount ?? obj.keyResults?.length ?? 0,
                })),
            };
        }, [objectivesQuery.data]);

        // Process habits
        const habits = useMemo<DashboardHabitsSummary>(() => {
            const habitsData = Array.isArray(habitsQuery.data) ? habitsQuery.data : [];
            const completed = habitsData.filter((h: any) => h.completions?.length > 0).length;

            return {
                total: habitsData.length,
                completed,
                remaining: habitsData.length - completed,
                percentage: habitsData.length > 0
                    ? Math.round((completed / habitsData.length) * 100)
                    : 0,
                habits: habitsData.map((habit: any) => ({
                    id: habit.id,
                    name: habit.name,
                    color: habit.color,
                    isPaused: habit.isPaused,
                    completions: habit.completions,
                    currentStreak: habit.currentStreak ?? 0,
                })),
            };
        }, [habitsQuery.data]);

        // Combined loading state
        const isLoading =
            tasksQuery.isLoading ||
            metricsQuery.isLoading ||
            streakQuery.isLoading ||
            objectivesQuery.isLoading ||
            habitsQuery.isLoading ||
            timerQuery.isLoading;

        // Collect errors
        const errors = {
            tasks: tasksQuery.error,
            metrics: metricsQuery.error,
            streak: streakQuery.error,
            objectives: objectivesQuery.error,
            habits: habitsQuery.error,
            timer: timerQuery.error,
        };

        // Refetch all queries
        const refetch = async () => {
            await Promise.all([
                tasksQuery.refetch(),
                metricsQuery.refetch(),
                streakQuery.refetch(),
                objectivesQuery.refetch(),
                habitsQuery.refetch(),
                timerQuery.refetch(),
            ]);
        };

        return {
            stats,
            streak,
            objectives,
            habits,
            todaysTasks,
            allTasks,
            isLoading,
            errors,
            refetch,
        };
    };
}

/**
 * Helper function to determine if a task should be considered "today's task"
 */
function isTaskToday(task: any): boolean {
    const today = new Date();

    // Check if due today
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (isToday(dueDate)) return true;
    }

    // Check if completed today
    if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (isToday(completedDate)) return true;
    }

    // Check if updated today and pending (no due date)
    if (task.status !== 'COMPLETED' && !task.dueDate && task.updatedAt) {
        const updatedDate = new Date(task.updatedAt);
        if (isToday(updatedDate)) return true;
    }

    return false;
}
