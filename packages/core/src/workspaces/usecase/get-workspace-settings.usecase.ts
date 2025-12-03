import { WorkspaceSettings } from "../model/workspace-settings.entity";
import { WorkspaceSettingsRepository } from "../provider/workspace-settings.repository";

export interface GetWorkspaceSettingsInput {
    workspaceId: string;
}

export class GetWorkspaceSettingsUseCase {
    constructor(private readonly settingsRepository: WorkspaceSettingsRepository) { }

    async execute(input: GetWorkspaceSettingsInput): Promise<WorkspaceSettings | null> {
        return this.settingsRepository.findByWorkspaceId(input.workspaceId);
    }
}
