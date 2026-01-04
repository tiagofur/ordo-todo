import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    title: 'Weekly Activity',
    totalPomodoros: 'Total Pomodoros',
    totalTime: 'Total Time',
    dayLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};
export function WeeklyActivityWidget({ days, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const dayLabels = t.dayLabels || DEFAULT_LABELS.dayLabels;
    // Ensure we have 7 days
    const weekData = days.slice(-7);
    // Find max for scaling
    const maxPomodoros = Math.max(...weekData.map((d) => d.pomodoros), 1);
    const totalPomodoros = weekData.reduce((sum, d) => sum + d.pomodoros, 0);
    const totalHours = Math.round(weekData.reduce((sum, d) => sum + d.totalMinutes, 0) / 60);
    return (_jsxs("div", { className: "rounded-2xl border border-border/50 bg-card p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: t.title }), _jsx("div", { className: "flex items-end justify-between gap-2 h-32", children: weekData.map((day, index) => {
                    const height = (day.pomodoros / maxPomodoros) * 100;
                    const isToday = index === weekData.length - 1;
                    return (_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsxs("div", { className: "relative w-full flex justify-center mb-2", children: [_jsx("div", { className: cn('w-8 rounded-t-lg transition-all duration-300', isToday ? 'bg-primary' : 'bg-primary/30', 'hover:bg-primary/80'), style: { height: `${Math.max(height, 4)}px` } }), day.pomodoros > 0 && (_jsx("span", { className: "absolute -top-5 text-xs font-medium", children: day.pomodoros }))] }), _jsx("span", { className: cn('text-xs', isToday ? 'text-primary font-bold' : 'text-muted-foreground'), children: dayLabels[index] })] }, day.date));
                }) }), _jsxs("div", { className: "mt-4 pt-4 border-t border-border/50 flex justify-between text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted-foreground", children: t.totalPomodoros }), _jsx("p", { className: "text-xl font-bold", children: totalPomodoros })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-muted-foreground", children: t.totalTime }), _jsxs("p", { className: "text-xl font-bold", children: [totalHours, "h"] })] })] })] }));
}
