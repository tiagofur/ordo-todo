import { Entity, EntityProps } from "../../shared/entity";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceMemberProps extends EntityProps {
    workspaceId: string;
    userId: string;
    role: MemberRole;
    joinedAt: Date;
}

export class WorkspaceMember extends Entity<WorkspaceMemberProps> {
    constructor(props: WorkspaceMemberProps) {
        super({
            ...props,
            joinedAt: props.joinedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceMemberProps, "id" | "joinedAt">): WorkspaceMember {
        return new WorkspaceMember({
            ...props,
            joinedAt: new Date(),
        });
    }

    // ===== Business Methods =====

    /**
     * Check if member is owner
     */
    isOwner(): boolean {
        return this.props.role === "OWNER";
    }

    /**
     * Check if member is admin
     */
    isAdmin(): boolean {
        return this.props.role === "ADMIN";
    }

    /**
     * Check if member is regular member
     */
    isMember(): boolean {
        return this.props.role === "MEMBER";
    }

    /**
     * Check if member is viewer (read-only)
     */
    isViewer(): boolean {
        return this.props.role === "VIEWER";
    }

    /**
     * Check if member has admin-level permissions (OWNER or ADMIN)
     */
    hasAdminPermissions(): boolean {
        return ["OWNER", "ADMIN"].includes(this.props.role);
    }

    /**
     * Check if member can manage workspace settings
     */
    canManageWorkspace(): boolean {
        return this.hasAdminPermissions();
    }

    /**
     * Check if member can invite other members
     */
    canInviteMembers(): boolean {
        return this.hasAdminPermissions();
    }

    /**
     * Check if member can remove other members
     */
    canRemoveMembers(): boolean {
        return this.props.role === "OWNER";
    }

    /**
     * Check if member can change roles
     */
    canChangeRoles(): boolean {
        return this.props.role === "OWNER";
    }

    /**
     * Check if member can create/edit/delete tasks
     */
    canManageTasks(): boolean {
        return ["OWNER", "ADMIN", "MEMBER"].includes(this.props.role);
    }

    /**
     * Check if member can only view (no edit permissions)
     */
    isReadOnly(): boolean {
        return this.props.role === "VIEWER";
    }

    /**
     * Get role level for hierarchy comparison
     */
    getRoleLevel(): number {
        const roleHierarchy: Record<MemberRole, number> = {
            "VIEWER": 0,
            "MEMBER": 1,
            "ADMIN": 2,
            "OWNER": 3,
        };

        return roleHierarchy[this.props.role];
    }

    /**
     * Check if this member has higher role than another member
     */
    hasHigherRoleThan(otherMember: WorkspaceMember): boolean {
        return this.getRoleLevel() > otherMember.getRoleLevel();
    }

    /**
     * Check if this member can manage another member
     */
    canManageMember(otherMember: WorkspaceMember): boolean {
        // Can only manage members with lower role level
        // And only OWNER can manage ADMINs
        if (this.props.role !== "OWNER" && otherMember.isAdmin()) {
            return false;
        }

        return this.hasHigherRoleThan(otherMember);
    }
}
