import { Entity, EntityProps } from "../../shared/entity";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskProps extends EntityProps {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    projectId: string;
    creatorId: string;
    assigneeId?: string | null;
    parentTaskId?: string;
    subTasks?: Task[];
    estimatedTime?: number;
    tags?: any[]; // Using any[] to avoid circular dependency for now, or import Tag
    project?: { id: string; name: string; color: string }; // Project information for display
    assignee?: { id: string; name: string; image?: string }; // Assignee information for display
    createdAt?: Date;
    updatedAt?: Date;
}

export class Task extends Entity<TaskProps> {
    constructor(props: TaskProps) {
        super({
            ...props,
            status: props.status ?? "TODO",
            priority: props.priority ?? "MEDIUM",
            subTasks: props.subTasks ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<TaskProps, "id" | "createdAt" | "updatedAt" | "status">): Task {
        return new Task({
            ...props,
            status: "TODO",
            priority: props.priority ?? "MEDIUM",
        });
    }

    complete(): Task {
        return this.clone({
            status: "COMPLETED",
            updatedAt: new Date(),
        });
    }

    updateStatus(status: TaskStatus): Task {
        return this.clone({
            status,
            updatedAt: new Date(),
        });
    }

    update(props: Partial<Omit<TaskProps, "id" | "creatorId" | "createdAt">>): Task {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
