import { NewsletterSubscriber, NewsletterSubscriberProps } from "../model/newsletter-subscriber.entity";

/**
 * Repository interface for NewsletterSubscriber persistence operations.
 */
export interface INewsletterRepository {
    /**
     * Find a subscriber by email
     */
    findByEmail(email: string): Promise<NewsletterSubscriber | null>;

    /**
     * Find a subscriber by user ID
     */
    findByUserId(userId: string): Promise<NewsletterSubscriber | null>;

    /**
     * Find all subscribers with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        activeOnly?: boolean;
    }): Promise<NewsletterSubscriber[]>;

    /**
     * Create a new subscriber
     */
    create(subscriber: NewsletterSubscriber): Promise<NewsletterSubscriber>;

    /**
     * Update an existing subscriber
     */
    update(id: string, data: Partial<NewsletterSubscriberProps>): Promise<NewsletterSubscriber>;

    /**
     * Delete a subscriber
     */
    delete(id: string): Promise<void>;
}
