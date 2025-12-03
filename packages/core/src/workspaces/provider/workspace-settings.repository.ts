import { WorkspaceSettings } from "../model/workspace-settings.entity";

export interface WorkspaceSettingsRepository {
    /**
     * Obtiene la configuración de un workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null>;

    /**
     * Crea o actualiza la configuración de un workspace
     */
    upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings>;

    /**
     * Elimina la configuración de un workspace
     */
    delete(workspaceId: string): Promise<void>;
}
