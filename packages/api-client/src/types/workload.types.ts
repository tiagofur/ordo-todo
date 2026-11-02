/**
 * Workload management types.
 *
 * Mirrors the backend core model (`TeamWorkloadSummary` /
 * `MemberWorkload` / `WorkloadSuggestion` in `@ordo-todo/core`): these are
 * the shapes the API actually returns.
 */

export interface MemberWorkload {
    userId: string;
    userName: string;
    userEmail: string;
    avatarUrl?: string;
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    hoursWorkedThisWeek: number;
    avgHoursPerDay: number;
    workloadScore: number;
    workloadLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'OVERLOADED';
    capacityRemaining: number;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    currentTask?: {
        id: string;
        title: string;
        startedAt?: Date;
    };
}

export interface WorkspaceWorkload {
    workspaceId: string;
    workspaceName: string;
    totalMembers: number;
    totalTasks: number;
    totalCompleted: number;
    totalOverdue: number;
    averageWorkload: number;
    membersOverloaded: number;
    membersUnderutilized: number;
    membersBalanced: number;
    redistributionSuggestions: Array<{
        fromUserId: string;
        fromUserName: string;
        toUserId: string;
        toUserName: string;
        taskCount: number;
        reason: string;
    }>;
    members: MemberWorkload[];
}

export type WorkloadSuggestionType =
    | 'REDISTRIBUTE'
    | 'DELEGATE'
    | 'DEFER'
    | 'PRIORITIZE';

export interface WorkloadSuggestion {
    type: WorkloadSuggestionType;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    affectedUsers: string[];
    taskIds?: string[];
    action: {
        type: string;
        data: any;
    };
}
