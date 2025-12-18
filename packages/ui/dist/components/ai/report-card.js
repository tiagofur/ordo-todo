'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText, Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
const DEFAULT_LABELS = {
    scopes: {
        TASK_COMPLETION: 'Task Completion',
        WEEKLY_SCHEDULED: 'Weekly Report',
        MONTHLY_SCHEDULED: 'Monthly Report',
        PROJECT_SUMMARY: 'Project Summary',
        PERSONAL_ANALYSIS: 'Personal Analysis',
        default: 'Report',
    },
    metrics: {
        tasks: 'tasks',
        hoursWorked: 'h worked',
        pomodoros: 'pomodoros',
    },
    stats: {
        strengths: 'strengths',
        weaknesses: 'areas to improve',
        recommendations: 'recommendations',
    },
};
export function ReportCard({ report, onClick, locale = 'en', labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        scopes: { ...DEFAULT_LABELS.scopes, ...labels.scopes },
        metrics: { ...DEFAULT_LABELS.metrics, ...labels.metrics },
        stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
    };
    const getScopeLabel = (scope) => {
        return (t.scopes[scope] || t.scopes.default || scope);
    };
    const getScopeBadgeVariant = (scope) => {
        if (scope === 'WEEKLY_SCHEDULED')
            return 'default';
        if (scope === 'MONTHLY_SCHEDULED')
            return 'secondary';
        return 'outline';
    };
    const getScoreColor = (score) => {
        if (score >= 80)
            return 'text-green-600 dark:text-green-400';
        if (score >= 60)
            return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };
    const getScoreBgColor = (score) => {
        if (score >= 80)
            return 'bg-green-100 dark:bg-green-900/20';
        if (score >= 60)
            return 'bg-yellow-100 dark:bg-yellow-900/20';
        return 'bg-red-100 dark:bg-red-900/20';
    };
    const formatDate = (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return format(d, "d 'de' MMMM, yyyy", {
            locale: locale === 'es' ? es : enUS,
        });
    };
    return (_jsxs(Card, { className: `transition-all duration-200 ${onClick
            ? 'cursor-pointer hover:shadow-md hover:border-primary/50'
            : ''}`, onClick: onClick, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5 text-muted-foreground" }), _jsx(CardTitle, { className: "text-lg", children: getScopeLabel(report.scope) })] }), _jsxs(CardDescription, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-3 w-3" }), formatDate(report.generatedAt)] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsx(Badge, { variant: getScopeBadgeVariant(report.scope), children: getScopeLabel(report.scope) }), _jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(report.productivityScore)}`, children: [_jsx(TrendingUp, { className: `h-4 w-4 ${getScoreColor(report.productivityScore)}` }), _jsxs("span", { className: `font-bold ${getScoreColor(report.productivityScore)}`, children: [report.productivityScore, "%"] })] })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: report.summary }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [report.metricsSnapshot.tasksCompleted !== undefined && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" }), _jsxs("span", { children: [report.metricsSnapshot.tasksCompleted, " ", t.metrics.tasks] })] })), report.metricsSnapshot.minutesWorked !== undefined && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-blue-600" }), _jsxs("span", { children: [Math.round(report.metricsSnapshot.minutesWorked / 60), t.metrics.hoursWorked] })] })), report.metricsSnapshot.pomodorosCompleted !== undefined &&
                                report.metricsSnapshot.pomodorosCompleted > 0 && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-orange-600" }), _jsxs("span", { children: [report.metricsSnapshot.pomodorosCompleted, " ", t.metrics.pomodoros] })] }))] }), _jsxs("div", { className: "flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground", children: [_jsxs("span", { children: [report.strengths.length, " ", t.stats.strengths] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [report.weaknesses.length, " ", t.stats.weaknesses] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [report.recommendations.length, " ", t.stats.recommendations] })] })] })] }));
}
