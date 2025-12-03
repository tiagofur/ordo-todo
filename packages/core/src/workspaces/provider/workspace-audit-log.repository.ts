import { WorkspaceAuditLog } from "../model/workspace-audit-log.entity";

export interface WorkspaceAuditLogRepository {
    /**
     * Crea un nuevo registro de auditoría
     */
    create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog>;

    /**
     * Obtiene los logs de auditoría de un workspace
     * @param workspaceId ID del workspace
     * @param limit Número máximo de registros a retornar
     * @param offset Offset para paginación
     */
    findByWorkspaceId(
        workspaceId: string,
        limit?: number,
        offset?: number
    ): Promise<WorkspaceAuditLog[]>;

    /**
     * Cuenta el total de logs de un workspace
     */
    countByWorkspaceId(workspaceId: string): Promise<number>;
}
