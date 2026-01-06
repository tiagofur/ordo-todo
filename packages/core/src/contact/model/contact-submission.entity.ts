import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for ContactSubmission entity
 */
export interface ContactSubmissionProps extends EntityProps {
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt?: Date;
}

/**
 * ContactSubmission domain entity
 * 
 * Represents a contact form submission from a user.
 */
export class ContactSubmission extends Entity<ContactSubmissionProps> {
    constructor(props: ContactSubmissionProps) {
        super({
            ...props,
            read: props.read ?? false,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    /**
     * Create a new contact submission
     */
    static create(
        props: Omit<ContactSubmissionProps, "id" | "createdAt" | "read">
    ): ContactSubmission {
        return new ContactSubmission({
            ...props,
            read: false,
            createdAt: new Date(),
        });
    }

    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get subject(): string {
        return this.props.subject;
    }

    get message(): string {
        return this.props.message;
    }

    get read(): boolean {
        return this.props.read;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }

    /**
     * Check if submission has been read
     */
    isRead(): boolean {
        return this.props.read;
    }

    /**
     * Mark as read
     */
    markAsRead(): ContactSubmission {
        return this.clone({ read: true });
    }

    /**
     * Mark as unread
     */
    markAsUnread(): ContactSubmission {
        return this.clone({ read: false });
    }
}
