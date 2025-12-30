interface HabitCelebrationProps {
    show: boolean;
    onComplete?: () => void;
    xp?: number;
    streak?: number;
    labels?: {
        xpText?: string;
        streakText?: string;
    };
}
export declare function HabitCelebration({ show, onComplete, xp, streak, labels, }: HabitCelebrationProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=habit-celebration.d.ts.map