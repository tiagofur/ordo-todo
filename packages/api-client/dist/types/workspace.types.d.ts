/**
 * Workspace-related types and DTOs
 */
export type WorkspaceType = 'PERSONAL' | 'WORK' | 'TEAM';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type ViewType = 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: WorkspaceType;
    color: string;
    icon: string | null;
    ownerId: string | null;
    owner?: {
        id: string;
        username: string | null;
        name: string | null;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
    stats?: {
        projectCount: number;
        taskCount: number;
        memberCount: number;
    };
}
export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: MemberRole;
    joinedAt: Date;
    user?: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}
export interface WorkspaceWithMembers extends Workspace {
    members: WorkspaceMember[];
}
export interface CreateWorkspaceDto {
    name: string;
    slug?: string;
    description?: string;
    type: WorkspaceType;
    color?: string;
    icon?: string;
}
export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
}
export interface AddMemberDto {
    userId: string;
    role: MemberRole;
}
export interface WorkspaceInvitation {
    id: string;
    workspaceId: string;
    email: string;
    role: MemberRole;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
    expiresAt: Date;
    invitedById?: string;
    createdAt: Date;
    /** Token for dev/testing mode when email service is not configured */
    devToken?: string;
}
export interface InviteMemberDto {
    email: string;
    role?: MemberRole;
}
export interface AcceptInvitationDto {
    token: string;
}
/**
 * Workspace settings
 */
export interface WorkspaceSettings {
    id: string;
    workspaceId: string;
    defaultView: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
    defaultDueTime: number;
    timezone: string;
    locale: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateWorkspaceSettingsDto {
    defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
}
/**
 * Workspace audit log
 */
export interface WorkspaceAuditLog {
    id: string;
    workspaceId: string;
    actorId?: string | null;
    action: string;
    payload?: Record<string, unknown> | null;
    createdAt: Date;
    actor?: {
        id: string;
        name: string | null;
        email: string;
    };
}
/**
 * Paginated audit logs response
 */
export interface WorkspaceAuditLogsResponse {
    logs: WorkspaceAuditLog[];
    total: number;
}
//# sourceMappingURL=workspace.types.d.ts.map