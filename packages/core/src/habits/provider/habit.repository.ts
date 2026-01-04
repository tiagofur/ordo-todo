import { Habit, HabitProps } from "../model/habit.entity";
import { HabitCompletionProps } from "../model/habit.entity";

/**
 * Repository interface for Habit entity persistence operations.
 *
 * This interface defines the contract for Habit data access, providing CRUD operations
 * plus specialized methods for managing habit completions, retrieving today's habits,
 * and calculating habit statistics (streaks, completion rates, etc.).
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaHabitRepository implements IHabitRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(habit: Habit): Promise<Habit> {
 *     const data = await this.prisma.habit.create({
 *       data: {
 *         id: habit.id,
 *         name: habit.name,
 *         frequency: habit.frequency,
 *         targetDays: habit.targetDays,
 *         userId: habit.userId,
 *         createdAt: habit.createdAt,
 *         // ... other fields
 *       }
 *     });
 *     return new Habit(data);
 *   }
 *
 *   async findTodayHabits(userId: string): Promise<Habit[]> {
 *     const today = new Date().getDay();
 *     const habits = await this.prisma.habit.findMany({
 *       where: {
 *         userId,
 *         targetDays: { has: today },
 *         status: 'ACTIVE'
 *       }
 *     });
 *     return habits.map(h => new Habit(h));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/habit.entity.ts | Habit entity}
 */
export interface IHabitRepository {
  /**
   * Finds a habit by its unique ID.
   *
   * Used for fetching habit details when the ID is known, such as from a URL parameter
   * or after creating/updating a habit.
   *
   * @param id - The unique identifier of the habit
   * @returns Promise resolving to the habit if found, null otherwise
   *
   * @example
   * ```typescript
   * const habit = await repository.findById('habit-123');
   * if (habit) {
   *   console.log(`Found habit: ${habit.name}`);
   * } else {
   *   console.log('Habit not found');
   * }
   * ```
   */
  findById(id: string): Promise<Habit | null>;

  /**
   * Finds all habits for a specific user.
   *
   * Used for displaying the user's complete habit list, including active and inactive habits.
   * Returns habits ordered by creation date or custom order.
   *
   * @param userId - The user ID to find habits for
   * @returns Promise resolving to an array of habits for the user (empty array if none found)
   *
   * @example
   * ```typescript
   * const habits = await repository.findByUserId('user-123');
   * console.log(`User has ${habits.length} habits`);
   *
   * habits.forEach(habit => {
   *   console.log(`${habit.name}: ${habit.status}`);
   * });
   * ```
   */
  findByUserId(userId: string): Promise<Habit[]>;

  /**
   * Finds all active habits for a specific user.
   *
   * Used for displaying the user's active habit list in the habits view.
   * Filters out archived, paused, or deleted habits.
   *
   * @param userId - The user ID to find active habits for
   * @returns Promise resolving to an array of active habits (empty array if none found)
   *
   * @example
   * ```typescript
   * const activeHabits = await repository.findActiveByUserId('user-123');
   * console.log(`User has ${activeHabits.length} active habits`);
   *
   * // Render habits checklist for today
   * activeHabits.forEach(habit => {
   *   console.log(`☐ ${habit.name}`);
   * });
   * ```
   */
  findActiveByUserId(userId: string): Promise<Habit[]>;

  /**
   * Finds habits that are scheduled for today.
   *
   * Used for displaying the daily habit checklist. Returns habits that are active
   * and have today's day in their targetDays array (e.g., Monday, Wednesday, Friday).
   *
   * @param userId - The user ID to find today's habits for
   * @returns Promise resolving to an array of habits scheduled for today (empty array if none found)
   *
   * @example
   * ```typescript
   * const todayHabits = await repository.findTodayHabits('user-123');
   * console.log(`${todayHabits.length} habits to complete today`);
   *
   * // Check which habits are already completed
   * for (const habit of todayHabits) {
   *   const completion = await repository.getCompletionForDate(habit.id, new Date());
   *   const status = completion ? '✓' : '☐';
   *   console.log(`${status} ${habit.name}`);
   * }
   * ```
   */
  findTodayHabits(userId: string): Promise<Habit[]>;

  /**
   * Creates a new habit in the repository.
   *
   * Used when creating a new habit through the UI or API.
   * The habit should have all required fields populated before calling this method.
   *
   * @param habit - The habit entity to create (must be valid)
   * @returns Promise resolving to the created habit with any database-generated fields populated
   * @throws {Error} If habit validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const habit = new Habit({
   *   name: 'Morning Exercise',
   *   description: '30 minutes of cardio',
   *   frequency: 'WEEKLY',
   *   targetDays: [1, 3, 5], // Monday, Wednesday, Friday
   *   userId: 'user-123'
   * });
   *
   * const created = await repository.create(habit);
   * console.log(`Habit created with ID: ${created.id}`);
   * ```
   */
  create(habit: Habit): Promise<Habit>;

  /**
   * Updates an existing habit in the repository.
   *
   * Used when modifying habit details such as name, description, frequency, or status.
   * The habit entity should already exist and be valid before calling this method.
   *
   * @param id - The unique identifier of the habit to update
   * @param data - Partial data with fields to update
   * @returns Promise resolving to the updated habit
   * @throws {NotFoundException} If the habit doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const updated = await repository.update('habit-123', {
   *   name: 'Morning Exercise (Extended)',
   *   targetDays: [1, 2, 3, 4, 5] // Weekdays
   * });
   * console.log(`Habit updated: ${updated.name}`);
   * ```
   */
  update(id: string, data: Partial<HabitProps>): Promise<Habit>;

  /**
   * Deletes a habit from the repository.
   *
   * WARNING: This will permanently delete the habit and all its completion records.
   * Consider soft-deletion or archiving instead if you want to keep the history.
   *
   * @param id - The unique identifier of the habit to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the habit doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('habit-123');
   * console.log('Habit permanently deleted');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Records a habit completion for a specific date.
   *
   * Used when a user marks a habit as completed for the day.
   * Creates a completion record linked to the habit.
   *
   * @param habitId - The unique identifier of the habit
   * @param data - Completion data (date, notes, etc.)
   * @returns Promise resolving to the updated habit with the new completion
   * @throws {NotFoundException} If the habit doesn't exist
   * @throws {Error} If a completion already exists for this date
   *
   * @example
   * ```typescript
   * await repository.createCompletion('habit-123', {
   *   date: new Date(),
   *   completedAt: new Date(),
   *   notes: 'Felt great today!'
   * });
   * console.log('Habit marked as completed');
   * ```
   */
  createCompletion(habitId: string, data: HabitCompletionProps): Promise<Habit>;

  /**
   * Removes a habit completion record for a specific date.
   *
   * Used when a user unchecks a habit completion (e.g., marked by mistake).
   * Deletes the completion record but keeps the habit itself.
   *
   * @param habitId - The unique identifier of the habit
   * @param date - The date of the completion to remove
   * @returns Promise resolving when the removal is complete
   * @throws {NotFoundException} If the completion doesn't exist
   *
   * @example
   * ```typescript
   * await repository.deleteCompletion('habit-123', new Date());
   * console.log('Habit completion removed');
   * ```
   */
  deleteCompletion(habitId: string, date: Date): Promise<void>;

  /**
   * Retrieves all completions for a habit within a date range.
   *
   * Used for displaying habit completion history in charts, calendars, or streak views.
   * Returns completions ordered by date descending.
   *
   * @param habitId - The unique identifier of the habit
   * @param startDate - Start of the date range (inclusive)
   * @param endDate - End of the date range (inclusive)
   * @returns Promise resolving to an array of completions (empty array if none found)
   *
   * @example
   * ```typescript
   * // Get completions for the current month
   * const now = new Date();
   * const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   * const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
   *
   * const completions = await repository.getCompletions('habit-123', startOfMonth, endOfMonth);
   * console.log(`Habit completed ${completions.length} times this month`);
   *
   * // Render completion calendar
   * completions.forEach(completion => {
   *   console.log(`${completion.date.toISOString().split('T')[0]}: ✓`);
   * });
   * ```
   */
  getCompletions(
    habitId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HabitCompletionProps[]>;

  /**
   * Retrieves the completion record for a habit on a specific date.
   *
   * Used for checking if a habit was completed on a given day, such as when
   * rendering the habit checklist for today.
   *
   * @param habitId - The unique identifier of the habit
   * @param date - The date to check for completion
   * @returns Promise resolving to the completion if found, null otherwise
   *
   * @example
   * ```typescript
   * const completion = await repository.getCompletionForDate('habit-123', new Date());
   * if (completion) {
   *   console.log('Habit completed today!');
   *   console.log(`Completed at: ${completion.completedAt}`);
   *   console.log(`Notes: ${completion.notes}`);
   * } else {
   *   console.log('Habit not completed yet today');
   * }
   * ```
   */
  getCompletionForDate(
    habitId: string,
    date: Date,
  ): Promise<HabitCompletionProps | null>;

  /**
   * Calculates comprehensive statistics for a habit.
   *
   * Used for displaying habit metrics and insights, such as current streak,
   * longest streak, completion rate, and recent activity. Useful for motivation
   * and progress tracking.
   *
   * @param habitId - The unique identifier of the habit
   * @returns Promise resolving to habit statistics
   *
   * @example
   * ```typescript
   * const stats = await repository.getStats('habit-123');
   *
   * console.log(`Current streak: ${stats.currentStreak} days`);
   * console.log(`Longest streak: ${stats.longestStreak} days`);
   * console.log(`Total completions: ${stats.totalCompletions}`);
   * console.log(`Completion rate: ${(stats.completionRate * 100).toFixed(1)}%`);
   * console.log(`This week: ${stats.thisWeekCompletions} completions`);
   * console.log(`This month: ${stats.thisMonthCompletions} completions`);
   *
   * // Display streak badge
   * if (stats.currentStreak >= 30) {
   *   console.log('🔥 Amazing streak! Keep it up!');
   * } else if (stats.currentStreak >= 7) {
   *   console.log('⭐ Great consistency!');
   * }
   * ```
   */
  getStats(habitId: string): Promise<{
    /** Current consecutive completion streak (in days) */
    currentStreak: number;

    /** Longest consecutive completion streak achieved (in days) */
    longestStreak: number;

    /** Total number of completions since habit creation */
    totalCompletions: number;

    /** Completion rate as a percentage (0-1), calculated over the habit's lifetime */
    completionRate: number;

    /** Number of completions in the current week (Sunday to Saturday) */
    thisWeekCompletions: number;

    /** Number of completions in the current month */
    thisMonthCompletions: number;
  }>;
}
