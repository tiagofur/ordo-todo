import { ChangelogEntry, ChangelogEntryProps } from "../model/changelog-entry.entity";

/**
 * Repository interface for ChangelogEntry persistence operations.
 */
export interface IChangelogRepository {
    /**
     * Find a changelog entry by ID
     */
    findById(id: string): Promise<ChangelogEntry | null>;

    /**
     * Find all changelog entries with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        orderBy?: "publishedAt" | "createdAt";
        order?: "asc" | "desc";
    }): Promise<ChangelogEntry[]>;

    /**
     * Get the latest published release
     */
    findLatest(): Promise<ChangelogEntry | null>;

    /**
     * Create a new changelog entry
     */
    create(entry: ChangelogEntry): Promise<ChangelogEntry>;

    /**
     * Update an existing changelog entry
     */
    update(id: string, data: Partial<ChangelogEntryProps>): Promise<ChangelogEntry>;

    /**
     * Delete a changelog entry
     */
    delete(id: string): Promise<void>;
}
