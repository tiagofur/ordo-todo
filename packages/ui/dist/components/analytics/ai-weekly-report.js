'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../../utils/index.js';
import { Sparkles, FileText, TrendingUp, RefreshCw, Download, Share2, ChevronDown, ChevronRight, Zap, } from 'lucide-react';
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
    success: 'border-l-emerald-500 bg-emerald-500/5',
    info: 'border-l-blue-500 bg-blue-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    tip: 'border-l-purple-500 bg-purple-500/5',
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
export function AIWeeklyReport({ data = MOCK_DATA, onRefresh, className, onGenerateReport, labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
    };
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState([]);
    const [expandedSections, setExpandedSections] = useState([]);
    const [hasGenerated, setHasGenerated] = useState(false);
    const defaultGenerateReport = async (data) => {
        // Default English generation fallback if onGenerateReport is not provided
        // In a real app, logic should be passed via onGenerateReport to handle localized strings
        const completionRate = Math.round((data.completedTasks / (data.totalTasks || 1)) * 100);
        const sections = [];
        sections.push({
            id: 'summary',
            title: 'Weekly Summary',
            icon: FileText,
            type: 'info',
            content: [
                `You completed ${data.totalPomodoros} pomodoros and ${data.completedTasks} tasks.`,
                `Completion rate: ${completionRate}%.`,
                `Daily average: ${data.avgPomodorosPerDay.toFixed(1)} pomodoros.`,
            ],
        });
        // Simple implementation for fallback
        return sections;
    };
    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate delay
        if (!onGenerateReport)
            await new Promise((resolve) => setTimeout(resolve, 2000));
        const generator = onGenerateReport || defaultGenerateReport;
        const sections = await generator(data);
        setReport(sections);
        setExpandedSections(sections.map((s) => s.id));
        setHasGenerated(true);
        setIsGenerating(false);
    };
    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => prev.includes(sectionId)
            ? prev.filter((id) => id !== sectionId)
            : [...prev, sectionId]);
    };
    return (_jsxs(Card, { className: cn('p-6', className), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20", children: _jsx(Sparkles, { className: "h-6 w-6 text-purple-500" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: t.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.subtitle })] })] }), hasGenerated && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handleGenerate, children: [_jsx(RefreshCw, { className: cn('h-4 w-4 mr-2', isGenerating && 'animate-spin') }), t.regenerate] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), t.export] }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Share2, { className: "h-4 w-4" }) })] }))] }), !hasGenerated ? (_jsx("div", { className: "flex flex-col items-center justify-center py-12", children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 animate-spin", children: _jsx(Zap, { className: "h-8 w-8 text-purple-500" }) }), _jsx("p", { className: "text-lg font-medium mb-2", children: t.analyzing }), _jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => (_jsx("div", { className: "w-2 h-2 rounded-full bg-purple-500 animate-pulse", style: { animationDelay: `${i * 0.2}s` } }, i))) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4", children: _jsx(TrendingUp, { className: "h-8 w-8 text-purple-500/60" }) }), _jsx("p", { className: "text-muted-foreground mb-4 text-center max-w-md", children: t.emptyState }), _jsxs(Button, { onClick: handleGenerate, className: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600", children: [_jsx(Sparkles, { className: "h-4 w-4 mr-2" }), t.generate] })] })) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-3 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-2xl font-bold text-purple-500", children: data.totalPomodoros }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.pomodoros })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-500", children: data.completedTasks }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.tasks })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-2xl font-bold text-amber-500", children: data.streak }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.streak })] }), _jsxs("div", { className: "text-center p-3 rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-2xl font-bold text-blue-500", children: data.avgPomodorosPerDay.toFixed(1) }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.stats.average })] })] }), report.map((section) => (_jsxs("div", { className: cn('border-l-4 rounded-lg overflow-hidden transition-all', sectionColors[section.type]), children: [_jsxs("button", { className: "w-full flex items-center justify-between p-4 text-left", onClick: () => toggleSection(section.id), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: iconColors[section.type], children: _jsx(section.icon, { className: "h-5 w-5" }) }), _jsx("h3", { className: "font-semibold", children: section.title })] }), expandedSections.includes(section.id) ? (_jsx(ChevronDown, { className: "h-5 w-5 text-muted-foreground" })) : (_jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground" }))] }), expandedSections.includes(section.id) && (_jsx("ul", { className: "px-4 pb-4 space-y-2", children: section.content.map((item, i) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" }), _jsx("span", { children: item })] }, i))) }))] }, section.id)))] }))] }));
}
