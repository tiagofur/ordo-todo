import { WorkspaceAuditLog, AuditAction } from "../model/workspace-audit-log.entity";
import { WorkspaceAuditLogRepository } from "../provider/workspace-audit-log.repository";

export interface CreateAuditLogInput {
    workspaceId: string;
    actorId?: string;
    action: AuditAction;
    payload?: Record<string, unknown>;
}

export class CreateAuditLogUseCase {
    constructor(private readonly auditLogRepository: WorkspaceAuditLogRepository) { }

    async execute(input: CreateAuditLogInput): Promise<WorkspaceAuditLog> {
        const log = WorkspaceAuditLog.create({
            workspaceId: input.workspaceId,
            actorId: input.actorId,
            action: input.action,
            payload: input.payload,
        });

        return this.auditLogRepository.create(log);
    }
}
