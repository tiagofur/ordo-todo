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
