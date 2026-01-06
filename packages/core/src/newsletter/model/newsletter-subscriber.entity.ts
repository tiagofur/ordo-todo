import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for NewsletterSubscriber entity
 */
export interface NewsletterSubscriberProps extends EntityProps {
    email: string;
    active: boolean;
    userId?: string;
    createdAt?: Date;
}

/**
 * NewsletterSubscriber domain entity
 * 
 * Represents a subscriber to the newsletter.
 */
export class NewsletterSubscriber extends Entity<NewsletterSubscriberProps> {
    constructor(props: NewsletterSubscriberProps) {
        super({
            ...props,
            active: props.active ?? true,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    /**
     * Create a new newsletter subscriber
     */
    static create(
        props: Omit<NewsletterSubscriberProps, "id" | "createdAt" | "active">
    ): NewsletterSubscriber {
        return new NewsletterSubscriber({
            ...props,
            active: true,
            createdAt: new Date(),
        });
    }

    get email(): string {
        return this.props.email;
    }

    get active(): boolean {
        return this.props.active;
    }

    get userId(): string | undefined {
        return this.props.userId;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }

    /**
     * Check if subscription is active
     */
    isActive(): boolean {
        return this.props.active;
    }

    /**
     * Subscribe (activate)
     */
    subscribe(): NewsletterSubscriber {
        return this.clone({ active: true });
    }

    /**
     * Unsubscribe (deactivate)
     */
    unsubscribe(): NewsletterSubscriber {
        return this.clone({ active: false });
    }

    /**
     * Link to user account
     */
    linkToUser(userId: string): NewsletterSubscriber {
        return this.clone({ userId });
    }

    /**
     * Update email
     */
    updateEmail(email: string): NewsletterSubscriber {
        return this.clone({ email });
    }
}
