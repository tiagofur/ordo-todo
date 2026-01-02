/**
 * Workload management types
 */

export interface WorkspaceWorkload {
    workspaceId: string;
    workspaceName: string;
    totalTasks: number;
    completedTasks: number;
    totalHoursEstimated: number;
    totalHoursCompleted: number;
    averagePerMember: number;
    memberCount: number;
    distribution: MemberWorkload[];
    overloadedMembers: string[];
    underutilizedMembers: string[];
}

export interface MemberWorkload {
    userId: string;
    userName: string;
    userImage?: string | null;
    tasksAssigned: number;
    tasksCompleted: number;
    hoursEstimated: number;
    hoursCompleted: number;
    overdueTasks: number;
    upcomingDeadlines: number;
    workloadPercentage: number;
    status: 'UNDERLOADED' | 'OPTIMAL' | 'HEAVY' | 'OVERLOADED';
}

export type WorkloadSuggestionType =
    | 'REDISTRIBUTE'
    | 'DEADLINE_EXTENSION'
    | 'ASSIGN_MORE'
    | 'REDUCE_SCOPE'
    | 'ADD_HELP';

export interface WorkloadSuggestion {
    type: WorkloadSuggestionType;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    fromUserId?: string;
    fromUserName?: string;
    toUserId?: string;
    toUserName?: string;
    taskId?: string;
    taskTitle?: string;
    reason: string;
    estimatedImpact: string;
}
