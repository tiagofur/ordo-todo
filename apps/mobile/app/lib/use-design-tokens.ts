import { useTheme } from '@/app/data/contexts/theme.context';
import {
    getColors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    shadows,
    semanticColors,
    projectColors,
    tagColors,
    priorityColors,
    statusColors,
    timerColors
} from '@ordo-todo/styles/tokens';

/**
 * Hook to access shared design tokens adapted for the current theme (light/dark).
 * Use this instead of hardcoded colors or separate theme files.
 */
export function useDesignTokens() {
    const { isDark } = useTheme();
    const themeColors = getColors(isDark);

    return {
        colors: {
            ...themeColors,
            semantic: semanticColors,
            project: projectColors,
            tag: tagColors,
            priority: priorityColors,
            status: statusColors,
            timer: timerColors,
        },
        spacing,
        borderRadius,
        typography: {
            size: fontSize,
            weight: fontWeight,
        },
        shadows,
        isDark,
    };
}
