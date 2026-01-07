import { MemberWorkload, TeamWorkloadSummary, WorkloadSuggestion } from "../model";

export interface ICollaborationRepository {
    getWorkspaceWorkload(workspaceId: string): Promise<TeamWorkloadSummary>;
    getMemberWorkload(userId: string, workspaceId?: string): Promise<MemberWorkload>;
    getBalancingSuggestions(workspaceId: string): Promise<WorkloadSuggestion[]>;
}
