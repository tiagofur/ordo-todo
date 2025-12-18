/**
 * OKRs (Objectives and Key Results) types and DTOs
 */
export type OKRPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
export type ObjectiveStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'AT_RISK';
export type MetricType = 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BOOLEAN' | 'TASK_COUNT';
export interface KeyResultTask {
    keyResultId: string;
    taskId: string;
    weight: number;
    task?: {
        id: string;
        title: string;
        status: string;
        priority?: string;
        dueDate?: Date;
        project?: {
            id: string;
            name: string;
        };
    };
}
export interface KeyResult {
    id: string;
    objectiveId: string;
    title: string;
    description: string | null;
    metricType: MetricType;
    startValue: number;
    targetValue: number;
    currentValue: number;
    unit: string | null;
    progress: number;
    linkedTasks?: KeyResultTask[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Objective {
    id: string;
    title: string;
    description: string | null;
    userId: string;
    workspaceId: string | null;
    startDate: Date;
    endDate: Date;
    period: OKRPeriod;
    status: ObjectiveStatus;
    progress: number;
    color: string;
    icon: string | null;
    keyResults?: KeyResult[];
    workspace?: {
        id: string;
        name: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateObjectiveDto {
    title: string;
    description?: string;
    startDate?: string;
    endDate: string;
    period?: OKRPeriod;
    color?: string;
    icon?: string;
    workspaceId?: string;
}
export interface UpdateObjectiveDto {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    period?: OKRPeriod;
    color?: string;
    icon?: string;
    status?: ObjectiveStatus;
    progress?: number;
}
export interface CreateKeyResultDto {
    title: string;
    description?: string;
    metricType?: MetricType;
    startValue?: number;
    targetValue: number;
    currentValue?: number;
    unit?: string;
}
export interface UpdateKeyResultDto {
    title?: string;
    description?: string;
    metricType?: MetricType;
    startValue?: number;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
}
export interface LinkTaskDto {
    taskId: string;
    weight?: number;
}
export interface ObjectiveDashboardSummary {
    total: number;
    completed: number;
    atRisk: number;
    averageProgress: number;
    objectives: Array<{
        id: string;
        title: string;
        progress: number;
        status: ObjectiveStatus;
        color: string;
        daysRemaining: number;
        keyResultsCount: number;
    }>;
}
//# sourceMappingURL=objective.types.d.ts.map