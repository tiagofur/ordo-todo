

import { CheckCircle2, Clock, Target, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Skeleton } from '../ui/skeleton.js';

export interface DailyMetricsData {
  tasksCompleted?: number;
  tasksCreated?: number;
  focusScore?: number; // 0-1
}

export interface TimerStatsData {
  totalMinutesWorked?: number;
  pomodorosCompleted?: number;
}

interface DailyMetricsCardProps {
  /** Daily metrics data */
  metrics?: DailyMetricsData | null;
  /** Timer stats data */
  timerStats?: TimerStatsData | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Optional date to display */
  date?: Date;
  /** Format duration function (minutes to string) */
  formatDuration?: (minutes: number) => string;
  /** Get focus score color class */
  getFocusScoreColorClass?: (score: number) => string;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    today?: string;
    completed?: string;
    time?: string;
    pomodoros?: string;
    focus?: string;
  };
  className?: string;
}

function defaultFormatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function defaultGetFocusScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * DailyMetricsCard - Platform-agnostic daily metrics display
 * 
 * Data fetching handled externally.
 * 
 * @example
 * const { data: metrics } = useDailyMetrics({ startDate, endDate });
 * const { data: timerStats } = useTimerStats({ startDate, endDate });
 * 
 * <DailyMetricsCard
 *   metrics={metrics?.[0]}
 *   timerStats={timerStats}
 *   isLoading={isLoading}
 *   formatDuration={formatDuration}
 *   labels={{ title: t('title') }}
 * />
 */
export function DailyMetricsCard({
  metrics,
  timerStats,
  isLoading = false,
  date,
  formatDuration = defaultFormatDuration,
  getFocusScoreColorClass = defaultGetFocusScoreColor,
  labels = {},
  className = '',
}: DailyMetricsCardProps) {
  const {
    title = 'Daily Summary',
    today = 'Today',
    completed = 'Completed',
    time = 'Time',
    pomodoros = 'Pomodoros',
    focus = 'Focus',
  } = labels;

  const formatFocusScore = (score?: number): string => {
    if (score === undefined || score === null) return 'N/A';
    return `${Math.round(score * 100)}%`;
  };

  const getFocusScoreTextClass = (score?: number): string => {
    if (score === undefined || score === null) return 'text-muted-foreground';
    return getFocusScoreColorClass(Math.round(score * 100));
  };

  const formattedDate = date
    ? date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : today;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tasks Completed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completed}</span>
            </div>
            <div className="text-3xl font-bold">
              {metrics?.tasksCompleted || 0}
              <span className="text-sm text-muted-foreground ml-1">
                / {metrics?.tasksCreated || 0}
              </span>
            </div>
          </div>

          {/* Time Worked */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            <div className="text-3xl font-bold">
              {formatDuration(timerStats?.totalMinutesWorked || 0)}
            </div>
          </div>

          {/* Pomodoros */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{pomodoros}</span>
            </div>
            <div className="text-3xl font-bold">{timerStats?.pomodorosCompleted || 0}</div>
          </div>

          {/* Focus Score */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>{focus}</span>
            </div>
            <div className={`text-3xl font-bold ${getFocusScoreTextClass(metrics?.focusScore)}`}>
              {formatFocusScore(metrics?.focusScore)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
