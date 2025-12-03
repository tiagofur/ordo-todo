import { WorkspaceInvitation } from "../model/workspace-invitation.entity";

export interface WorkspaceInvitationRepository {
    create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    findById(id: string): Promise<WorkspaceInvitation | null>;
    findByToken(tokenHash: string): Promise<WorkspaceInvitation | null>;
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
    findByEmail(email: string): Promise<WorkspaceInvitation[]>;
    update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    delete(id: string): Promise<void>;
}
