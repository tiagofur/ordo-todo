import { AIProfile } from "../model/ai-profile.entity";

/**
 * Repository interface for AIProfile entity persistence operations.
 *
 * This interface defines the contract for AI user profile data access, providing methods
 * for managing individual productivity patterns, preferences, and behaviors. AI profiles
 * are used to personalize AI-generated recommendations, task suggestions, and productivity insights.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAIProfileRepository implements AIProfileRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async findByUserId(userId: string): Promise<AIProfile | null> {
 *     const data = await this.prisma.aIProfile.findUnique({
 *       where: { userId }
 *     });
 *     return data ? new AIProfile(data) : null;
 *   }
 *
 *   async findOrCreate(userId: string): Promise<AIProfile> {
 *     let profile = await this.findByUserId(userId);
 *     if (!profile) {
 *       profile = new AIProfile({
 *         userId,
 *         workHours: { start: '09:00', end: '17:00' },
 *         preferredBreakDuration: 5,
 *         timezone: 'UTC'
 *       });
 *       profile = await this.save(profile);
 *     }
 *     return profile;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/ai-profile.entity.ts | AIProfile entity}
 */
export interface AIProfileRepository {
  /**
   * Finds AI profile by user ID.
   *
   * Used for retrieving a user's AI profile to personalize recommendations and insights.
   * Returns null if the user doesn't have a profile yet (first-time user).
   *
   * @param userId - The user ID to find the AI profile for
   * @returns Promise resolving to the AI profile if found, null otherwise
   *
   * @example
   * ```typescript
   * const profile = await repository.findByUserId('user-123');
   * if (profile) {
   *   console.log(`User's productive hours: ${profile.workHours.start} - ${profile.workHours.end}`);
   *   console.log(`Preferred break duration: ${profile.preferredBreakDuration} minutes`);
   * } else {
   *   console.log('No AI profile found for user');
   * }
   * ```
   */
  findByUserId(userId: string): Promise<AIProfile | null>;

  /**
   * Finds or creates AI profile for a user.
   *
   * Used when you need to ensure a user has an AI profile, creating one with default
   * values if it doesn't exist. This is the preferred method for accessing AI profiles
   * as it guarantees a profile is always returned.
   *
   * @param userId - The user ID to find or create the AI profile for
   * @returns Promise resolving to the existing or newly created AI profile
   *
   * @example
   * ```typescript
   * const profile = await repository.findOrCreate('user-123');
   *
   * // Profile is guaranteed to exist
   * console.log(`User's timezone: ${profile.timezone}`);
   * console.log(`Peak productivity hours: ${profile.peakProductivityHours.join(', ')}`);
   *
   * // Use profile to personalize AI recommendations
   * const suggestions = generateSuggestions(profile);
   * ```
   */
  findOrCreate(userId: string): Promise<AIProfile>;

  /**
   * Saves (creates or updates) an AI profile.
   *
   * Used for persisting AI profile data, whether it's a new profile or updates to an
   * existing one. Handles both creation and update operations seamlessly.
   *
   * @param profile - The AI profile entity to save (must be valid)
   * @returns Promise resolving to the saved profile with any database-generated fields populated
   * @throws {Error} If profile validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const profile = new AIProfile({
   *   userId: 'user-123',
   *   workHours: { start: '08:00', end: '16:00' },
   *   preferredBreakDuration: 10,
   *   timezone: 'America/New_York',
   *   taskPrioritization: 'deadline',
     focusPreferences: {
   *     deepWork: true,
   *     notificationsMuted: true
   *   }
   * });
   *
   * const saved = await repository.save(profile);
   * console.log(`AI profile saved with ID: ${saved.id}`);
   * ```
   */
  save(profile: AIProfile): Promise<AIProfile>;

  /**
   * Updates an existing AI profile.
   *
   * Used when modifying specific fields of an AI profile, such as updating work hours,
   * preferences, or productivity patterns. The profile must already exist.
   *
   * @param profile - The AI profile entity with updated fields
   * @returns Promise resolving to the updated profile
   * @throws {NotFoundException} If the profile doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const existing = await repository.findByUserId('user-123');
   * if (existing) {
   *   const updated = existing.clone({
   *     workHours: { start: '07:00', end: '15:00' },
   *     preferredBreakDuration: 15
   *   });
   *   await repository.update(updated);
   *   console.log('AI profile updated');
   * }
   * ```
   */
  update(profile: AIProfile): Promise<AIProfile>;

  /**
   * Deletes an AI profile by ID.
   *
   * WARNING: This will permanently delete the user's AI profile and all personalized
   * preferences. Consider archiving instead if you want to keep the data.
   *
   * @param id - The unique identifier of the AI profile to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the profile doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('profile-abc-123');
   * console.log('AI profile permanently deleted');
   * ```
   */
  delete(id: string): Promise<void>;
}
