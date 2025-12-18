'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, } from 'recharts';
import { Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.js';
function getBarColor(score) {
    if (score >= 80)
        return '#22c55e';
    if (score >= 60)
        return '#eab308';
    if (score >= 40)
        return '#f97316';
    return '#ef4444';
}
/**
 * PeakHoursChart - Platform-agnostic peak productivity hours chart
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: profile, isLoading } = useAIProfile();
 *
 * <PeakHoursChart
 *   peakHours={profile?.peakHours}
 *   isLoading={isLoading}
 *   labels={{ title: t('title') }}
 * />
 */
export function PeakHoursChart({ peakHours, isLoading = false, labels = {}, className = '', }) {
    const { title = 'Peak Productivity Hours', description = 'When you work best throughout the day', empty = 'Complete more sessions to see your peak hours', yAxis = 'Productivity %', tooltip = 'Productivity', legendHigh = 'High (80%+)', legendGood = 'Good (60%+)', legendFair = 'Fair (40%+)', legendLow = 'Low', } = labels;
    if (isLoading) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { children: _jsx(Skeleton, { className: "h-[300px] w-full" }) })] }));
    }
    if (!peakHours || Object.keys(peakHours).length === 0) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { children: _jsx("div", { className: "flex items-center justify-center h-[300px]", children: _jsx("p", { className: "text-muted-foreground text-sm", children: empty }) }) })] }));
    }
    const chartData = Object.entries(peakHours)
        .map(([hour, score]) => {
        const hourNum = parseInt(hour);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
        return {
            hour: hourNum,
            label: `${displayHour}${period}`,
            score: typeof score === 'number' ? score * 100 : 0,
        };
    })
        .sort((a, b) => a.hour - b.hour);
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), title] }), _jsx(CardDescription, { children: description })] }), _jsxs(CardContent, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "label", tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }, tickLine: { stroke: 'hsl(var(--border))' } }), _jsx(YAxis, { tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }, tickLine: { stroke: 'hsl(var(--border))' }, domain: [0, 100], label: {
                                        value: yAxis,
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
                                    } }), _jsx(Tooltip, { content: ({ active, payload }) => {
                                        if (active && payload && payload.length > 0) {
                                            const data = payload[0].payload;
                                            return (_jsx("div", { className: "rounded-lg border bg-background p-3 shadow-md", children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-sm font-semibold", children: data.label }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [tooltip, ": ", Math.round(data.score), "%"] })] }) }));
                                        }
                                        return null;
                                    } }), _jsx(Bar, { dataKey: "score", radius: [4, 4, 0, 0], children: chartData.map((entry, index) => (_jsx(Cell, { fill: getBarColor(entry.score) }, `cell-${index}`))) })] }) }), _jsxs("div", { className: "flex items-center justify-center gap-4 mt-4 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded", style: { backgroundColor: '#22c55e' } }), _jsx("span", { className: "text-muted-foreground", children: legendHigh })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded", style: { backgroundColor: '#eab308' } }), _jsx("span", { className: "text-muted-foreground", children: legendGood })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded", style: { backgroundColor: '#f97316' } }), _jsx("span", { className: "text-muted-foreground", children: legendFair })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded", style: { backgroundColor: '#ef4444' } }), _jsx("span", { className: "text-muted-foreground", children: legendLow })] })] })] })] }));
}
