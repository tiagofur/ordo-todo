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
import { cn } from '../../utils/index.js';

/**
 * Single objective summary for display
 */
export interface ObjectiveSummary {
  id: string;
  title: string;
  progress: number;
  color?: string;
  daysRemaining: number;
  keyResultsCount: number;
}

/**
 * Dashboard summary data for OKRs
 */
export interface OkrDashboardSummary {
  total: number;
  completed: number;
  atRisk: number;
  averageProgress: number;
  objectives: ObjectiveSummary[];
}

/**
 * Labels for i18n - all are optional with English defaults
 */
interface OkrWidgetLabels {
  title?: string;
  averageProgress?: string;
  viewAll?: string;
  total?: string;
  completed?: string;
  okrsAtRisk?: string;
  left?: string;
  noObjectives?: string;
  createObjective?: string;
}

interface OkrWidgetProps {
  /** OKR dashboard summary data */
  summary?: OkrDashboardSummary | null;
  /** Loading state */
  isLoading?: boolean;
  /** Accent color for theming */
  accentColor?: string;
  /** Navigation callback - receives path like '/goals' or '/goals/:id' */
  onNavigate?: (path: string) => void;
  /** Labels for i18n translations */
  labels?: OkrWidgetLabels;
  /** Additional CSS class */
  className?: string;
}

const DEFAULT_LABELS: Required<OkrWidgetLabels> = {
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

export function OkrWidget({
  summary,
  isLoading = false,
  accentColor = '#ec4899', // Pink as default for Goals
  onNavigate,
  labels = {},
  className,
}: OkrWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const objectives = (summary?.objectives ?? []).slice(0, 3);
  const averageProgress = summary?.averageProgress ?? 0;
  const total = summary?.total ?? 0;
  const atRisk = summary?.atRisk ?? 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4',
          'flex items-center justify-center min-h-[200px]',
          className
        )}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300',
        'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 flex flex-col h-full',
        className
      )}
    >
      {/* Decorative background elements */}
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all opacity-5 group-hover:opacity-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl transition-all opacity-5 group-hover:opacity-10 pointer-events-none"
        style={{ backgroundColor: '#a855f7' }}
      />

      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {Math.round(averageProgress)}% {t.averageProgress}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/goals')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.viewAll}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>
              {summary?.completed ?? 0} {t.completed}
            </span>
            <span>
              {total} {t.total.toLowerCase()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${averageProgress}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* At Risk Warning */}
      {atRisk > 0 && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/10 flex items-center gap-2 text-xs text-red-500 font-medium">
          <AlertTriangle className="h-3 w-3" />
          {atRisk} {t.okrsAtRisk}
        </div>
      )}

      {/* Objectives List */}
      <div className="p-2 flex-1">
        {objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center h-full">
            <Target className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t.noObjectives}</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/goals')}
                className="mt-2 text-xs font-medium hover:underline"
                style={{ color: accentColor }}
              >
                {t.createObjective}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {objectives.map((objective, index) => (
              <div
                key={objective.id}
                className="group/item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onNavigate?.(`/goals/${objective.id}`)}
                style={{
                  animation: `fadeInSlide 0.3s ease-out ${index * 0.05}s backwards`,
                }}
              >
                {/* Progress Ring */}
                <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    {/* Background circle */}
                    <path
                      className="fill-none stroke-muted/30"
                      strokeWidth="3"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress arc */}
                    <path
                      className="fill-none transition-all duration-500 ease-out"
                      strokeWidth="3"
                      strokeDasharray={`${objective.progress}, 100`}
                      strokeLinecap="round"
                      style={{ stroke: objective.color || accentColor }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-semibold">
                    {Math.round(objective.progress)}
                  </span>
                </div>

                {/* Objective Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover/item:text-primary transition-colors">
                    {objective.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {objective.daysRemaining}d {t.left}
                    </span>
                    <span>•</span>
                    <span>{objective.keyResultsCount} KRs</span>
                  </div>
                </div>

                {/* Hover chevron */}
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative icon */}
      <div
        className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none"
        style={{ color: accentColor }}
      >
        <Target className="h-32 w-32" />
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
