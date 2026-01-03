import {
  Sparkles,
  X,
  ChevronRight,
  Lightbulb,
  Clock,
  Target,
  TrendingUp,
  Coffee,
  AlertTriangle,
  PartyPopper,
  Zap,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { cn } from '../../utils/index.js';

export interface Insight {
  type:
    | 'PRODUCTIVITY_PEAK'
    | 'UPCOMING_DEADLINES'
    | 'SUGGESTED_BREAKS'
    | 'COMPLETION_CELEBRATION'
    | 'WORKLOAD_IMBALANCE'
    | 'ENERGY_OPTIMIZATION'
    | 'REST_SUGGESTION'
    | 'ACHIEVEMENT_CELEBRATION';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionLabel?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  PRODUCTIVITY_PEAK: Clock,
  UPCOMING_DEADLINES: AlertTriangle,
  SUGGESTED_BREAKS: Coffee,
  COMPLETION_CELEBRATION: PartyPopper,
  WORKLOAD_IMBALANCE: TrendingUp,
  ENERGY_OPTIMIZATION: Zap,
  REST_SUGGESTION: Heart,
  ACHIEVEMENT_CELEBRATION: Target,
};

const INSIGHT_COLORS: Record<string, string> = {
  PRODUCTIVITY_PEAK: 'text-blue-500 bg-blue-500/10',
  UPCOMING_DEADLINES: 'text-orange-500 bg-orange-500/10',
  SUGGESTED_BREAKS: 'text-green-500 bg-green-500/10',
  COMPLETION_CELEBRATION: 'text-yellow-500 bg-yellow-500/10',
  WORKLOAD_IMBALANCE: 'text-red-500 bg-red-500/10',
  ENERGY_OPTIMIZATION: 'text-purple-500 bg-purple-500/10',
  REST_SUGGESTION: 'text-pink-500 bg-pink-500/10',
  ACHIEVEMENT_CELEBRATION: 'text-emerald-500 bg-emerald-500/10',
};

interface AIInsightsWidgetProps {
  insights: Insight[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onDismiss?: (index: number) => void;
  onAction?: (insight: Insight) => void;
  className?: string;
  labels?: {
    title?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    viewAll?: string;
  };
}

export function AIInsightsWidget({
  insights,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onDismiss,
  onAction,
  className,
  labels = {},
}: AIInsightsWidgetProps) {
  const {
    title = 'AI Insights',
    emptyTitle = 'No insights available',
    emptyDescription = 'Keep working and AI will provide suggestions',
    viewAll: _viewAll = 'View all insights',
  } = labels;

  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{emptyTitle}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {emptyDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Gradient background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
            return (
              <div
                key={`${insight.type}-${index}`}
                className="group relative transition-all duration-300 ease-in-out"
              >
                <div
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border border-border/50',
                    'bg-card hover:bg-muted/30 transition-colors'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                      INSIGHT_COLORS[insight.type] ||
                        'text-primary bg-primary/10'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{insight.message}</p>

                    {insight.actionLabel && (
                      <button
                        onClick={() => onAction?.(insight)}
                        className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {insight.actionLabel}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Dismiss button */}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDismiss(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Priority indicator */}
                {insight.priority === 'HIGH' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
