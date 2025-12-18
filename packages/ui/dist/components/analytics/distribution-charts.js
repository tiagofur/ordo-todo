'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../utils/index.js';
// Chart colors for generic data visualization
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
// Status colors (can be overridden via props)
const DEFAULT_STATUS_COLORS = {
    TODO: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
};
/**
 * ProjectTimeChart - Pie chart showing time distribution by project
 *
 * @example
 * <ProjectTimeChart
 *   data={[{ name: 'Project A', value: 120 }, { name: 'Project B', value: 60 }]}
 *   title={t('title')}
 * />
 */
export function ProjectTimeChart({ data, title = 'Time by Project', noDataMessage = 'No data available', tooltipLabel = 'Time', className = '', }) {
    if (!data || data.length === 0) {
        return (_jsxs("div", { className: cn('rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]', className), children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), _jsx("p", { className: "text-muted-foreground", children: noDataMessage })] }));
    }
    return (_jsxs("div", { className: cn('rounded-2xl border border-border/50 bg-card p-6', className), children: [_jsx("h3", { className: "text-lg font-semibold mb-6", children: title }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 80, fill: "#8884d8", label: ({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`, children: data.map((_, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [`${value} min`, tooltipLabel], itemStyle: { color: 'var(--foreground)' }, contentStyle: {
                                    backgroundColor: 'var(--popover)',
                                    borderColor: 'var(--border)',
                                } }), _jsx(Legend, {})] }) }) })] }));
}
/**
 * TaskStatusChart - Donut chart showing task status distribution
 *
 * @example
 * const statusColors = { TODO: '#gray', IN_PROGRESS: '#blue', COMPLETED: '#green' };
 *
 * <TaskStatusChart
 *   data={[{ status: 'TODO', count: 5 }, { status: 'COMPLETED', count: 10 }]}
 *   statusColors={statusColors}
 *   title={t('title')}
 * />
 */
export function TaskStatusChart({ data, title = 'Task Status', noDataMessage = 'No tasks', statusColors = DEFAULT_STATUS_COLORS, className = '', }) {
    const getStatusHex = (status) => {
        return statusColors[status] || '#8884d8';
    };
    if (!data || data.length === 0) {
        return (_jsxs("div", { className: cn('rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]', className), children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), _jsx("p", { className: "text-muted-foreground", children: noDataMessage })] }));
    }
    return (_jsxs("div", { className: cn('rounded-2xl border border-border/50 bg-card p-6', className), children: [_jsx("h3", { className: "text-lg font-semibold mb-6", children: title }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "count", nameKey: "status", cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, paddingAngle: 5, children: data.map((entry, index) => (_jsx(Cell, { fill: getStatusHex(entry.status) }, `cell-${index}`))) }), _jsx(Tooltip, { itemStyle: { color: 'var(--foreground)' }, contentStyle: {
                                    backgroundColor: 'var(--popover)',
                                    borderColor: 'var(--border)',
                                } }), _jsx(Legend, {})] }) }) })] }));
}
