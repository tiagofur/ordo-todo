import { InviteFormValues } from "./invite-member-dialog.js";
export interface WorkspaceMember {
    id: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
    joinedAt: string;
    user?: {
        name?: string;
        email?: string;
        image?: string;
    };
}
export interface WorkspaceInvitation {
    id: string;
    email: string;
    role: "ADMIN" | "MEMBER" | "VIEWER";
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    createdAt: string;
}
export interface WorkspaceMembersSettingsLabels {
    loading?: string;
    membersTitle?: string;
    membersDescription?: string;
    inviteMember?: string;
    user?: string;
    role?: string;
    joined?: string;
    email?: string;
    status?: string;
    sent?: string;
    remove?: string;
    confirmRemove?: string;
    invitationsTitle?: string;
    invitationsDescription?: string;
    unknownUser?: string;
    roles?: {
        owner?: string;
        admin?: string;
        member?: string;
        viewer?: string;
    };
    inviteDialog?: {
        title?: string;
        description?: string;
        emailLabel?: string;
        roleLabel?: string;
        cancel?: string;
        invite?: string;
        copied?: string;
        done?: string;
    };
}
export interface WorkspaceMembersSettingsProps {
    members?: WorkspaceMember[];
    invitations?: WorkspaceInvitation[];
    isLoading?: boolean;
    onInviteMember: (data: InviteFormValues) => Promise<{
        devToken?: string;
    } | void>;
    onRemoveMember: (userId: string) => Promise<void>;
    onDeleteInvitation?: (invitationId: string) => Promise<void>;
    isInvitePending?: boolean;
    isRemovePending?: boolean;
    labels?: WorkspaceMembersSettingsLabels;
    baseUrl?: string;
    onInviteCopied?: () => void;
}
export declare function WorkspaceMembersSettings({ members, invitations, isLoading, onInviteMember, onRemoveMember, onDeleteInvitation, isInvitePending, labels, baseUrl, onInviteCopied, }: WorkspaceMembersSettingsProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=workspace-members-settings.d.ts.map