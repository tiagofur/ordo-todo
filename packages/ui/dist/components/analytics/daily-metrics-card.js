import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card.js';
import { Skeleton } from '../ui/skeleton.js';
function defaultFormatDuration(minutes) {
    if (minutes < 60)
        return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
function defaultGetFocusScoreColor(score) {
    if (score >= 80)
        return 'text-green-600';
    if (score >= 60)
        return 'text-yellow-600';
    if (score >= 40)
        return 'text-orange-600';
    return 'text-red-600';
}
/**
 * DailyMetricsCard - Platform-agnostic daily metrics display
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: metrics } = useDailyMetrics({ startDate, endDate });
 * const { data: timerStats } = useTimerStats({ startDate, endDate });
 *
 * <DailyMetricsCard
 *   metrics={metrics?.[0]}
 *   timerStats={timerStats}
 *   isLoading={isLoading}
 *   formatDuration={formatDuration}
 *   labels={{ title: t('title') }}
 * />
 */
export function DailyMetricsCard({ metrics, timerStats, isLoading = false, date, formatDuration = defaultFormatDuration, getFocusScoreColorClass = defaultGetFocusScoreColor, labels = {}, className = '', }) {
    const { title = 'Daily Summary', today = 'Today', completed = 'Completed', time = 'Time', pomodoros = 'Pomodoros', focus = 'Focus', } = labels;
    const formatFocusScore = (score) => {
        if (score === undefined || score === null)
            return 'N/A';
        return `${Math.round(score * 100)}%`;
    };
    const getFocusScoreTextClass = (score) => {
        if (score === undefined || score === null)
            return 'text-muted-foreground';
        return getFocusScoreColorClass(Math.round(score * 100));
    };
    const formattedDate = date
        ? date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : today;
    if (isLoading) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { children: formattedDate })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-20" }), _jsx(Skeleton, { className: "h-8 w-16" })] }, i))) }) })] }));
    }
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { children: formattedDate })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), _jsx("span", { children: completed })] }), _jsxs("div", { className: "text-3xl font-bold", children: [metrics?.tasksCompleted || 0, _jsxs("span", { className: "text-sm text-muted-foreground ml-1", children: ["/ ", metrics?.tasksCreated || 0] })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { children: time })] }), _jsx("div", { className: "text-3xl font-bold", children: formatDuration(timerStats?.totalMinutesWorked || 0) })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Target, { className: "h-4 w-4" }), _jsx("span", { children: pomodoros })] }), _jsx("div", { className: "text-3xl font-bold", children: timerStats?.pomodorosCompleted || 0 })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx("span", { children: focus })] }), _jsx("div", { className: `text-3xl font-bold ${getFocusScoreTextClass(metrics?.focusScore)}`, children: formatFocusScore(metrics?.focusScore) })] })] }) })] }));
}
