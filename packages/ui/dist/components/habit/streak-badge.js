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
            bg: 'bg-amber-100 dark:bg-amber-900', // Solid background for platform-agnostic
            text: 'text-amber-500',
            glow: 'shadow-none',
        },
        rare: {
            bg: 'bg-orange-100 dark:bg-orange-900',
            text: 'text-orange-500',
            glow: 'shadow-md shadow-orange-500/30',
        },
        epic: {
            bg: 'bg-red-100 dark:bg-red-900',
            text: 'text-red-500',
            glow: 'shadow-lg shadow-red-500/40',
        },
        legendary: {
            bg: 'bg-gradient-to-r from-amber-100 via-red-100 to-purple-100 dark:from-amber-900 dark:via-red-900 dark:to-purple-900',
            text: 'text-transparent bg-gradient-to-r from-amber-500 via-red-500 to-purple-500 bg-clip-text',
            glow: 'shadow-xl shadow-red-500/50',
        },
    };
    const style = tierStyles[tier];
    return (_jsxs("div", { className: cn('inline-flex items-center rounded-full font-semibold transition-transform hover:scale-105', sizeClasses[size], style.bg, animate ? 'animate-in fade-in zoom-in duration-300' : '', animate && tier !== 'common' && style.glow, className), children: [_jsx("div", { className: cn(animate && tier !== 'common' ? 'animate-pulse' : ''), children: _jsx(Flame, { size: iconSizes[size], className: cn(tier === 'legendary' ? 'text-red-500' : style.text), fill: tier === 'legendary' ? 'url(#flameGradient)' : 'currentColor' }) }), _jsx("span", { className: cn('font-bold', style.text), children: streak }), showLabel && size !== 'sm' && (_jsx("span", { className: cn('text-muted-foreground', style.text), children: streak === 1 ? t.day : t.days })), tier === 'legendary' && (_jsx("svg", { width: "0", height: "0", className: "absolute", children: _jsx("defs", { children: _jsxs("linearGradient", { id: "flameGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#fbbf24" }), _jsx("stop", { offset: "50%", stopColor: "#ef4444" }), _jsx("stop", { offset: "100%", stopColor: "#a855f7" })] }) }) }))] }));
}
export function StreakCounter({ to, }) {
    return (_jsxs("div", { className: "flex items-center gap-2 animate-in zoom-in duration-300", children: [_jsx("div", { className: "animate-bounce", children: _jsx(Flame, { className: "h-8 w-8 text-amber-500", fill: "#f59e0b" }) }), _jsx("span", { className: "text-3xl font-bold text-amber-500 animate-in slide-in-from-bottom-2 fade-in duration-500", children: to })] }));
}
