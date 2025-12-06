'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.js';

export interface PeakHoursData {
  [hour: string]: number; // hour (0-23) -> score (0-1)
}

interface PeakHoursChartProps {
  /** Peak hours data - object with hour keys and score values */
  peakHours?: PeakHoursData | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    description?: string;
    empty?: string;
    yAxis?: string;
    tooltip?: string;
    legendHigh?: string;
    legendGood?: string;
    legendFair?: string;
    legendLow?: string;
  };
  className?: string;
}

function getBarColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/**
 * PeakHoursChart - Platform-agnostic peak productivity hours chart
 * 
 * Data fetching handled externally.
 * 
 * @example
 * const { data: profile, isLoading } = useAIProfile();
 * 
 * <PeakHoursChart
 *   peakHours={profile?.peakHours}
 *   isLoading={isLoading}
 *   labels={{ title: t('title') }}
 * />
 */
export function PeakHoursChart({
  peakHours,
  isLoading = false,
  labels = {},
  className = '',
}: PeakHoursChartProps) {
  const {
    title = 'Peak Productivity Hours',
    description = 'When you work best throughout the day',
    empty = 'Complete more sessions to see your peak hours',
    yAxis = 'Productivity %',
    tooltip = 'Productivity',
    legendHigh = 'High (80%+)',
    legendGood = 'Good (60%+)',
    legendFair = 'Fair (40%+)',
    legendLow = 'Low',
  } = labels;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!peakHours || Object.keys(peakHours).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground text-sm">{empty}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(peakHours)
    .map(([hour, score]) => {
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;

      return {
        hour: hourNum,
        label: `${displayHour}${period}`,
        score: typeof score === 'number' ? score * 100 : 0,
      };
    })
    .sort((a, b) => a.hour - b.hour);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 100]}
              label={{
                value: yAxis,
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{data.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {tooltip}: {Math.round(data.score)}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">{legendHigh}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
            <span className="text-muted-foreground">{legendGood}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
            <span className="text-muted-foreground">{legendFair}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-muted-foreground">{legendLow}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
