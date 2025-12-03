import { WorkspaceSettings, ViewType } from "../model/workspace-settings.entity";
import { WorkspaceSettingsRepository } from "../provider/workspace-settings.repository";

export interface UpdateWorkspaceSettingsInput {
    workspaceId: string;
    defaultView?: ViewType;
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
}

export class UpdateWorkspaceSettingsUseCase {
    constructor(private readonly settingsRepository: WorkspaceSettingsRepository) { }

    async execute(input: UpdateWorkspaceSettingsInput): Promise<WorkspaceSettings> {
        // Buscar configuración existente
        const existing = await this.settingsRepository.findByWorkspaceId(input.workspaceId);

        let settings: WorkspaceSettings;

        if (existing) {
            // Actualizar configuración existente
            settings = existing.update({
                defaultView: input.defaultView,
                defaultDueTime: input.defaultDueTime,
                timezone: input.timezone,
                locale: input.locale,
            });
        } else {
            // Crear nueva configuración
            settings = WorkspaceSettings.create({
                workspaceId: input.workspaceId,
                defaultView: input.defaultView,
                defaultDueTime: input.defaultDueTime,
                timezone: input.timezone,
                locale: input.locale,
            });
        }

        return this.settingsRepository.upsert(settings);
    }
}
