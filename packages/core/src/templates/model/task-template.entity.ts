import { Entity, EntityProps } from "../../shared/entity";
import { TaskPriority } from "../../tasks/model/task.entity";


/**
 * Props for TaskTemplate entity
 */
export interface TaskTemplateProps extends EntityProps {
    name: string;
    description?: string;
    icon?: string;
    titlePattern?: string;
    defaultPriority: TaskPriority;
    defaultEstimatedMinutes?: number;
    defaultDescription?: string;
    defaultTags?: string[];
    workspaceId: string;
    isPublic: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * TaskTemplate domain entity
 */
export class TaskTemplate extends Entity<TaskTemplateProps> {
    constructor(props: TaskTemplateProps) {
        super({
            ...props,
            isPublic: props.isPublic ?? true,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new task template
     */
    static create(
        props: Omit<TaskTemplateProps, "id" | "createdAt" | "updatedAt">
    ): TaskTemplate {
        return new TaskTemplate({
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string | undefined {
        return this.props.description;
    }

    get workspaceId(): string {
        return this.props.workspaceId;
    }

    get isPublic(): boolean {
        return this.props.isPublic;
    }

    /**
     * Update template details
     */
    update(props: Partial<Omit<TaskTemplateProps, "id" | "workspaceId" | "createdAt" | "updatedAt">>): TaskTemplate {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
