export interface MemberWorkload {
    userId: string;
    userName: string;
    userEmail: string;
    avatarUrl?: string;

    // Task metrics
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;

    // Time metrics
    hoursWorkedThisWeek: number;
    avgHoursPerDay: number;

    // Workload indicators
    workloadScore: number; // 0-100 (higher = more loaded)
    workloadLevel: "LOW" | "MODERATE" | "HIGH" | "OVERLOADED";
    capacityRemaining: number; // estimated hours available

    // Trends
    trend: "INCREASING" | "STABLE" | "DECREASING";

    // Current focus
    currentTask?: {
        id: string;
        title: string;
        startedAt?: Date;
    };
}

/**
 * Balance gauge (0-100, higher = healthier) derived from the backend load
 * average. The API sends no balance score: `averageWorkload` is a 0-100
 * load average (higher = more loaded), so balance is its inverse.
 */
export function calculateBalanceScore(averageWorkload: number): number {
    return Math.min(100, Math.max(0, Math.round(100 - averageWorkload)));
}

export interface TeamWorkloadSummary {
    workspaceId: string;
    workspaceName: string;
    totalMembers: number;

    // Aggregate metrics
    totalTasks: number;
    totalCompleted: number;
    totalOverdue: number;
    averageWorkload: number;

    // Distribution
    membersOverloaded: number;
    membersUnderutilized: number;
    membersBalanced: number;

    // Recommendations
    redistributionSuggestions: Array<{
        fromUserId: string;
        fromUserName: string;
        toUserId: string;
        toUserName: string;
        taskCount: number;
        reason: string;
    }>;

    // Members list
    members: MemberWorkload[];
}

export interface WorkloadSuggestion {
    type: "REDISTRIBUTE" | "DELEGATE" | "DEFER" | "PRIORITIZE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    description: string;
    affectedUsers: string[];
    taskIds?: string[];
    action: {
        type: string;
        data: any;
    };
}
