import { Entity, EntityProps } from "../../shared/entity";

export type WorkspaceType = "PERSONAL" | "WORK" | "TEAM";
export type WorkspaceTier = "FREE" | "PRO" | "ENTERPRISE";

export interface WorkspaceProps extends EntityProps {
    name: string;
    slug: string;
    description?: string;
    type: WorkspaceType;
    tier: WorkspaceTier;
    color: string;
    icon?: string;
    ownerId?: string;

    // Lifecycle
    isArchived: boolean;
    isDeleted: boolean;
    deletedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;

    // Stats (Read-only)
    stats?: {
        projectCount: number;
        taskCount: number;
        memberCount: number;
    };
}

export class Workspace extends Entity<WorkspaceProps> {
    constructor(props: WorkspaceProps) {
        super({
            ...props,
            tier: props.tier ?? "FREE",
            isArchived: props.isArchived ?? false,
            isDeleted: props.isDeleted ?? false,
            color: props.color ?? "#2563EB",
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceProps, "id" | "createdAt" | "updatedAt" | "isArchived" | "isDeleted" | "deletedAt">): Workspace {
        return new Workspace({
            ...props,
            tier: props.tier ?? "FREE",
            isArchived: false,
            isDeleted: false,
            color: props.color ?? "#2563EB",
        });
    }

    update(props: Partial<Omit<WorkspaceProps, "id" | "ownerId" | "createdAt">>): Workspace {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }

    softDelete(): Workspace {
        return this.clone({
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    restore(): Workspace {
        return this.clone({
            isDeleted: false,
            deletedAt: undefined,
            updatedAt: new Date(),
        });
    }

    archive(): Workspace {
        return this.clone({
            isArchived: true,
            updatedAt: new Date(),
        });
    }

    unarchive(): Workspace {
        return this.clone({
            isArchived: false,
            updatedAt: new Date(),
        });
    }

    setStats(stats: { projectCount: number; taskCount: number; memberCount: number }): Workspace {
        return this.clone({
            stats,
        });
    }
}
