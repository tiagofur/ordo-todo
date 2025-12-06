"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.js";
import { cn } from "../../utils/index.js";
import { useTranslations } from "next-intl";

interface FocusScoreGaugeProps {
  score: number; // 0-1
  label?: string;
  description?: string;
}

export function FocusScoreGauge({ score, label, description }: FocusScoreGaugeProps) {
  const t = useTranslations('FocusScoreGauge');
  const percentage = Math.round(score * 100);

  const getColor = (score: number): string => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getStrokeColor = (score: number): string => {
    if (score >= 0.8) return "stroke-green-600";
    if (score >= 0.5) return "stroke-yellow-600";
    return "stroke-red-600";
  };

  const getBackgroundColor = (score: number): string => {
    if (score >= 0.8) return "bg-green-50 dark:bg-green-950";
    if (score >= 0.5) return "bg-yellow-50 dark:bg-yellow-950";
    return "bg-red-50 dark:bg-red-950";
  };

  const getMessage = (score: number): string => {
    if (score >= 0.9) return t('messages.excellent');
    if (score >= 0.8) return t('messages.veryGood');
    if (score >= 0.7) return t('messages.good');
    if (score >= 0.5) return t('messages.moderate');
    if (score >= 0.3) return t('messages.low');
    return t('messages.needsImprovement');
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  return (
    <Card className={cn("transition-colors", getBackgroundColor(score))}>
      <CardHeader>
        <CardTitle>{label || t('label')}</CardTitle>
        <CardDescription>{description || t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Circular Gauge */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", getStrokeColor(score))}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", getColor(score))}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className={cn("font-medium", getColor(score))}>
            {getMessage(score)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {description || t('description')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>80-100%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <span>50-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span>0-49%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
