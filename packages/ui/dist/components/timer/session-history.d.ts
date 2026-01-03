export type SessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';
export interface TimerSession {
    id: string;
    type: SessionType;
    startedAt: string | Date;
    duration: number;
    wasCompleted: boolean;
    wasInterrupted?: boolean;
    pauseCount: number;
    taskId?: string | null;
}
export interface TimerStats {
    pomodorosCompleted: number;
    totalMinutesWorked: number;
    avgFocusScore: number;
    completionRate: number;
    dailyBreakdown?: Array<{
        date: string;
        minutesWorked: number;
        pomodorosCompleted: number;
    }>;
}
export interface SessionHistoryFilters {
    type?: SessionType;
    startDate?: string;
    endDate?: string;
    completedOnly?: boolean;
    page: number;
    limit: number;
}
export interface SessionHistoryData {
    sessions: TimerSession[];
    total: number;
    totalPages: number;
}
interface SessionHistoryProps {
    /** Session history data */
    historyData?: SessionHistoryData | null;
    /** Stats data */
    statsData?: TimerStats | null;
    /** Whether history is loading */
    isLoadingHistory?: boolean;
    /** Whether stats are loading */
    isLoadingStats?: boolean;
    /** Whether there's an error */
    hasError?: boolean;
    /** Current filters */
    filters: SessionHistoryFilters;
    /** Called when filters change */
    onFiltersChange: (filters: SessionHistoryFilters) => void;
    /** Function to format date/time string */
    formatDate?: (date: string | Date) => string;
    /** Function to format day string (e.g. Mon, Tue) */
    formatDay?: (date: string | Date) => string;
    /** Custom labels for i18n */
    labels?: {
        error?: string;
        statsPomodoros?: string;
        statsTotalTime?: string;
        statsFocusScore?: string;
        statsCompletionRate?: string;
        filtersTitle?: string;
        filtersType?: string;
        filtersAllTypes?: string;
        filtersStatus?: string;
        filtersAllStatus?: string;
        filtersCompletedOnly?: string;
        sessionsTitle?: string;
        sessionsCount?: string;
        sessionsEmpty?: string;
        sessionPause?: string;
        sessionPauses?: string;
        typesWork?: string;
        typesShortBreak?: string;
        typesLongBreak?: string;
        typesContinuous?: string;
        paginationShowing?: (from: number, to: number, total: number) => string;
        chartTitle?: string;
    };
}
/**
 * SessionHistory - Platform-agnostic timer session history display
 *
 * All data fetching handled externally via props.
 *
 * @example
 * const { data: history, isLoading } = useSessionHistory(filters);
 * const { data: stats } = useTimerStats(filters);
 *
 * <SessionHistory
 *   historyData={history}
 *   statsData={stats}
 *   isLoadingHistory={isLoading}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   formatDate={(d) => format(d, 'PPp')}
 *   labels={{ ... }}
 * />
 */
export declare function SessionHistory({ historyData, statsData, isLoadingHistory, isLoadingStats, hasError, filters, onFiltersChange, formatDate, formatDay, labels, }: SessionHistoryProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=session-history.d.ts.map