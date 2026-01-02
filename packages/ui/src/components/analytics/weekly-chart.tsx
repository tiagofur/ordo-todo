

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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '../ui/skeleton.js';

export interface WeeklyMetric {
  date: string;
  tasksCompleted: number;
  minutesWorked: number;
}

interface WeeklyChartProps {
  /** Weekly metrics data */
  metrics?: WeeklyMetric[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Start of the week to display */
  weekStart?: Date;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    description?: string;
    weekOf?: string;
    tasks?: string;
    minutes?: string;
    tasksCompleted?: string;
    minutesWorked?: string;
    tooltipTasks?: string;
    tooltipTime?: string;
  };
  /** Locale for date formatting */
  locale?: string;
  className?: string;
}

function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * WeeklyChart - Platform-agnostic weekly activity chart
 * 
 * Data fetching handled externally.
 * 
 * @example
 * const { data: metrics, isLoading } = useWeeklyMetrics({ weekStart });
 * 
 * <WeeklyChart
 *   metrics={metrics}
 *   isLoading={isLoading}
 *   weekStart={weekStart}
 *   labels={{ title: t('title') }}
 * />
 */
export function WeeklyChart({
  metrics = [],
  isLoading = false,
  weekStart,
  labels = {},
  locale = 'en-US',
  className = '',
}: WeeklyChartProps) {
  const {
    title = 'Weekly Activity',
    description = 'Your productivity this week',
    weekOf = 'Week of',
    tasks = 'Tasks',
    minutes = 'Minutes',
    tasksCompleted = 'Tasks Completed',
    minutesWorked = 'Minutes Worked',
    tooltipTasks = 'Tasks',
    tooltipTime = 'Time',
  } = labels;

  const formatChartData = () => {
    // Create a map of existing metrics
    const metricsMap = new Map(
      metrics.map((m) => [new Date(m.date).toISOString().split('T')[0], m])
    );

    // Fill in all 7 days of the week
    const start = weekStart || getStartOfWeek();
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const metric = metricsMap.get(dateStr);

      chartData.push({
        day: date.toLocaleDateString(locale, { weekday: 'short' }),
        tasksCompleted: metric?.tasksCompleted || 0,
        minutesWorked: metric?.minutesWorked || 0,
        date: dateStr,
      });
    }

    return chartData;
  };

  const chartData = formatChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.day}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-500">{tooltipTasks}: </span>
              <span className="font-medium">{data.tasksCompleted}</span>
            </p>
            <p className="text-sm">
              <span className="text-green-500">{tooltipTime}: </span>
              <span className="font-medium">
                {Math.floor(data.minutesWorked / 60)}h {data.minutesWorked % 60}m
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {weekStart
            ? `${weekOf} ${weekStart.toLocaleDateString(locale)}`
            : description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" tick={{ fill: 'currentColor' }} />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: tasks, angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: minutes, angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="tasksCompleted"
              fill="hsl(var(--primary))"
              name={tasksCompleted}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="minutesWorked"
              fill="hsl(var(--chart-2))"
              name={minutesWorked}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
