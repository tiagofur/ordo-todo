'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    currentStreak: 'Current Streak',
    day: 'day',
    days: 'days',
    personalBest: 'Personal best!',
    bestStreak: 'Best streak:',
};
export function ProductivityStreakWidget({ currentStreak, longestStreak, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const isOnStreak = currentStreak > 0;
    const isPersonalBest = currentStreak === longestStreak && currentStreak > 0;
    return (_jsxs("div", { className: cn('group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300', 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'), style: {
            borderLeftWidth: '4px',
            borderLeftColor: isOnStreak ? '#f97316' : '#6b7280',
        }, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn('flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300', 'group-hover:scale-110 group-hover:rotate-3'), style: {
                            backgroundColor: isOnStreak ? '#f9731615' : '#6b728015',
                            color: isOnStreak ? '#f97316' : '#6b7280',
                        }, children: _jsx(Flame, { className: cn('h-6 w-6', isOnStreak && 'animate-pulse') }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t.currentStreak }), _jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("p", { className: "text-2xl font-bold", children: currentStreak }), _jsx("span", { className: "text-sm text-muted-foreground", children: currentStreak !== 1 ? t.days : t.day })] }), isPersonalBest && currentStreak > 1 && (_jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "h-3 w-3 text-emerald-500" }), _jsx("span", { className: "text-xs text-emerald-500 font-medium", children: t.personalBest })] }))] })] }), longestStreak > 0 && longestStreak !== currentStreak && (_jsx("div", { className: "mt-4 pt-4 border-t border-border/50", children: _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: t.bestStreak }), _jsxs("span", { className: "font-medium", children: [longestStreak, " ", t.days] })] }) })), isOnStreak && (_jsx("div", { className: "absolute -right-4 -top-4 opacity-10", children: _jsx(Flame, { className: "h-24 w-24 text-orange-500" }) }))] }));
}
