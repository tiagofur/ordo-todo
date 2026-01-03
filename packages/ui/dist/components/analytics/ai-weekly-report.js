import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from '../../utils/index.js';
import { Sparkles, TrendingUp, RefreshCw, Download, Share2, ChevronDown, ChevronRight, Zap, } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Card } from '../ui/card.js';
const MOCK_DATA = {
    totalPomodoros: 32,
    totalTasks: 45,
    completedTasks: 28,
    streak: 5,
    avgPomodorosPerDay: 4.5,
    peakHour: 10,
    topProject: { name: 'Proyecto Alpha', tasks: 12 },
    weeklyData: [
        { day: 'Mon', pomodoros: 6, tasks: 5 },
        { day: 'Tue', pomodoros: 8, tasks: 7 },
        { day: 'Wed', pomodoros: 4, tasks: 3 },
        { day: 'Thu', pomodoros: 7, tasks: 6 },
        { day: 'Fri', pomodoros: 5, tasks: 4 },
        { day: 'Sat', pomodoros: 2, tasks: 2 },
        { day: 'Sun', pomodoros: 0, tasks: 1 },
    ],
};
const sectionColors = {
    success: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950',
    info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950',
    warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950',
    tip: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950',
};
const iconColors = {
    success: 'text-emerald-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
    tip: 'text-purple-500',
};
const DEFAULT_LABELS = {
    title: 'AI Weekly Report',
    subtitle: 'Smart productivity analysis',
    generate: 'Generate Report',
    analyzing: 'Analyzing your week...',
    regenerate: 'Regenerate',
    export: 'Export',
    emptyState: 'Generate a smart report based on your weekly activity. Includes summary, achievements, areas for improvement, and personalized recommendations.',
    stats: {
        pomodoros: 'Pomodoros',
        tasks: 'Tasks',
        streak: 'Streak 🔥',
        average: 'Avg/day',
    },
};
/**
 * AIWeeklyReport - Platform-agnostic AI report component.
 * Purely presentational - state must be managed by parent.
 */
export function AIWeeklyReport({ data = MOCK_DATA, onRefresh, className, labels = {}, isGenerating = false, hasGenerated = false, report = [], expandedSections = [], onGenerate, onToggleSection, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
    };
    return (_jsxs(Card, { className: cn('p-6', className), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300", children: _jsx(Sparkles, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: t.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.subtitle })] })] }), hasGenerated && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: onGenerate, children: [_jsx(RefreshCw, { className: cn('h-4 w-4 mr-2', isGenerating && 'animate-spin') }), t.regenerate] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), t.export] }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Share2, { className: "h-4 w-4" }) })] }))] }), !hasGenerated ? (_jsx("div", { className: "flex flex-col items-center justify-center py-12", children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4 rounded-full bg-purple-50 dark:bg-purple-900/30 mb-4 animate-spin border border-purple-200 dark:border-purple-800", children: _jsx(Zap, { className: "h-8 w-8 text-purple-500" }) }), _jsx("p", { className: "text-lg font-medium mb-2", children: t.analyzing }), _jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => (_jsx("div", { className: "w-2 h-2 rounded-full bg-purple-500 animate-pulse", style: { animationDelay: `${i * 0.2}s` } }, i))) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4 rounded-full bg-purple-50 dark:bg-purple-900/30 mb-4 border border-purple-200 dark:border-purple-800", children: _jsx(TrendingUp, { className: "h-8 w-8 text-purple-500" }) }), _jsx("p", { className: "text-muted-foreground mb-4 text-center max-w-md", children: t.emptyState }), _jsxs(Button, { onClick: onGenerate, className: "bg-purple-600 hover:bg-purple-700 text-white border-0", children: [_jsx(Sparkles, { className: "h-4 w-4 mr-2" }), t.generate] })] })) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border", children: [_jsx("p", { className: "text-2xl font-bold text-purple-500", children: data.totalPomodoros }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.pomodoros })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-500", children: data.completedTasks }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.tasks })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border", children: [_jsx("p", { className: "text-2xl font-bold text-amber-500", children: data.streak }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.streak })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border", children: [_jsx("p", { className: "text-2xl font-bold text-blue-500", children: data.avgPomodorosPerDay.toFixed(1) }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.average })] })] }), report.map((section) => (_jsxs("div", { className: cn('border-l-4 rounded-lg overflow-hidden transition-all', sectionColors[section.type]), children: [_jsxs("button", { className: "w-full flex items-center justify-between p-4 text-left", onClick: () => onToggleSection?.(section.id), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: iconColors[section.type], children: _jsx(section.icon, { className: "h-5 w-5" }) }), _jsx("h3", { className: "font-semibold text-foreground", children: section.title })] }), expandedSections.includes(section.id) ? (_jsx(ChevronDown, { className: "h-5 w-5 text-muted-foreground" })) : (_jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground" }))] }), expandedSections.includes(section.id) && (_jsx("ul", { className: "px-4 pb-4 space-y-2", children: section.content.map((item, i) => (_jsxs("li", { className: "flex items-start gap-2 text-sm text-foreground/80", children: [_jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" }), _jsx("span", { children: item })] }, i))) }))] }, section.id)))] }))] }));
}
