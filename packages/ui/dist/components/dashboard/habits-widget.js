import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sparkles, Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    title: 'Daily Habits',
    todayProgress: (completed, total) => `${completed}/${total} completed today`,
    viewAll: 'View all',
    noHabits: 'No habits for today',
    createHabit: 'Create habit',
    moreHabits: (count) => `+${count} more`,
};
export function HabitsWidget({ habits, summary, accentColor = '#10B981', isLoading = false, onToggleHabit, onViewAll, onCreateHabit, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    return (_jsxs("div", { className: cn('group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300', 'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20'), children: [_jsxs("div", { className: "p-4 border-b border-border/50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl text-white", style: { backgroundColor: accentColor }, children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: t.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.todayProgress(summary.completed, summary.total) })] })] }), onViewAll && (_jsxs("button", { onClick: onViewAll, className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors", children: [t.viewAll, _jsx(ChevronRight, { className: "h-3 w-3" })] }))] }), summary.total > 0 && (_jsx("div", { className: "mt-3", children: _jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: {
                                    width: `${summary.percentage}%`,
                                    backgroundColor: accentColor,
                                } }) }) }))] }), _jsx("div", { className: "p-2", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary" }) })) : habits.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center", children: [_jsx(Sparkles, { className: "h-8 w-8 text-muted-foreground/50 mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.noHabits }), onCreateHabit && (_jsx("button", { onClick: onCreateHabit, className: "mt-2 text-xs font-medium hover:underline", style: { color: accentColor }, children: t.createHabit }))] })) : (_jsxs("div", { className: "space-y-1", children: [habits.slice(0, 4).map((habit, index) => {
                            const isCompleted = habit.completions && habit.completions.length > 0;
                            return (_jsxs("div", { className: cn('flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer', isCompleted ? 'bg-muted/30' : 'hover:bg-muted/50'), style: { animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards` }, children: [_jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            onToggleHabit?.(habit.id, !!isCompleted);
                                        }, disabled: habit.isPaused, className: cn('flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0', isCompleted
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-muted-foreground/30 hover:border-emerald-500'), children: isCompleted && _jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) }), _jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-lg text-white shrink-0", style: { backgroundColor: habit.color || accentColor }, children: _jsx(Sparkles, { className: "h-3 w-3" }) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: cn('text-sm truncate transition-all', isCompleted && 'line-through opacity-60'), children: habit.name }) }), habit.currentStreak > 0 && (_jsxs("div", { className: "flex items-center gap-0.5 text-orange-500 shrink-0", children: [_jsx(Flame, { className: "h-3 w-3" }), _jsx("span", { className: "text-xs font-medium", children: habit.currentStreak })] }))] }, habit.id));
                        }), habits.length > 4 && onViewAll && (_jsx("button", { onClick: onViewAll, className: "block w-full text-center py-2 text-xs text-muted-foreground hover:text-foreground transition-colors", children: t.moreHabits(habits.length - 4) }))] })) }), _jsx("div", { className: "absolute -right-8 -top-8 opacity-5 pointer-events-none", style: { color: accentColor }, children: _jsx(Sparkles, { className: "h-32 w-32" }) }), _jsx("style", { children: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      ` })] }));
}
