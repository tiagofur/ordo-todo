import { Entity, EntityProps } from "../../shared/entity";

/**
 * Type of changelog entry
 */
export type ChangelogType = "NEW" | "IMPROVED" | "FIXED" | "REMOVED";

/**
 * Props for ChangelogEntry entity
 */
export interface ChangelogEntryProps extends EntityProps {
    version?: string;
    title: string;
    content: string;
    type: ChangelogType;
    publishedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * ChangelogEntry domain entity
 * 
 * Represents a changelog entry for the application's release notes.
 */
export class ChangelogEntry extends Entity<ChangelogEntryProps> {
    constructor(props: ChangelogEntryProps) {
        super({
            ...props,
            type: props.type ?? "NEW",
            publishedAt: props.publishedAt ?? new Date(),
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new changelog entry
     */
    static create(
        props: Omit<ChangelogEntryProps, "id" | "createdAt" | "updatedAt">
    ): ChangelogEntry {
        return new ChangelogEntry({
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get version(): string | undefined {
        return this.props.version;
    }

    get title(): string {
        return this.props.title;
    }

    get content(): string {
        return this.props.content;
    }

    get type(): ChangelogType {
        return this.props.type;
    }

    get publishedAt(): Date {
        return this.props.publishedAt;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }

    get updatedAt(): Date {
        return this.props.updatedAt!;
    }

    /**
     * Check if entry is published
     */
    isPublished(): boolean {
        return this.props.publishedAt <= new Date();
    }

    /**
     * Check if entry is a new feature
     */
    isNewFeature(): boolean {
        return this.props.type === "NEW";
    }

    /**
     * Check if entry is a fix
     */
    isFix(): boolean {
        return this.props.type === "FIXED";
    }

    /**
     * Update changelog entry
     */
    update(
        props: Partial<Omit<ChangelogEntryProps, "id" | "createdAt">>
    ): ChangelogEntry {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }

    /**
     * Publish the entry
     */
    publish(): ChangelogEntry {
        return this.clone({
            publishedAt: new Date(),
            updatedAt: new Date(),
        });
    }
}
