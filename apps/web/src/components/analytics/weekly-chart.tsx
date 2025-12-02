"use client";

import { useWeeklyMetrics } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface WeeklyChartProps {
  weekStart?: Date;
}

export function WeeklyChart({ weekStart }: WeeklyChartProps) {
  const t = useTranslations('WeeklyChart');
  const weekStartParam = weekStart ? weekStart.toISOString().split('T')[0] : undefined;
  const { data: metrics, isLoading } = useWeeklyMetrics(weekStartParam ? { weekStart: weekStartParam } : undefined);

  const getStartOfWeek = (date: Date = new Date()): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatChartData = () => {
    if (!metrics || metrics.length === 0) {
      // Return empty week data
      const start = weekStart || getStartOfWeek();
      const emptyData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        emptyData.push({
          day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          tasksCompleted: 0,
          minutesWorked: 0,
          date: date.toISOString().split('T')[0],
        });
      }
      return emptyData;
    }

    // Create a map of existing metrics
    const metricsMap = new Map(
      metrics.map((m: any) => [
        new Date(m.date).toISOString().split('T')[0],
        m,
      ])
    );

    // Fill in all 7 days of the week
    const start = weekStart || getStartOfWeek();
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const metric = metricsMap.get(dateStr) as any;

      chartData.push({
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
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
              <span className="text-blue-500">{t('tooltip.tasks')}: </span>
              <span className="font-medium">{data.tasksCompleted}</span>
            </p>
            <p className="text-sm">
              <span className="text-green-500">{t('tooltip.time')}: </span>
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
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {weekStart
            ? t('weekOf', { date: weekStart.toLocaleDateString('es-ES') })
            : t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: t('tasks'), angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: t('minutes'), angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="tasksCompleted"
              fill="hsl(var(--primary))"
              name={t('tasksCompleted')}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="minutesWorked"
              fill="hsl(var(--chart-2))"
              name={t('minutesWorked')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
