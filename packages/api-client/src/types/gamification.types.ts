/**
 * Gamification DTOs.
 * Field set mirrors what the web/desktop profile tabs render
 * (level progress plus the achievement list).
 */

export interface GamificationAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  currentLevelProgress: number;
  nextLevelXp: number;
  achievementsTotal: number;
  achievementsUnlocked: number;
  achievements: GamificationAchievement[];
}
