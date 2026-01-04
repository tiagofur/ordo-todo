interface Habit {
    id: string;
    name: string;
    color?: string;
    isPaused?: boolean;
    completions?: Record<string, unknown>[];
    currentStreak: number;
}
interface HabitsSummary {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
}
interface HabitsWidgetProps {
    habits: Habit[];
    summary: HabitsSummary;
    accentColor?: string;
    isLoading?: boolean;
    onToggleHabit?: (habitId: string, isCompleted: boolean) => void;
    onViewAll?: () => void;
    onCreateHabit?: () => void;
    labels?: {
        title?: string;
        todayProgress?: (completed: number, total: number) => string;
        viewAll?: string;
        noHabits?: string;
        createHabit?: string;
        moreHabits?: (count: number) => string;
    };
}
export declare function HabitsWidget({ habits, summary, accentColor, isLoading, onToggleHabit, onViewAll, onCreateHabit, labels, }: HabitsWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=habits-widget.d.ts.map