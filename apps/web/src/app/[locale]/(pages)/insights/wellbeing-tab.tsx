"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Sun,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
  Brain,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface BurnoutAnalysis {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  warnings: {
    type: string;
    severity: "MILD" | "MODERATE" | "SEVERE";
    message: string;
    recommendation: string;
  }[];
  aiInsights?: string;
  patterns: any;
}

interface WorkPattern {
  averageHoursPerDay: number;
  nightWorkPercentage: number;
  weekendWorkPercentage: number;
  longSessionsCount: number;
  averageBreakMinutes: number;
  consistencyScore: number;
}

interface WeeklySummary {
  overallScore: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export function WellbeingTab() {
  const t = useTranslations("Wellbeing");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] =
        await Promise.allSettled([
          apiClient.getBurnoutAnalysis(),
          apiClient.getWorkPatterns(),
          apiClient.getWeeklyWellbeingSummary(),
          apiClient.getRestRecommendations(),
        ]);

      if (burnoutRes.status === "fulfilled") setBurnout(burnoutRes.value);
      if (patternsRes.status === "fulfilled") setPatterns(patternsRes.value);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value);
      if (recsRes.status === "fulfilled")
        setRecommendations(
          Array.isArray(recsRes.value) ? recsRes.value : []
        );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-500",
          light: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
      case "MODERATE":
        return {
          bg: "bg-amber-500",
          text: "text-amber-500",
          light: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500",
          text: "text-orange-500",
          light: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        };
      case "CRITICAL":
        return {
          bg: "bg-red-500",
          text: "text-red-500",
          light: "bg-red-500/10 text-red-600 dark:text-red-400",
        };
      default:
        return {
          bg: "bg-cyan-500",
          text: "text-cyan-500",
          light: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "DECLINING":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-amber-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl border border-border" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
          {t("refresh")}
        </Button>
      </div>

      {/* Burnout Risk Gauge */}
      {burnout && (
        <Card className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className={cn("h-1.5", getRiskColor(burnout.riskLevel).bg)} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-500" />
                {t("burnoutRisk")}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  getRiskColor(burnout.riskLevel).light
                )}
              >
                {t(`riskLevels.${burnout.riskLevel}`)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(burnout.riskScore / 100) * 352} 352`}
                    strokeLinecap="round"
                    className={getRiskColor(burnout.riskLevel).text}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {burnout.riskScore}
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <h4 className="font-medium mb-2">{t("factorsDetected")}</h4>
                <div className="space-y-2">
                  {burnout.warnings?.slice(0, 3).map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {warning.severity === "SEVERE" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : warning.severity === "MODERATE" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">
                        {warning.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {burnout.warnings?.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-cyan-500" />
                  {t("immediateSuggestions")}
                </h4>
                <ul className="grid gap-2">
                  {burnout.warnings?.slice(0, 3).map((warning, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                      {warning.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Work Patterns */}
      {patterns && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(patterns.averageHoursPerDay ?? 0).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">{t("hoursPerDay")}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {patterns.nightWorkPercentage ?? 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("patterns.lateNightWork")}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {patterns.weekendWorkPercentage ?? 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("weekends")}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {patterns.averageBreakMinutes ?? 0}m
                </p>
                <p className="text-xs text-muted-foreground">{t("breaks")}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Summary */}
      {weekly && (
        <Card className="rounded-2xl border border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" />
                {t("weeklySummary")}
              </span>
              <div className="flex items-center gap-2">
                {getTrendIcon(weekly.trend)}
                <span className="text-sm text-muted-foreground">
                  {weekly.trend === "IMPROVING" && t("trends.improving")}
                  {weekly.trend === "STABLE" && t("trends.stable")}
                  {weekly.trend === "DECLINING" && t("trends.declining")}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-4xl font-bold">{weekly.overallScore}</div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      weekly.overallScore >= 80
                        ? "bg-emerald-500"
                        : weekly.overallScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${weekly.overallScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("wellbeingScore")}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {weekly.highlights.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("positive")}
                  </h4>
                  <ul className="space-y-1">
                    {weekly.highlights.map((h, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground"
                      >
                        • {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {weekly.concerns.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {t("concerns")}
                  </h4>
                  <ul className="space-y-1">
                    {weekly.concerns.map((c, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground"
                      >
                        • {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {weekly.recommendations && weekly.recommendations.length > 0 && (
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-sm flex items-start gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span>{weekly.recommendations[0]}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rest Recommendations */}
      {recommendations.length > 0 && (
        <Card className="rounded-2xl border border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-cyan-500" />
              {t("restRecommendations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rec.message}</p>
                    {rec.suggestedAction && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!burnout && !patterns && !weekly && (
        <Card className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("empty.title")}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {t("empty.description")}
          </p>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("empty.retry")}
          </Button>
        </Card>
      )}
    </div>
  );
}
