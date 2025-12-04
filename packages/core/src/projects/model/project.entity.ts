import { Entity, EntityProps } from "../../shared/entity";

export interface ProjectProps extends EntityProps {
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
    workspaceId: string;
    workflowId: string;
    position: number;
    archived: boolean;
    completed: boolean;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Project extends Entity<ProjectProps> {
    constructor(props: ProjectProps) {
        super({
            ...props,
            color: props.color ?? "#6B7280",
            position: props.position ?? 0,
            archived: props.archived ?? false,
            completed: props.completed ?? false,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<ProjectProps, "id" | "createdAt" | "updatedAt" | "position" | "archived" | "completed" | "completedAt">): Project {
        return new Project({
            ...props,
            position: 0,
            archived: false,
            completed: false,
        });
    }

    update(props: Partial<Omit<ProjectProps, "id" | "workspaceId" | "createdAt" | "workflowId">>): Project {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }

    archive(): Project {
        return this.clone({
            archived: true,
            updatedAt: new Date(),
        });
    }

    unarchive(): Project {
        return this.clone({
            archived: false,
            updatedAt: new Date(),
        });
    }

    complete(): Project {
        return this.clone({
            completed: true,
            completedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    uncomplete(): Project {
        return this.clone({
            completed: false,
            completedAt: undefined,
            updatedAt: new Date(),
        });
    }
}
