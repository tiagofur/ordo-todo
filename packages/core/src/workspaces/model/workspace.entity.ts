import { Entity, EntityProps } from "../../shared/entity";

export type WorkspaceType = "PERSONAL" | "WORK" | "TEAM";

export interface WorkspaceProps extends EntityProps {
    name: string;
    description?: string;
    type: WorkspaceType;
    color: string;
    icon?: string;
    ownerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Workspace extends Entity<WorkspaceProps> {
    constructor(props: WorkspaceProps) {
        super({
            ...props,
            color: props.color ?? "#2563EB",
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkspaceProps, "id" | "createdAt" | "updatedAt">): Workspace {
        return new Workspace({
            ...props,
            color: props.color ?? "#2563EB",
        });
    }

    update(props: Partial<Omit<WorkspaceProps, "id" | "ownerId" | "createdAt">>): Workspace {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
