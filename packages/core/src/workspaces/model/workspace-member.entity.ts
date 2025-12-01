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
}
