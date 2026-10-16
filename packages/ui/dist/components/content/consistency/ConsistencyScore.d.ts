import type { ConsistencyScoreProps, StreakBadgeProps, GoalProgressProps } from '@ordo-todo/ui-shared';
/**
 * ConsistencyStreakBadge component for displaying current streak in consistency context
 * Uses different name to avoid conflict with habit/StreakBadge
 */
export declare function ConsistencyStreakBadge({ streak, size, animated, className, }: StreakBadgeProps): import("react/jsx-runtime").JSX.Element;
/**
 * GoalProgress component for displaying weekly/monthly goals
 */
export declare function GoalProgress({ current, target, label, period, showPercentage, className, }: GoalProgressProps): import("react/jsx-runtime").JSX.Element;
/**
 * ConsistencyScore component - main dashboard widget for creator consistency
 */
export declare function ConsistencyScore({ score, currentStreak, longestStreak, publishedThisWeek, targetThisWeek, compact, className, }: ConsistencyScoreProps): import("react/jsx-runtime").JSX.Element;
export default ConsistencyScore;
//# sourceMappingURL=ConsistencyScore.d.ts.map