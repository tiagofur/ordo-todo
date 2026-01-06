import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for BlogPost entity
 */
export interface BlogPostProps extends EntityProps {
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    published: boolean;
    publishedAt?: Date;
    metaTitle?: string;
    metaDescription?: string;
    author?: string;
    category?: string;
    tags: string[];
    readTime?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * BlogPost domain entity
 */
export class BlogPost extends Entity<BlogPostProps> {
    constructor(props: BlogPostProps) {
        super({
            ...props,
            published: props.published ?? false,
            tags: props.tags ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new blog post
     */
    static create(
        props: Omit<BlogPostProps, "id" | "createdAt" | "updatedAt" | "published" | "publishedAt">
    ): BlogPost {
        return new BlogPost({
            ...props,
            published: false,
            tags: props.tags ?? [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get slug(): string {
        return this.props.slug;
    }

    get title(): string {
        return this.props.title;
    }

    get content(): string {
        return this.props.content;
    }

    get published(): boolean {
        return this.props.published;
    }

    /**
     * Publish the post
     */
    publish(): BlogPost {
        return this.clone({
            published: true,
            publishedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * Unpublish the post
     */
    unpublish(): BlogPost {
        return this.clone({
            published: false,
            updatedAt: new Date(),
        });
    }
}
