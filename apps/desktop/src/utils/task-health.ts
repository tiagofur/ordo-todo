/**
 * Task Health Scoring System
 * Calculates the health status of a task based on multiple factors
 */

export type HealthStatus = 'healthy' | 'at-risk' | 'critical';

export interface TaskHealthFactor {
    name: string;
    weight: number; // 0-1
    isMet: boolean;
    description: string;
}

export interface TaskHealth {
    score: number; // 0-100
    status: HealthStatus;
    factors: TaskHealthFactor[];
    recommendation: string;
}

interface TaskHealthInput {
    dueDate?: Date | string | null;
    assigneeId?: string | null;
    estimatedMinutes?: number | null;
    description?: string | null;
    status: string;
    commentsCount?: number;
    lastActivityAt?: Date | string | null;
    subtasksCount?: number;
    completedSubtasksCount?: number;
}

/**
 * Calculate the health score and status of a task
 */
export function calculateTaskHealth(task: TaskHealthInput): TaskHealth {
    const factors: TaskHealthFactor[] = [];
    let totalWeight = 0;
    let achievedWeight = 0;

    // Factor 1: Has due date and not overdue (weight: 0.25)
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && task.status !== 'COMPLETED';
    const hasDueDate = !!dueDate;

    factors.push({
        name: 'Due Date',
        weight: 0.25,
        isMet: hasDueDate && !isOverdue,
        description: isOverdue
            ? 'Task is overdue'
            : !hasDueDate
                ? 'No due date set'
                : 'Due date is set and not overdue',
    });
    totalWeight += 0.25;
    if (hasDueDate && !isOverdue) achievedWeight += 0.25;

    // Factor 2: Has assignee (weight: 0.2)
    const hasAssignee = !!task.assigneeId;
    factors.push({
        name: 'Assignee',
        weight: 0.2,
        isMet: hasAssignee,
        description: hasAssignee ? 'Task is assigned' : 'No assignee assigned',
    });
    totalWeight += 0.2;
    if (hasAssignee) achievedWeight += 0.2;

    // Factor 3: Has estimate (weight: 0.15)
    const hasEstimate = !!task.estimatedMinutes && task.estimatedMinutes > 0;
    factors.push({
        name: 'Estimate',
        weight: 0.15,
        isMet: hasEstimate,
        description: hasEstimate
            ? 'Time estimate provided'
            : 'No time estimate set',
    });
    totalWeight += 0.15;
    if (hasEstimate) achievedWeight += 0.15;

    // Factor 4: Has description (weight: 0.1)
    const hasDescription =
        !!task.description && task.description.trim().length > 0;
    factors.push({
        name: 'Description',
        weight: 0.1,
        isMet: hasDescription,
        description: hasDescription
            ? 'Task has description'
            : 'No description provided',
    });
    totalWeight += 0.1;
    if (hasDescription) achievedWeight += 0.1;

    // Factor 5: Recent activity (weight: 0.15)
    const lastActivity = task.lastActivityAt
        ? new Date(task.lastActivityAt)
        : null;
    const daysSinceActivity = lastActivity
        ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
    const hasRecentActivity = daysSinceActivity < 7;
    factors.push({
        name: 'Activity',
        weight: 0.15,
        isMet: hasRecentActivity,
        description:
            daysSinceActivity === 999
                ? 'No activity recorded'
                : daysSinceActivity < 7
                    ? 'Recent activity'
                    : `No activity for ${daysSinceActivity} days`,
    });
    totalWeight += 0.15;
    if (hasRecentActivity) achievedWeight += 0.15;

    // Factor 6: Subtasks progress (weight: 0.15)
    const hasSubtasks = (task.subtasksCount ?? 0) > 0;
    const subtasksProgress = hasSubtasks
        ? (task.completedSubtasksCount ?? 0) / (task.subtasksCount ?? 1)
        : 1; // If no subtasks, consider it complete
    const goodSubtaskProgress = subtasksProgress >= 0.5 || !hasSubtasks;
    factors.push({
        name: 'Subtasks',
        weight: 0.15,
        isMet: goodSubtaskProgress,
        description: hasSubtasks
            ? `${task.completedSubtasksCount}/${task.subtasksCount} subtasks completed`
            : 'No subtasks',
    });
    totalWeight += 0.15;
    if (goodSubtaskProgress) achievedWeight += 0.15;

    // Calculate final score (0-100)
    const score = Math.round((achievedWeight / totalWeight) * 100);

    // Determine status
    let status: HealthStatus;
    if (isOverdue) {
        status = 'critical'; // Overdue tasks are always critical
    } else if (score >= 70) {
        status = 'healthy';
    } else if (score >= 40) {
        status = 'at-risk';
    } else {
        status = 'critical';
    }

    // Generate recommendation
    const recommendation = generateRecommendation(factors, status, !!isOverdue);

    return {
        score,
        status,
        factors,
        recommendation,
    };
}

function generateRecommendation(
    factors: TaskHealthFactor[],
    status: HealthStatus,
    isOverdue: boolean
): string {
    if (status === 'healthy') {
        return 'Task is in good shape! Keep up the good work.';
    }

    const unmetFactors = factors.filter((f) => !f.isMet);

    if (isOverdue) {
        return 'This task is overdue. Consider rescheduling or completing it soon.';
    }

    if (unmetFactors.length === 0) {
        return 'All factors are met. Great job!';
    }

    // Prioritize recommendations
    const recommendations: string[] = [];

    if (unmetFactors.find((f) => f.name === 'Due Date')) {
        recommendations.push('Set a due date');
    }
    if (unmetFactors.find((f) => f.name === 'Assignee')) {
        recommendations.push('Assign to someone');
    }
    if (unmetFactors.find((f) => f.name === 'Estimate')) {
        recommendations.push('Add time estimate');
    }
    if (unmetFactors.find((f) => f.name === 'Description')) {
        recommendations.push('Add description');
    }
    if (unmetFactors.find((f) => f.name === 'Activity')) {
        recommendations.push('Update or add comments');
    }
    if (unmetFactors.find((f) => f.name === 'Subtasks')) {
        recommendations.push('Complete subtasks');
    }

    if (recommendations.length === 1) {
        return `Recommendation: ${recommendations[0]}.`;
    } else if (recommendations.length === 2) {
        return `Recommendations: ${recommendations[0]} and ${recommendations[1]}.`;
    } else {
        return `Recommendations: ${recommendations.slice(0, -1).join(', ')}, and ${recommendations[recommendations.length - 1]}.`;
    }
}

/**
 * Get health status color for UI
 */
export function getHealthColor(status: HealthStatus): string {
    switch (status) {
        case 'healthy':
            return 'text-green-500';
        case 'at-risk':
            return 'text-yellow-500';
        case 'critical':
            return 'text-red-500';
    }
}

/**
 * Get health status icon
 */
export function getHealthIcon(status: HealthStatus): string {
    switch (status) {
        case 'healthy':
            return '🟢';
        case 'at-risk':
            return '🟡';
        case 'critical':
            return '🔴';
    }
}

/**
 * Get health status label
 */
export function getHealthLabel(status: HealthStatus): string {
    switch (status) {
        case 'healthy':
            return 'Healthy';
        case 'at-risk':
            return 'At Risk';
        case 'critical':
            return 'Critical';
    }
}
