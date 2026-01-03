interface StreakBadgeProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animate?: boolean;
    className?: string;
    labels?: {
        day?: string;
        days?: string;
    };
}
export declare function StreakBadge({ streak, size, showLabel, animate, className, labels, }: StreakBadgeProps): import("react/jsx-runtime").JSX.Element | null;
export interface StreakCounterProps {
    from: number;
    to: number;
    duration?: number;
    onComplete?: () => void;
}
export declare function StreakCounter({ to, }: StreakCounterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=streak-badge.d.ts.map