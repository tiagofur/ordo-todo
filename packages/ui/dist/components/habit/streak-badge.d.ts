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
interface StreakCounterProps {
    from: number;
    to: number;
    duration?: number;
    onComplete?: () => void;
}
export declare function StreakCounter({ from, to, duration, onComplete, }: StreakCounterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=streak-badge.d.ts.map