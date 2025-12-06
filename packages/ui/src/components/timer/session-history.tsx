'use client';

import { useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  Calendar,
  Target,
  Coffee,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pause,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.js';
import { Skeleton } from '../ui/skeleton.js';
import { cn } from '../../utils/index.js';

export type SessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';

export interface TimerSession {
  id: string;
  type: SessionType;
  startedAt: string | Date;
  duration: number; // in minutes
  wasCompleted: boolean;
  wasInterrupted?: boolean;
  pauseCount: number;
  taskId?: string | null;
}

export interface TimerStats {
  pomodorosCompleted: number;
  totalMinutesWorked: number;
  avgFocusScore: number;
  completionRate: number;
  dailyBreakdown?: Array<{
    date: string;
    minutesWorked: number;
    pomodorosCompleted: number;
  }>;
}

export interface SessionHistoryFilters {
  type?: SessionType;
  startDate?: string;
  endDate?: string;
  completedOnly?: boolean;
  page: number;
  limit: number;
}

export interface SessionHistoryData {
  sessions: TimerSession[];
  total: number;
  totalPages: number;
}

interface SessionHistoryProps {
  /** Session history data */
  historyData?: SessionHistoryData | null;
  /** Stats data */
  statsData?: TimerStats | null;
  /** Whether history is loading */
  isLoadingHistory?: boolean;
  /** Whether stats are loading */
  isLoadingStats?: boolean;
  /** Whether there's an error */
  hasError?: boolean;
  /** Current filters */
  filters: SessionHistoryFilters;
  /** Called when filters change */
  onFiltersChange: (filters: SessionHistoryFilters) => void;
  /** Date locale for formatting (e.g., es, enUS from date-fns) */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    error?: string;
    statsPomodoros?: string;
    statsTotalTime?: string;
    statsFocusScore?: string;
    statsCompletionRate?: string;
    filtersTitle?: string;
    filtersType?: string;
    filtersAllTypes?: string;
    filtersStatus?: string;
    filtersAllStatus?: string;
    filtersCompletedOnly?: string;
    sessionsTitle?: string;
    sessionsCount?: string;
    sessionsEmpty?: string;
    sessionPause?: string;
    sessionPauses?: string;
    typesWork?: string;
    typesShortBreak?: string;
    typesLongBreak?: string;
    typesContinuous?: string;
    paginationShowing?: (from: number, to: number, total: number) => string;
    chartTitle?: string;
  };
}

// Import Locale type from date-fns
type Locale = Parameters<typeof format>[2] extends { locale?: infer L } ? L : never;

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  WORK: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  SHORT_BREAK: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  LONG_BREAK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONTINUOUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

function getSessionTypeIcon(type: SessionType) {
  switch (type) {
    case 'WORK':
      return <Target className="h-4 w-4" />;
    case 'SHORT_BREAK':
    case 'LONG_BREAK':
      return <Coffee className="h-4 w-4" />;
    case 'CONTINUOUS':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function StatCard({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
 *   dateLocale={es}
 *   labels={{ ... }}
 * />
 */
export function SessionHistory({
  historyData,
  statsData,
  isLoadingHistory = false,
  isLoadingStats = false,
  hasError = false,
  filters,
  onFiltersChange,
  dateLocale,
  labels = {},
}: SessionHistoryProps) {
  const {
    error = 'Error loading history',
    statsPomodoros = 'Pomodoros',
    statsTotalTime = 'Total Time',
    statsFocusScore = 'Focus Score',
    statsCompletionRate = 'Completion Rate',
    filtersTitle = 'Filters',
    filtersType = 'Type',
    filtersAllTypes = 'All Types',
    filtersStatus = 'Status',
    filtersAllStatus = 'All',
    filtersCompletedOnly = 'Completed Only',
    sessionsTitle = 'Sessions',
    sessionsCount = 'sessions',
    sessionsEmpty = 'No sessions found',
    sessionPause = 'pause',
    sessionPauses = 'pauses',
    typesWork = 'Work',
    typesShortBreak = 'Short Break',
    typesLongBreak = 'Long Break',
    typesContinuous = 'Continuous',
    paginationShowing = (from, to, total) => `Showing ${from}-${to} of ${total}`,
    chartTitle = 'Daily Activity',
  } = labels;

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'work': return typesWork;
      case 'short_break': return typesShortBreak;
      case 'long_break': return typesLongBreak;
      case 'continuous': return typesContinuous;
      default: return type;
    }
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage });
  };

  const handleFilterChange = (key: keyof SessionHistoryFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  if (hasError) {
    return <div className="text-center py-8 text-muted-foreground">{error}</div>;
  }

  const formatOptions = dateLocale ? { locale: dateLocale } : undefined;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-red-500" />}
          label={statsPomodoros}
          value={statsData?.pomodorosCompleted ?? 0}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label={statsTotalTime}
          value={formatDuration(statsData?.totalMinutesWorked ?? 0)}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label={statsFocusScore}
          value={`${statsData?.avgFocusScore ?? 0}%`}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          label={statsCompletionRate}
          value={`${Math.round((statsData?.completionRate ?? 0) * 100)}%`}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            {filtersTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.type ?? 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={filtersType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filtersAllTypes}</SelectItem>
                <SelectItem value="WORK">{typesWork}</SelectItem>
                <SelectItem value="SHORT_BREAK">{typesShortBreak}</SelectItem>
                <SelectItem value="LONG_BREAK">{typesLongBreak}</SelectItem>
                <SelectItem value="CONTINUOUS">{typesContinuous}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.completedOnly ? 'completed' : 'all'}
              onValueChange={(value) => handleFilterChange('completedOnly', value === 'completed')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={filtersStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filtersAllStatus}</SelectItem>
                <SelectItem value="completed">{filtersCompletedOnly}</SelectItem>
              </SelectContent>
            </Select>

            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            />
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            {sessionsTitle}
            {historyData && (
              <span className="text-sm font-normal text-muted-foreground">
                ({historyData.total} {sessionsCount})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : historyData?.sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{sessionsEmpty}</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filters.page}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {historyData?.sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('p-2 rounded-full', SESSION_TYPE_COLORS[session.type])}>
                        {getSessionTypeIcon(session.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', SESSION_TYPE_COLORS[session.type])}
                          >
                            {getTypeLabel(session.type)}
                          </Badge>
                          {session.wasCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : session.wasInterrupted ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(session.startedAt), 'PPp', formatOptions)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatDuration(session.duration)}</p>
                      {session.pauseCount > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <Pause className="h-3 w-3" />
                          {session.pauseCount} {session.pauseCount === 1 ? sessionPause : sessionPauses}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {historyData && historyData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {paginationShowing(
                  (filters.page - 1) * filters.limit + 1,
                  Math.min(filters.page * filters.limit, historyData.total),
                  historyData.total
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {filters.page} / {historyData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= historyData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown Chart */}
      {statsData?.dailyBreakdown && statsData.dailyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {chartTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {statsData.dailyBreakdown.map((day) => {
                const maxMinutes = Math.max(
                  ...statsData.dailyBreakdown!.map((d) => d.minutesWorked)
                );
                const height = maxMinutes > 0 ? (day.minutesWorked / maxMinutes) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-full bg-primary/80 rounded-t-md min-h-1"
                      title={`${formatDuration(day.minutesWorked)} - ${day.pomodorosCompleted} pomodoros`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(day.date), 'EEE', formatOptions)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
