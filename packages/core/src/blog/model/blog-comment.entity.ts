import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for BlogComment entity
 */
export interface BlogCommentProps extends EntityProps {
    content: string;
    userId: string;
    postId: string;
    createdAt?: Date;
}

/**
 * BlogComment domain entity
 */
export class BlogComment extends Entity<BlogCommentProps> {
    constructor(props: BlogCommentProps) {
        super({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    /**
     * Create a new blog comment
     */
    static create(
        props: Omit<BlogCommentProps, "id" | "createdAt">
    ): BlogComment {
        return new BlogComment({
            ...props,
            createdAt: new Date(),
        });
    }

    get content(): string {
        return this.props.content;
    }

    get userId(): string {
        return this.props.userId;
    }

    get postId(): string {
        return this.props.postId;
    }
}
