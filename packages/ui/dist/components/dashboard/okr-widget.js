import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OKR Widget - Shared Dashboard Component
 *
 * Displays a summary of Objectives and Key Results with progress visualization.
 * This component is designed to be used across Web, Desktop, and potentially Mobile.
 *
 * @example
 * ```tsx
 * import { OkrWidget } from '@ordo-todo/ui';
 *
 * <OkrWidget
 *   summary={okrSummary}
 *   onNavigate={(path) => router.push(path)}
 *   labels={{ title: t('Goals.title') }}
 * />
 * ```
 */
import { Target, TrendingUp, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    title: 'Goals & OKRs',
    averageProgress: 'average progress',
    viewAll: 'View all',
    total: 'Total',
    completed: 'completed',
    okrsAtRisk: 'at risk',
    left: 'left',
    noObjectives: 'No objectives yet',
    createObjective: 'Create objective',
};
export function OkrWidget({ summary, isLoading = false, accentColor = '#ec4899', // Pink as default for Goals
onNavigate, labels = {}, className, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const objectives = (summary?.objectives ?? []).slice(0, 3);
    const averageProgress = summary?.averageProgress ?? 0;
    const total = summary?.total ?? 0;
    const atRisk = summary?.atRisk ?? 0;
    // Loading skeleton
    if (isLoading) {
        return (_jsx("div", { className: cn('relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4', 'flex items-center justify-center min-h-[200px]', className), children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary" }) }));
    }
    return (_jsxs(motion.div, { whileHover: {
            y: -3,
            borderColor: `${accentColor}70`,
            boxShadow: `0 12px 28px -6px ${accentColor}25`,
        }, className: cn('group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-xs h-full', className), children: [_jsx("div", { className: "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all opacity-5 group-hover:opacity-10 pointer-events-none", style: { backgroundColor: accentColor } }), _jsxs("div", { className: "p-4 border-b border-border/50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0", style: {
                                            backgroundColor: `${accentColor}15`,
                                            color: accentColor,
                                            border: `1px solid ${accentColor}25`,
                                        }, children: _jsx(Target, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-foreground", children: t.title }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [_jsx(TrendingUp, { className: "h-3 w-3" }), _jsxs("span", { className: "tabular-nums font-medium text-foreground", children: [Math.round(averageProgress), "%"] }), " ", t.averageProgress] })] })] }), onNavigate && (_jsxs("button", { onClick: () => onNavigate('/goals'), className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer", children: [t.viewAll, _jsx(ChevronRight, { className: "h-3 w-3" })] }))] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-1", children: [_jsxs("span", { children: [summary?.completed ?? 0, " ", t.completed] }), _jsxs("span", { children: [total, " ", t.total.toLowerCase()] })] }), _jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: {
                                        width: `${averageProgress}%`,
                                        backgroundColor: accentColor,
                                    } }) })] })] }), atRisk > 0 && (_jsxs("div", { className: "px-4 py-2 bg-red-500/10 border-b border-red-500/10 flex items-center gap-2 text-xs text-red-500 font-medium", children: [_jsx(AlertTriangle, { className: "h-3 w-3" }), atRisk, " ", t.okrsAtRisk] })), _jsx("div", { className: "p-2 flex-1", children: objectives.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center h-full", children: [_jsx(Target, { className: "h-8 w-8 text-muted-foreground/50 mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.noObjectives }), onNavigate && (_jsx("button", { onClick: () => onNavigate('/goals'), className: "mt-2 text-xs font-medium hover:underline", style: { color: accentColor }, children: t.createObjective }))] })) : (_jsx("div", { className: "space-y-1", children: objectives.map((objective, index) => (_jsxs("div", { className: "group/item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer", onClick: () => onNavigate?.(`/goals/${objective.id}`), style: {
                            animation: `fadeInSlide 0.3s ease-out ${index * 0.05}s backwards`,
                        }, children: [_jsxs("div", { className: "relative h-8 w-8 flex items-center justify-center shrink-0", children: [_jsxs("svg", { className: "h-full w-full -rotate-90", viewBox: "0 0 36 36", children: [_jsx("path", { className: "fill-none stroke-muted/30", strokeWidth: "3", d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" }), _jsx("path", { className: "fill-none transition-all duration-500 ease-out", strokeWidth: "3", strokeDasharray: `${objective.progress}, 100`, strokeLinecap: "round", style: { stroke: objective.color || accentColor }, d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" })] }), _jsx("span", { className: "absolute text-[9px] font-semibold", children: Math.round(objective.progress) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate group-hover/item:text-primary transition-colors", children: objective.title }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-0.5", children: [_jsx(Clock, { className: "h-2.5 w-2.5" }), objective.daysRemaining, "d ", t.left] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [objective.keyResultsCount, " KRs"] })] })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" })] }, objective.id))) })) }), _jsx("div", { className: "absolute -right-8 -bottom-8 opacity-5 pointer-events-none", style: { color: accentColor }, children: _jsx(Target, { className: "h-32 w-32" }) }), _jsx("style", { children: `
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      ` })] }));
}
