import { Achievement } from "../model/achievement.entity";
import { UserAchievement } from "../model/user-achievement.entity";

/**
 * Repository interface for Gamification persistence operations.
 */
export interface IGamificationRepository {
    // ============ Achievement Operations ============

    /**
     * Find an achievement by code
     */
    findAchievementByCode(code: string): Promise<Achievement | null>;

    /**
     * Find an achievement by ID
     */
    findAchievementById(id: string): Promise<Achievement | null>;

    /**
     * Find all achievements
     */
    findAllAchievements(): Promise<Achievement[]>;

    /**
     * Create a new achievement (for seeding/admin)
     */
    createAchievement(achievement: Achievement): Promise<Achievement>;

    // ============ UserAchievement Operations ============

    /**
     * Check if a user has unlocked an achievement
     */
    hasUnlocked(userId: string, achievementId: string): Promise<boolean>;

    /**
     * Unlock an achievement for a user
     */
    unlockAchievement(userAchievement: UserAchievement): Promise<UserAchievement>;

    /**
     * Find all achievements for a user
     */
    findUserAchievements(userId: string): Promise<UserAchievement[]>;
}
