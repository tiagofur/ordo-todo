import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { Skeleton } from '../ui/skeleton.js';
function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * WeeklyChart - Platform-agnostic weekly activity chart
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: metrics, isLoading } = useWeeklyMetrics({ weekStart });
 *
 * <WeeklyChart
 *   metrics={metrics}
 *   isLoading={isLoading}
 *   weekStart={weekStart}
 *   labels={{ title: t('title') }}
 * />
 */
export function WeeklyChart({ metrics = [], isLoading = false, weekStart, labels = {}, locale = 'en-US', className = '', }) {
    const { title = 'Weekly Activity', description = 'Your productivity this week', weekOf = 'Week of', tasks = 'Tasks', minutes = 'Minutes', tasksCompleted = 'Tasks Completed', minutesWorked = 'Minutes Worked', tooltipTasks = 'Tasks', tooltipTime = 'Time', } = labels;
    const formatChartData = () => {
        // Create a map of existing metrics
        const metricsMap = new Map(metrics.map((m) => [new Date(m.date).toISOString().split('T')[0], m]));
        // Fill in all 7 days of the week
        const start = weekStart || getStartOfWeek();
        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const metric = metricsMap.get(dateStr);
            chartData.push({
                day: date.toLocaleDateString(locale, { weekday: 'short' }),
                tasksCompleted: metric?.tasksCompleted || 0,
                minutesWorked: metric?.minutesWorked || 0,
                date: dateStr,
            });
        }
        return chartData;
    };
    const chartData = formatChartData();
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length && payload[0]) {
            const data = payload[0].payload;
            return (_jsxs("div", { className: "bg-background border border-border rounded-lg shadow-lg p-3", children: [_jsx("p", { className: "font-semibold text-sm mb-2", children: data.day }), _jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "text-sm", children: [_jsxs("span", { className: "text-blue-500", children: [tooltipTasks, ": "] }), _jsx("span", { className: "font-medium", children: data.tasksCompleted })] }), _jsxs("p", { className: "text-sm", children: [_jsxs("span", { className: "text-green-500", children: [tooltipTime, ": "] }), _jsxs("span", { className: "font-medium", children: [Math.floor(data.minutesWorked / 60), "h ", data.minutesWorked % 60, "m"] })] })] })] }));
        }
        return null;
    };
    if (isLoading) {
        return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { children: description })] }), _jsx(CardContent, { children: _jsx(Skeleton, { className: "h-[300px] w-full" }) })] }));
    }
    return (_jsxs(Card, { className: className, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { children: weekStart
                            ? `${weekOf} ${weekStart.toLocaleDateString(locale)}`
                            : description })] }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "day", className: "text-xs", tick: { fill: 'currentColor' } }), _jsx(YAxis, { yAxisId: "left", className: "text-xs", tick: { fill: 'currentColor' }, label: { value: tasks, angle: -90, position: 'insideLeft' } }), _jsx(YAxis, { yAxisId: "right", orientation: "right", className: "text-xs", tick: { fill: 'currentColor' }, label: { value: minutes, angle: 90, position: 'insideRight' } }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, {}), _jsx(Bar, { yAxisId: "left", dataKey: "tasksCompleted", fill: "hsl(var(--primary))", name: tasksCompleted, radius: [4, 4, 0, 0] }), _jsx(Bar, { yAxisId: "right", dataKey: "minutesWorked", fill: "hsl(var(--chart-2))", name: minutesWorked, radius: [4, 4, 0, 0] })] }) }) })] }));
}
