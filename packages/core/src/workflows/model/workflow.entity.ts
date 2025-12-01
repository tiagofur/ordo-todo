import { Entity, EntityProps } from "../../shared/entity";

export interface WorkflowProps extends EntityProps {
    name: string;
    description?: string;
    color: string;
    icon?: string;
    workspaceId: string;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Workflow extends Entity<WorkflowProps> {
    constructor(props: WorkflowProps) {
        super({
            ...props,
            color: props.color ?? "#6B7280",
            position: props.position ?? 0,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<WorkflowProps, "id" | "createdAt" | "updatedAt" | "position">): Workflow {
        return new Workflow({
            ...props,
            position: 0,
        });
    }

    update(props: Partial<Omit<WorkflowProps, "id" | "workspaceId" | "createdAt">>): Workflow {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
