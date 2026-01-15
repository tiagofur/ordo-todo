'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { Card } from '../../ui/card.js';
import { Progress } from '../../ui/progress.js';
import { Flame, TrendingUp, Target } from 'lucide-react';
/**
 * ConsistencyStreakBadge component for displaying current streak in consistency context
 * Uses different name to avoid conflict with habit/StreakBadge
 */
export function ConsistencyStreakBadge({ streak, size = 'md', animated = true, className, }) {
    const sizeClasses = {
        sm: 'text-sm gap-1',
        md: 'text-base gap-1.5',
        lg: 'text-lg gap-2',
    };
    const iconSizes = {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
    };
    return (_jsxs("div", { className: cn('flex items-center font-bold text-orange-400', sizeClasses[size], className), children: [_jsx(Flame, { className: cn(iconSizes[size], animated && streak > 0 && 'animate-pulse') }), _jsx("span", { children: streak })] }));
}
/**
 * GoalProgress component for displaying weekly/monthly goals
 */
export function GoalProgress({ current, target, label, period = 'weekly', showPercentage = true, className, }) {
    const percentage = Math.min(100, (current / target) * 100);
    const isComplete = current >= target;
    return (_jsxs("div", { className: cn('space-y-2', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "size-4 text-cyan-400" }), _jsx("span", { className: "text-sm text-gray-300", children: label || `${period.charAt(0).toUpperCase() + period.slice(1)} Goal` })] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: cn(isComplete ? 'text-green-400' : 'text-gray-200'), children: current }), _jsxs("span", { className: "text-gray-500", children: ["/", target] }), showPercentage && (_jsxs("span", { className: "text-gray-500 ml-1", children: ["(", Math.round(percentage), "%)"] }))] })] }), _jsx(Progress, { value: percentage, className: cn('h-2', isComplete && '[&>div]:bg-green-500') })] }));
}
/**
 * ConsistencyScore component - main dashboard widget for creator consistency
 */
export function ConsistencyScore({ score, currentStreak, longestStreak, publishedThisWeek, targetThisWeek, compact = false, className, }) {
    const scoreColor = score >= 80 ? 'text-green-400' :
        score >= 50 ? 'text-yellow-400' :
            'text-red-400';
    return (_jsxs(Card, { className: cn('p-4', compact ? 'p-3' : 'p-5', className), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-400 mb-1", children: "Consistency Score" }), _jsxs("div", { className: cn('text-4xl font-bold', scoreColor), children: [score, "%"] })] }), _jsx(ConsistencyStreakBadge, { streak: currentStreak, size: "lg" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-800", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Current Streak" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Flame, { className: "size-4 text-orange-400" }), _jsxs("span", { className: "text-lg font-semibold text-gray-200", children: [currentStreak, " weeks"] })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Longest Streak" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(TrendingUp, { className: "size-4 text-purple-400" }), _jsxs("span", { className: "text-lg font-semibold text-gray-200", children: [longestStreak, " weeks"] })] })] })] }), _jsx(GoalProgress, { current: publishedThisWeek, target: targetThisWeek, period: "weekly" }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-800", children: _jsx("p", { className: "text-xs text-gray-400 text-center", children: score >= 100 ? ('🎉 Perfect week! You\'re crushing it!') : score >= 80 ? ('🔥 Great consistency! Keep it up!') : score >= 50 ? ('💪 You\'re making progress. Push a bit more!') : ('📈 Time to step up your content game!') }) })] }));
}
export default ConsistencyScore;
