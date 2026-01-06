import { ContactSubmission, ContactSubmissionProps } from "../model/contact-submission.entity";

/**
 * Repository interface for ContactSubmission persistence operations.
 */
export interface IContactRepository {
    /**
     * Find a submission by ID
     */
    findById(id: string): Promise<ContactSubmission | null>;

    /**
     * Find all submissions with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        unreadOnly?: boolean;
    }): Promise<ContactSubmission[]>;

    /**
     * Create a new submission
     */
    create(submission: ContactSubmission): Promise<ContactSubmission>;

    /**
     * Update an existing submission
     */
    update(id: string, data: Partial<ContactSubmissionProps>): Promise<ContactSubmission>;

    /**
     * Delete a submission
     */
    delete(id: string): Promise<void>;
}
