"use client";

import { useOptimalSchedule } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, TrendingUp, Lightbulb, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ProductivityInsights() {
  const t = useTranslations('ProductivityInsights');
  const { data: schedule, isLoading } = useOptimalSchedule({ topN: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!schedule || (schedule.peakHours.length === 0 && schedule.peakDays.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('empty')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Recommendation */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{schedule.recommendation}</p>
          </div>
        </div>

        {/* Peak Hours */}
        {schedule.peakHours.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">{t('peakHours.title')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {schedule.peakHours.map((hour: any) => (
                <Badge
                  key={hour.hour}
                  variant={getScoreBadgeVariant(hour.score)}
                  className="px-3 py-1"
                >
                  <Clock className="h-3 w-3 mr-1.5" />
                  {hour.label}
                  <span className={`ml-2 text-xs ${getScoreColor(hour.score)}`}>
                    {Math.round(hour.score * 100)}%
                  </span>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('peakHours.description')}
            </p>
          </div>
        )}

        {/* Peak Days */}
        {schedule.peakDays.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">{t('peakDays.title')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {schedule.peakDays.map((day: any) => (
                <Badge
                  key={day.day}
                  variant={getScoreBadgeVariant(day.score)}
                  className="px-3 py-1"
                >
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  {day.label}
                  <span className={`ml-2 text-xs ${getScoreColor(day.score)}`}>
                    {Math.round(day.score * 100)}%
                  </span>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('peakDays.description')}
            </p>
          </div>
        )}

        {/* Pro Tip */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground italic">
            {t('tip')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
