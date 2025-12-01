import { Entity, EntityProps } from "../../shared/entity";

export interface TagProps extends EntityProps {
    name: string;
    color: string;
    workspaceId: string; // Tags are usually per workspace or global? Schema says workspaceId.
    createdAt?: Date;
}

export class Tag extends Entity<TagProps> {
    constructor(props: TagProps) {
        super({
            ...props,
            color: props.color ?? "#6B7280",
            createdAt: props.createdAt ?? new Date(),
        });
    }

    static create(props: Omit<TagProps, "id" | "createdAt">): Tag {
        return new Tag({
            ...props,
        });
    }
}
