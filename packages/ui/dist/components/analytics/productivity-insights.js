'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card.js';
import { Brain, Clock, TrendingUp, Lightbulb, Calendar } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.js';
import { Badge } from '../ui/badge.js';
function getScoreColor(score) {
    if (score >= 0.8)
        return 'text-green-600 dark:text-green-400';
    if (score >= 0.6)
        return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
}
function getScoreBadgeVariant(score) {
    if (score >= 0.8)
        return 'default';
    if (score >= 0.6)
        return 'secondary';
    return 'destructive';
}
/**
 * ProductivityInsights - Platform-agnostic AI productivity insights
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: schedule, isLoading } = useOptimalSchedule({ topN: 5 });
 *
 * <ProductivityInsights
 *   schedule={schedule}
 *   isLoading={isLoading}
 *   labels={{ title: t('title') }}
 * />
 */
export function ProductivityInsights({ schedule, isLoading = false, labels = {}, className = '', }) {
    const { title = 'AI Productivity Insights', description = 'Personalized recommendations based on your work patterns', empty = 'Complete more sessions to receive personalized insights', peakHoursTitle = 'Best Working Hours', peakHoursDescription = 'Schedule demanding tasks during these hours', peakDaysTitle = 'Most Productive Days', peakDaysDescription = 'Plan important work on these days', tip = 'Pro Tip: These insights improve over time as you use the app more.', } = labels;
    if (isLoading) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-32" }), _jsx(Skeleton, { className: "h-20 w-full" })] }, i))) })] }));
    }
    if (!schedule || (schedule.peakHours.length === 0 && schedule.peakDays.length === 0)) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx(Lightbulb, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground", children: empty })] }) })] }));
    }
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "bg-primary/5 border border-primary/20 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-primary mt-0.5 flex-shrink-0" }), _jsx("p", { className: "text-sm leading-relaxed", children: schedule.recommendation })] }) }), schedule.peakHours.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h4", { className: "font-semibold text-sm", children: peakHoursTitle })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: schedule.peakHours.map((hour) => (_jsxs(Badge, { variant: getScoreBadgeVariant(hour.score), className: "px-3 py-1", children: [_jsx(Clock, { className: "h-3 w-3 mr-1.5" }), hour.label, _jsxs("span", { className: `ml-2 text-xs ${getScoreColor(hour.score)}`, children: [Math.round(hour.score * 100), "%"] })] }, hour.hour))) }), _jsx("p", { className: "text-xs text-muted-foreground", children: peakHoursDescription })] })), schedule.peakDays.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h4", { className: "font-semibold text-sm", children: peakDaysTitle })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: schedule.peakDays.map((day) => (_jsxs(Badge, { variant: getScoreBadgeVariant(day.score), className: "px-3 py-1", children: [_jsx(TrendingUp, { className: "h-3 w-3 mr-1.5" }), day.label, _jsxs("span", { className: `ml-2 text-xs ${getScoreColor(day.score)}`, children: [Math.round(day.score * 100), "%"] })] }, day.day))) }), _jsx("p", { className: "text-xs text-muted-foreground", children: peakDaysDescription })] })), _jsx("div", { className: "border-t pt-4", children: _jsx("p", { className: "text-xs text-muted-foreground italic", children: tip }) })] })] }));
}
