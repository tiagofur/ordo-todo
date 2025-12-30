"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Button, Card, CardContent, CardHeader, CardTitle } from '@ordo-todo/ui';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAIInsights } from '@/lib/api-hooks';
import { useAuth } from '@/contexts/auth-context';

interface Insight {
  type: 'PRODUCTIVITY_PEAK' | 'UPCOMING_DEADLINES' | 'SUGGESTED_BREAKS' | 
        'COMPLETION_CELEBRATION' | 'WORKLOAD_IMBALANCE' | 'ENERGY_OPTIMIZATION' |
        'REST_SUGGESTION' | 'ACHIEVEMENT_CELEBRATION';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionLabel?: string;
  actionUrl?: string;
  data?: any;
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  PRODUCTIVITY_PEAK: <Clock className="h-5 w-5" />,
  UPCOMING_DEADLINES: <AlertTriangle className="h-5 w-5" />,
  SUGGESTED_BREAKS: <Coffee className="h-5 w-5" />,
  COMPLETION_CELEBRATION: <PartyPopper className="h-5 w-5" />,
  WORKLOAD_IMBALANCE: <TrendingUp className="h-5 w-5" />,
  ENERGY_OPTIMIZATION: <Zap className="h-5 w-5" />,
  REST_SUGGESTION: <Heart className="h-5 w-5" />,
  ACHIEVEMENT_CELEBRATION: <Target className="h-5 w-5" />,
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

const BACKEND_TYPE_MAP: Record<string, Insight['type']> = {
  'OVERDUE_ALERT': 'UPCOMING_DEADLINES',
  'WORKLOAD_IMBALANCE': 'WORKLOAD_IMBALANCE',
  'PEAK_HOUR_TIP': 'PRODUCTIVITY_PEAK',
  'ENERGY_OPTIMIZATION': 'ENERGY_OPTIMIZATION',
  'BREAK_REMINDER': 'SUGGESTED_BREAKS',
  'REST_SUGGESTION': 'REST_SUGGESTION',
  'ACHIEVEMENT_CELEBRATION': 'ACHIEVEMENT_CELEBRATION',
  'STREAK_MOTIVATION': 'ACHIEVEMENT_CELEBRATION',
  'STREAK_MILESTONE': 'ACHIEVEMENT_CELEBRATION',
  'WEEKLY_ACCOMPLISHMENT': 'COMPLETION_CELEBRATION',
};

interface AIInsightsWidgetProps {
  className?: string;
  maxInsights?: number;
}

export function AIInsightsWidget({ className, maxInsights = 3 }: AIInsightsWidgetProps) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const {
    data,
    isLoading,
    isRefetching: isRefreshing,
    refetch: fetchInsights,
    error
  } = useAIInsights({ enabled: isAuthenticated });

  const insights: Insight[] = (data?.insights || []).map((i: any) => ({
    ...i,
    type: BACKEND_TYPE_MAP[i.type] || i.type
  }));

  useEffect(() => {
    // If we have a 401 error, don't log it as an error in console
    // since AuthContext handles redirection
    if (error && (error as any).response?.status === 401) {
      // Quietly fail
    }
  }, [error]);

  const handleDismiss = (index: number) => {
    setDismissedIds(prev => new Set(prev).add(index));
  };

  const handleAction = (insight: Insight) => {
    if (insight.actionUrl) {
      router.push(insight.actionUrl);
    }
  };

  const visibleInsights = insights
    .filter((_: Insight, index: number) => !dismissedIds.has(index))
    .slice(0, maxInsights);

  if (isLoading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
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

  if (visibleInsights.length === 0) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchInsights()}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay insights en este momento
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Continúa trabajando y la IA te dará sugerencias
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchInsights()}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {visibleInsights.map((insight, index) => (
              <motion.div
                key={`${insight.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                layout
                className="group relative"
              >
                <div className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border/50",
                  "bg-card hover:bg-muted/30 transition-colors"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                    INSIGHT_COLORS[insight.type] || 'text-primary bg-primary/10'
                  )}>
                    {INSIGHT_ICONS[insight.type] || <Lightbulb className="h-5 w-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      {insight.message}
                    </p>
                    
                    {insight.actionLabel && (
                      <button
                        onClick={() => handleAction(insight)}
                        className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {insight.actionLabel}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Dismiss button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDismiss(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Priority indicator */}
                {insight.priority === 'HIGH' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r" />
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* View all link */}
        {insights.length > maxInsights && (
          <button
            onClick={() => router.push('/chat')}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-full justify-center"
          >
            Ver todos los insights ({insights.length})
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
