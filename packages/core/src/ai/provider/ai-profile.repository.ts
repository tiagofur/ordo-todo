import { AIProfile } from "../model/ai-profile.entity";

export interface AIProfileRepository {
    /**
     * Find AI profile by user ID
     */
    findByUserId(userId: string): Promise<AIProfile | null>;

    /**
     * Find or create AI profile for a user
     * If profile doesn't exist, creates a new one with default values
     */
    findOrCreate(userId: string): Promise<AIProfile>;

    /**
     * Save (create or update) an AI profile
     */
    save(profile: AIProfile): Promise<AIProfile>;

    /**
     * Update an existing AI profile
     */
    update(profile: AIProfile): Promise<AIProfile>;

    /**
     * Delete an AI profile by ID
     */
    delete(id: string): Promise<void>;
}
