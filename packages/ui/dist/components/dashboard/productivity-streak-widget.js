import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    currentStreak: 'Current Streak',
    day: 'day',
    days: 'days',
    personalBest: 'Personal best!',
    bestStreak: 'Best streak:',
};
export function ProductivityStreakWidget({ currentStreak, longestStreak, className, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const isOnStreak = currentStreak > 0;
    const isPersonalBest = currentStreak === longestStreak && currentStreak > 0;
    const streakColor = isOnStreak ? '#f97316' : '#6b7280';
    return (_jsxs(motion.div, { whileHover: {
            y: -3,
            borderColor: `${streakColor}70`,
            boxShadow: `0 12px 28px -6px ${streakColor}25`,
        }, className: cn('group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-5 transition-all duration-300 flex flex-col justify-between shadow-xs h-full', className), children: [_jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-15", style: { backgroundColor: streakColor } }), _jsx("div", { className: "relative z-10 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn('flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 shrink-0', 'group-hover:scale-105'), style: {
                                backgroundColor: `${streakColor}15`,
                                color: streakColor,
                                border: `1px solid ${streakColor}25`,
                            }, children: _jsx(Flame, { className: cn('h-5 w-5', isOnStreak && 'animate-pulse') }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-foreground", children: t.currentStreak }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [t.bestStreak, " ", _jsx("span", { className: "font-medium text-foreground tabular-nums", children: longestStreak }), " ", longestStreak !== 1 ? t.days : t.day] })] })] }) }), _jsxs("div", { className: "relative z-10 my-3 flex items-baseline gap-2", children: [_jsx("p", { className: "text-4xl font-bold tracking-tight tabular-nums text-foreground", children: currentStreak }), _jsx("span", { className: "text-sm font-medium text-muted-foreground", children: currentStreak !== 1 ? t.days : t.day })] }), _jsx("div", { className: "relative z-10 pt-3 border-t border-border/50 flex items-center justify-between text-xs", children: isPersonalBest && currentStreak > 0 ? (_jsxs("div", { className: "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium", children: [_jsx(TrendingUp, { className: "h-3.5 w-3.5" }), _jsx("span", { children: t.personalBest })] })) : (_jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { className: "text-muted-foreground", children: t.bestStreak }), _jsxs("span", { className: "font-semibold text-foreground tabular-nums", children: [longestStreak, " ", longestStreak !== 1 ? t.days : t.day] })] })) })] }));
}
