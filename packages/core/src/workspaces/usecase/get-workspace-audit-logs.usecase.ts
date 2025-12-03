import { WorkspaceAuditLog } from "../model/workspace-audit-log.entity";
import { WorkspaceAuditLogRepository } from "../provider/workspace-audit-log.repository";

export interface GetWorkspaceAuditLogsInput {
    workspaceId: string;
    limit?: number;
    offset?: number;
}

export interface GetWorkspaceAuditLogsOutput {
    logs: WorkspaceAuditLog[];
    total: number;
}

export class GetWorkspaceAuditLogsUseCase {
    constructor(private readonly auditLogRepository: WorkspaceAuditLogRepository) { }

    async execute(input: GetWorkspaceAuditLogsInput): Promise<GetWorkspaceAuditLogsOutput> {
        const limit = input.limit ?? 50;
        const offset = input.offset ?? 0;

        const [logs, total] = await Promise.all([
            this.auditLogRepository.findByWorkspaceId(input.workspaceId, limit, offset),
            this.auditLogRepository.countByWorkspaceId(input.workspaceId),
        ]);

        return { logs, total };
    }
}
