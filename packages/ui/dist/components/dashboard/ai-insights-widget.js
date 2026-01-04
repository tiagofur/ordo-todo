import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sparkles, X, ChevronRight, Lightbulb, Clock, Target, TrendingUp, Coffee, AlertTriangle, PartyPopper, Zap, Heart, RefreshCw, } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { cn } from '../../utils/index.js';
const INSIGHT_ICONS = {
    PRODUCTIVITY_PEAK: Clock,
    UPCOMING_DEADLINES: AlertTriangle,
    SUGGESTED_BREAKS: Coffee,
    COMPLETION_CELEBRATION: PartyPopper,
    WORKLOAD_IMBALANCE: TrendingUp,
    ENERGY_OPTIMIZATION: Zap,
    REST_SUGGESTION: Heart,
    ACHIEVEMENT_CELEBRATION: Target,
};
const INSIGHT_COLORS = {
    PRODUCTIVITY_PEAK: 'text-blue-500 bg-blue-500/10',
    UPCOMING_DEADLINES: 'text-orange-500 bg-orange-500/10',
    SUGGESTED_BREAKS: 'text-green-500 bg-green-500/10',
    COMPLETION_CELEBRATION: 'text-yellow-500 bg-yellow-500/10',
    WORKLOAD_IMBALANCE: 'text-red-500 bg-red-500/10',
    ENERGY_OPTIMIZATION: 'text-purple-500 bg-purple-500/10',
    REST_SUGGESTION: 'text-pink-500 bg-pink-500/10',
    ACHIEVEMENT_CELEBRATION: 'text-emerald-500 bg-emerald-500/10',
};
export function AIInsightsWidget({ insights, isLoading = false, isRefreshing = false, onRefresh, onDismiss, onAction, className, labels = {}, }) {
    const { title = 'AI Insights', emptyTitle = 'No insights available', emptyDescription = 'Keep working and AI will provide suggestions', viewAll: _viewAll = 'View all insights', } = labels;
    if (isLoading) {
        return (_jsxs(Card, { className: cn('relative overflow-hidden', className), children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [_jsx(Sparkles, { className: "h-4 w-4 text-primary" }), title] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [1, 2].map((i) => (_jsxs("div", { className: "flex gap-3 animate-pulse", children: [_jsx("div", { className: "h-10 w-10 rounded-lg bg-muted" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-muted rounded w-3/4" }), _jsx("div", { className: "h-3 bg-muted rounded w-1/2" })] })] }, i))) }) })] }));
    }
    if (insights.length === 0) {
        return (_jsxs(Card, { className: cn('relative overflow-hidden', className), children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [_jsx(Sparkles, { className: "h-4 w-4 text-primary" }), title] }), onRefresh && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: onRefresh, disabled: isRefreshing, children: _jsx(RefreshCw, { className: cn('h-4 w-4', isRefreshing && 'animate-spin') }) }))] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-4", children: [_jsx(Lightbulb, { className: "h-8 w-8 text-muted-foreground/50 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: emptyTitle }), _jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: emptyDescription })] }) })] }));
    }
    return (_jsxs(Card, { className: cn('relative overflow-hidden', className), children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" }), _jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [_jsx(Sparkles, { className: "h-4 w-4 text-primary" }), title] }), onRefresh && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: onRefresh, disabled: isRefreshing, children: _jsx(RefreshCw, { className: cn('h-4 w-4', isRefreshing && 'animate-spin') }) }))] }) }), _jsx(CardContent, { className: "relative", children: _jsx("div", { className: "space-y-2", children: insights.map((insight, index) => {
                        const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
                        return (_jsxs("div", { className: "group relative transition-all duration-300 ease-in-out", children: [_jsxs("div", { className: cn('flex items-start gap-3 p-3 rounded-lg border border-border/50', 'bg-card hover:bg-muted/30 transition-colors'), children: [_jsx("div", { className: cn('flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center', INSIGHT_COLORS[insight.type] ||
                                                'text-primary bg-primary/10'), children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm leading-relaxed", children: insight.message }), insight.actionLabel && (_jsxs("button", { onClick: () => onAction?.(insight), className: "mt-1.5 text-xs text-primary hover:underline flex items-center gap-1", children: [insight.actionLabel, _jsx(ChevronRight, { className: "h-3 w-3" })] }))] }), onDismiss && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => onDismiss(index), children: _jsx(X, { className: "h-3 w-3" }) }))] }), insight.priority === 'HIGH' && (_jsx("div", { className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r" }))] }, `${insight.type}-${index}`));
                    }) }) })] }));
}
