import { Entity, EntityProps } from "../../shared/entity";

export type AuditAction =
    | "WORKSPACE_CREATED"
    | "WORKSPACE_UPDATED"
    | "WORKSPACE_ARCHIVED"
    | "WORKSPACE_UNARCHIVED"
    | "WORKSPACE_DELETED"
    | "MEMBER_INVITED"
    | "MEMBER_JOINED"
    | "MEMBER_REMOVED"
    | "MEMBER_ROLE_CHANGED"
    | "PROJECT_CREATED"
    | "PROJECT_DELETED"
    | "SETTINGS_UPDATED";

export interface WorkspaceAuditLogProps extends EntityProps {
    workspaceId: string;
    actorId?: string; // Usuario que realizó la acción (puede ser null para acciones del sistema)
    action: AuditAction;
    payload?: Record<string, unknown>; // Detalles del cambio
    createdAt?: Date;
}

export class WorkspaceAuditLog extends Entity<WorkspaceAuditLogProps> {
    constructor(props: WorkspaceAuditLogProps) {
        super({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceAuditLogProps, "id" | "createdAt">): WorkspaceAuditLog {
        return new WorkspaceAuditLog(props);
    }
}
