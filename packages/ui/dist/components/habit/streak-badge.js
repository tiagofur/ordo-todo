import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame } from 'lucide-react';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    day: 'day',
    days: 'days',
};
export function StreakBadge({ streak, size = 'md', showLabel = true, animate = true, className, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    if (streak <= 0)
        return null;
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-3 py-1 gap-1.5',
        lg: 'text-base px-4 py-2 gap-2',
    };
    const iconSizes = {
        sm: 12,
        md: 16,
        lg: 20,
    };
    // Determine streak tier for styling
    const getTier = (s) => {
        if (s >= 100)
            return 'legendary';
        if (s >= 30)
            return 'epic';
        if (s >= 7)
            return 'rare';
        return 'common';
    };
    const tier = getTier(streak);
    const tierStyles = {
        common: {
            bg: 'bg-amber-100/80 dark:bg-amber-950/50',
            text: 'text-amber-600 dark:text-amber-400',
            glow: 'shadow-none',
        },
        rare: {
            bg: 'bg-orange-100/80 dark:bg-orange-950/50',
            text: 'text-orange-600 dark:text-orange-400',
            glow: 'shadow-xs',
        },
        epic: {
            bg: 'bg-red-100/80 dark:bg-red-950/50',
            text: 'text-red-600 dark:text-red-400',
            glow: 'shadow-sm',
        },
        legendary: {
            bg: 'bg-red-100/90 dark:bg-red-950/70',
            text: 'text-red-600 dark:text-red-400',
            glow: 'shadow-sm shadow-red-500/20',
        },
    };
    const style = tierStyles[tier];
    return (_jsxs("div", { className: cn('inline-flex items-center rounded-full font-semibold transition-transform hover:scale-105', sizeClasses[size], style.bg, animate ? 'animate-in fade-in zoom-in duration-300' : '', animate && tier !== 'common' && style.glow, className), children: [_jsx("div", { className: cn(animate && tier !== 'common' ? 'animate-pulse' : ''), children: _jsx(Flame, { size: iconSizes[size], className: style.text, fill: "currentColor" }) }), _jsx("span", { className: cn('font-bold', style.text), children: streak }), showLabel && size !== 'sm' && (_jsx("span", { className: cn('text-muted-foreground', style.text), children: streak === 1 ? t.day : t.days }))] }));
}
export function StreakCounter({ to, }) {
    return (_jsxs("div", { className: "flex items-center gap-2 animate-in zoom-in duration-300", children: [_jsx("div", { className: "animate-pulse", children: _jsx(Flame, { className: "h-8 w-8 text-amber-500", fill: "#f59e0b" }) }), _jsx("span", { className: "text-3xl font-bold text-amber-500 animate-in slide-in-from-bottom-2 fade-in duration-500", children: to })] }));
}
