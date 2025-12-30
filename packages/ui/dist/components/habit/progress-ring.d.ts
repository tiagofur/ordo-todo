import { type ReactNode } from 'react';
interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showLabel?: boolean;
    animate?: boolean;
    className?: string;
    children?: ReactNode;
}
export declare function ProgressRing({ progress, size, strokeWidth, color, backgroundColor, // Changed default to generic
showLabel, animate, className, children, }: ProgressRingProps): import("react/jsx-runtime").JSX.Element;
interface DailyProgressProps {
    completed: number;
    total: number;
    color?: string;
}
export declare function DailyProgress({ completed, total, color, }: DailyProgressProps): import("react/jsx-runtime").JSX.Element;
interface MiniProgressBarProps {
    progress: number;
    color?: string;
    height?: number;
    className?: string;
}
export declare function MiniProgressBar({ progress, color, height, className, }: MiniProgressBarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=progress-ring.d.ts.map