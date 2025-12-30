export interface HabitData {
    id: string;
    name: string;
    description?: string | null;
    frequency: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
    color?: string;
    icon?: string;
    isPaused: boolean;
    currentStreak?: number;
    longestStreak?: number;
}
export interface HabitStats {
    totalCompletions: number;
    completionRate: number;
    calendarData: Array<{
        date: string;
        completed: boolean;
    }>;
}
export interface HabitDetailPanelProps {
    habit: HabitData | null | undefined;
    stats?: HabitStats | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading?: boolean;
    onUpdate: (id: string, data: {
        name: string;
        description?: string;
    }) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onTogglePause: (id: string) => Promise<void>;
    isUpdating?: boolean;
    isDeleting?: boolean;
    isPausing?: boolean;
    labels?: {
        description?: string;
        statusPaused?: string;
        statusActive?: string;
        frequencyDaily?: string;
        frequencyWeekly?: string;
        frequencySpecific?: string;
        currentStreak?: string;
        longestStreak?: string;
        totalCompletions?: string;
        completionRate?: string;
        days?: string;
        times?: string;
        successRate?: string;
        last30Days?: string;
        edit?: string;
        cancel?: string;
        save?: string;
        delete?: string;
        pause?: string;
        resume?: string;
        confirmDelete?: string;
        notFound?: string;
    };
}
export declare function HabitDetailPanel({ habit, stats, open, onOpenChange, isLoading, onUpdate, onDelete, onTogglePause, isUpdating, isDeleting, isPausing, labels, }: HabitDetailPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=habit-detail-panel.d.ts.map