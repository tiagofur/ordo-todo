import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, Calendar, Target, Coffee, TrendingUp, ChevronLeft, ChevronRight, Filter, Pause, CheckCircle2, XCircle, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select.js';
import { Skeleton } from '../ui/skeleton.js';
import { cn } from '../../utils/index.js';
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
const SESSION_TYPE_COLORS = {
    WORK: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    SHORT_BREAK: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    LONG_BREAK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    CONTINUOUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};
function getSessionTypeIcon(type) {
    switch (type) {
        case 'WORK':
            return _jsx(Target, { className: "h-4 w-4" });
        case 'SHORT_BREAK':
        case 'LONG_BREAK':
            return _jsx(Coffee, { className: "h-4 w-4" });
        case 'CONTINUOUS':
            return _jsx(Clock, { className: "h-4 w-4" });
        default:
            return _jsx(Clock, { className: "h-4 w-4" });
    }
}
function StatCard({ icon, label, value, isLoading, }) {
    return (_jsx(Card, { children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [icon, _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: label }), isLoading ? (_jsx(Skeleton, { className: "h-6 w-16 mt-1" })) : (_jsx("p", { className: "text-xl font-bold", children: value }))] })] }) }) }));
}
/**
 * SessionHistory - Platform-agnostic timer session history display
 *
 * All data fetching handled externally via props.
 *
 * @example
 * const { data: history, isLoading } = useSessionHistory(filters);
 * const { data: stats } = useTimerStats(filters);
 *
 * <SessionHistory
 *   historyData={history}
 *   statsData={stats}
 *   isLoadingHistory={isLoading}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   formatDate={(d) => format(d, 'PPp')}
 *   labels={{ ... }}
 * />
 */
export function SessionHistory({ historyData, statsData, isLoadingHistory = false, isLoadingStats = false, hasError = false, filters, onFiltersChange, formatDate = (d) => String(d), formatDay = (d) => String(d).substring(0, 3), labels = {}, }) {
    const { error = 'Error loading history', statsPomodoros = 'Pomodoros', statsTotalTime = 'Total Time', statsFocusScore = 'Focus Score', statsCompletionRate = 'Completion Rate', filtersTitle = 'Filters', filtersType = 'Type', filtersAllTypes = 'All Types', filtersStatus = 'Status', filtersAllStatus = 'All', filtersCompletedOnly = 'Completed Only', sessionsTitle = 'Sessions', sessionsCount = 'sessions', sessionsEmpty = 'No sessions found', sessionPause = 'pause', sessionPauses = 'pauses', typesWork = 'Work', typesShortBreak = 'Short Break', typesLongBreak = 'Long Break', typesContinuous = 'Continuous', paginationShowing = (from, to, total) => `Showing ${from}-${to} of ${total}`, chartTitle = 'Daily Activity', } = labels;
    const getTypeLabel = (type) => {
        switch (type.toLowerCase()) {
            case 'work': return typesWork;
            case 'short_break': return typesShortBreak;
            case 'long_break': return typesLongBreak;
            case 'continuous': return typesContinuous;
            default: return type;
        }
    };
    const handlePageChange = (newPage) => {
        onFiltersChange({ ...filters, page: newPage });
    };
    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };
    if (hasError) {
        return _jsx("div", { className: "text-center py-8 text-muted-foreground", children: error });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(StatCard, { icon: _jsx(Target, { className: "h-5 w-5 text-red-500" }), label: statsPomodoros, value: statsData?.pomodorosCompleted ?? 0, isLoading: isLoadingStats }), _jsx(StatCard, { icon: _jsx(Clock, { className: "h-5 w-5 text-blue-500" }), label: statsTotalTime, value: formatDuration(statsData?.totalMinutesWorked ?? 0), isLoading: isLoadingStats }), _jsx(StatCard, { icon: _jsx(TrendingUp, { className: "h-5 w-5 text-green-500" }), label: statsFocusScore, value: `${statsData?.avgFocusScore ?? 0}%`, isLoading: isLoadingStats }), _jsx(StatCard, { icon: _jsx(CheckCircle2, { className: "h-5 w-5 text-purple-500" }), label: statsCompletionRate, value: `${Math.round((statsData?.completionRate ?? 0) * 100)}%`, isLoading: isLoadingStats })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(Filter, { className: "h-5 w-5" }), filtersTitle] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs(Select, { value: filters.type ?? 'all', onValueChange: (value) => handleFilterChange('type', value === 'all' ? undefined : value), children: [_jsx(SelectTrigger, { className: "w-[150px]", children: _jsx(SelectValue, { placeholder: filtersType }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: filtersAllTypes }), _jsx(SelectItem, { value: "WORK", children: typesWork }), _jsx(SelectItem, { value: "SHORT_BREAK", children: typesShortBreak }), _jsx(SelectItem, { value: "LONG_BREAK", children: typesLongBreak }), _jsx(SelectItem, { value: "CONTINUOUS", children: typesContinuous })] })] }), _jsxs(Select, { value: filters.completedOnly ? 'completed' : 'all', onValueChange: (value) => handleFilterChange('completedOnly', value === 'completed'), children: [_jsx(SelectTrigger, { className: "w-[150px]", children: _jsx(SelectValue, { placeholder: filtersStatus }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: filtersAllStatus }), _jsx(SelectItem, { value: "completed", children: filtersCompletedOnly })] })] }), _jsx("input", { type: "date", value: filters.startDate ?? '', onChange: (e) => handleFilterChange('startDate', e.target.value), className: "px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-800 text-foreground" }), _jsx("input", { type: "date", value: filters.endDate ?? '', onChange: (e) => handleFilterChange('endDate', e.target.value), className: "px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-800 text-foreground" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(Calendar, { className: "h-5 w-5" }), sessionsTitle, historyData && (_jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: ["(", historyData.total, " ", sessionsCount, ")"] }))] }) }), _jsxs(CardContent, { children: [isLoadingHistory ? (_jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsx(Skeleton, { className: "h-20 w-full" }, i))) })) : historyData?.sessions.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: sessionsEmpty })) : (_jsx("div", { className: "space-y-3", children: historyData?.sessions.map((session, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors animate-in fade-in slide-in-from-bottom-2", style: { animationDelay: `${index * 50}ms` }, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn('p-2 rounded-full', SESSION_TYPE_COLORS[session.type]), children: getSessionTypeIcon(session.type) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: cn('text-xs', SESSION_TYPE_COLORS[session.type]), children: getTypeLabel(session.type) }), session.wasCompleted ? (_jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" })) : session.wasInterrupted ? (_jsx(XCircle, { className: "h-4 w-4 text-destructive" })) : null] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: formatDate(session.startedAt) })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-lg", children: formatDuration(session.duration) }), session.pauseCount > 0 && (_jsxs("p", { className: "text-xs text-muted-foreground flex items-center justify-end gap-1", children: [_jsx(Pause, { className: "h-3 w-3" }), session.pauseCount, " ", session.pauseCount === 1 ? sessionPause : sessionPauses] }))] })] }, session.id))) })), historyData && historyData.totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between mt-6 pt-4 border-t", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: paginationShowing((filters.page - 1) * filters.limit + 1, Math.min(filters.page * filters.limit, historyData.total), historyData.total) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(filters.page - 1), disabled: filters.page === 1, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("span", { className: "text-sm", children: [filters.page, " / ", historyData.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(filters.page + 1), disabled: filters.page >= historyData.totalPages, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }))] })] }), statsData?.dailyBreakdown && statsData.dailyBreakdown.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), chartTitle] }) }), _jsx(CardContent, { children: _jsx("div", { className: "flex items-end justify-between gap-2 h-32", children: statsData.dailyBreakdown.map((day) => {
                                const maxMinutes = Math.max(...statsData.dailyBreakdown.map((d) => d.minutesWorked));
                                const height = maxMinutes > 0 ? (day.minutesWorked / maxMinutes) * 100 : 0;
                                return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [_jsx("div", { style: { height: `${height}%`, transition: 'height 0.5s ease-out' }, className: "w-full bg-primary/80 rounded-t-md min-h-1", title: `${formatDuration(day.minutesWorked)} - ${day.pomodorosCompleted} pomodoros` }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatDay(day.date) })] }, day.date));
                            }) }) })] }))] }));
}
