import { Entity, EntityProps } from "../../shared/entity";
import { MemberRole } from "./member-role.enum";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface WorkspaceInvitationProps extends EntityProps {
    workspaceId: string;
    email: string;
    tokenHash: string;
    role: MemberRole;
    status: InviteStatus;
    invitedById?: string;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class WorkspaceInvitation extends Entity<WorkspaceInvitationProps> {
    constructor(props: WorkspaceInvitationProps) {
        super({
            ...props,
            status: props.status ?? "PENDING",
            role: props.role ?? MemberRole.MEMBER,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceInvitationProps, "id" | "createdAt" | "updatedAt" | "status" | "acceptedAt">): WorkspaceInvitation {
        return new WorkspaceInvitation({
            ...props,
            status: "PENDING",
        });
    }

    accept(): WorkspaceInvitation {
        return this.clone({
            status: "ACCEPTED",
            acceptedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    cancel(): WorkspaceInvitation {
        return this.clone({
            status: "CANCELLED",
            updatedAt: new Date(),
        });
    }

    isExpired(): boolean {
        return this.props.expiresAt < new Date();
    }
}
