/**
 * Calculation utility functions
 * Used across all applications for consistent business logic calculations
 */

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100 * 10) / 10; // One decimal place
}

/**
 * Calculate productivity score (0-100)
 * Based on completed tasks, time worked, and focus time
 */
export function calculateProductivityScore(
    completedTasks: number,
    totalTasks: number,
    focusMinutes: number,
    targetFocusMinutes: number = 240 // 4 hours default
): number {
    if (totalTasks === 0 && focusMinutes === 0) return 0;

    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 0;
    const focusScore = Math.min((focusMinutes / targetFocusMinutes) * 50, 50);

    return Math.round(taskScore + focusScore);
}

/**
 * Calculate focus score based on pomodoros completed
 */
export function calculateFocusScore(
    completedPomodoros: number,
    targetPomodoros: number = 8
): number {
    if (targetPomodoros === 0) return 0;
    return Math.min(Math.round((completedPomodoros / targetPomodoros) * 100), 100);
}

/**
 * Calculate average completion time
 */
export function calculateAverageCompletionTime(
    tasks: Array<{ createdAt: Date | string; completedAt?: Date | string | null }>
): number {
    const completedTasks = tasks.filter((t) => t.completedAt != null);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
        if (!task.completedAt) return sum; // Extra safety check
        const created = typeof task.createdAt === "string" ? new Date(task.createdAt) : task.createdAt;
        const completed = typeof task.completedAt === "string" ? new Date(task.completedAt) : task.completedAt;
        return sum + (completed.getTime() - created.getTime());
    }, 0);

    return Math.round(totalTime / completedTasks.length / (1000 * 60)); // Convert to minutes
}

/**
 * Calculate velocity (tasks completed per day)
 */
export function calculateVelocity(
    completedTasks: number,
    days: number
): number {
    if (days === 0) return 0;
    return Math.round((completedTasks / days) * 10) / 10; // One decimal place
}

/**
 * Calculate estimated completion date based on velocity
 */
export function calculateEstimatedCompletion(
    remainingTasks: number,
    velocity: number
): Date | null {
    if (velocity === 0) return null;
    const daysNeeded = Math.ceil(remainingTasks / velocity);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    return completionDate;
}

/**
 * Calculate burndown rate
 */
export function calculateBurndownRate(
    initialTasks: number,
    remainingTasks: number,
    elapsedDays: number
): number {
    if (elapsedDays === 0) return 0;
    const completedTasks = initialTasks - remainingTasks;
    return Math.round((completedTasks / elapsedDays) * 10) / 10;
}

/**
 * Calculate project health score (0-100)
 * Based on progress, overdue tasks, and velocity
 */
export function calculateProjectHealth(
    completedTasks: number,
    totalTasks: number,
    overdueTasks: number,
    velocity: number,
    targetVelocity: number = 2
): number {
    if (totalTasks === 0) return 100;

    const progressScore = (completedTasks / totalTasks) * 40;
    const overdueScore = Math.max(0, 30 - (overdueTasks / totalTasks) * 30);
    const velocityScore = Math.min((velocity / targetVelocity) * 30, 30);

    return Math.round(progressScore + overdueScore + velocityScore);
}

/**
 * Calculate time utilization percentage
 */
export function calculateTimeUtilization(
    actualMinutes: number,
    estimatedMinutes: number
): number {
    if (estimatedMinutes === 0) return 0;
    return Math.round((actualMinutes / estimatedMinutes) * 100);
}

/**
 * Calculate efficiency score
 */
export function calculateEfficiency(
    completedTasks: number,
    totalMinutesWorked: number
): number {
    if (totalMinutesWorked === 0) return 0;
    const tasksPerHour = (completedTasks / totalMinutesWorked) * 60;
    return Math.round(tasksPerHour * 100) / 100;
}

/**
 * Calculate streak (consecutive days with activity)
 */
export function calculateStreak(
    activityDates: Array<Date | string>
): number {
    if (activityDates.length === 0) return 0;

    const sortedDates = activityDates
        .map((d) => typeof d === "string" ? new Date(d) : d)
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent activity was today or yesterday
    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0; // Streak broken

    for (let i = 1; i < sortedDates.length; i++) {
        const current = new Date(sortedDates[i]);
        current.setHours(0, 0, 0, 0);
        const previous = new Date(sortedDates[i - 1]);
        previous.setHours(0, 0, 0, 0);

        const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(value: number, values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex((v) => v >= value);
    if (index === -1) return 100;
    return Math.round((index / sorted.length) * 100);
}

/**
 * Calculate weighted average
 */
export function calculateWeightedAverage(
    values: Array<{ value: number; weight: number }>
): number {
    if (values.length === 0) return 0;
    const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = values.reduce((sum, item) => sum + item.value * item.weight, 0);
    return Math.round((weightedSum / totalWeight) * 100) / 100;
}
