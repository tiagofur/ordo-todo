"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { useState } from "react";
import { DailyMetricsCard } from "@/components/analytics/daily-metrics-card";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { ProductivityInsights } from "@/components/analytics/productivity-insights";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import { useDailyMetrics } from "@/lib/api-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  TrendingUp,
  Target,
  BarChart3,
  Brain,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function AnalyticsPage() {
  const t = useTranslations("Analytics");
  const [selectedDate] = useState<Date>(new Date());

  // Get today's date range for metrics
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  // API returns array, extract first element
  const { data: todayMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const todayMetrics = todayMetricsArray?.[0];

  const accentColor = "#06b6d4"; // Cyan

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <BarChart3 className="h-6 w-6" />
              </div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t("tabs.weekly")}
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t("tabs.focus")}
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {t("tabs.aiInsights")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Daily Metrics */}
            <DailyMetricsCard />

            {/* Weekly Chart */}
            <WeeklyChart />

            {/* AI Insights */}
            <ProductivityInsights />

            {/* Focus Score */}
            {todayMetrics?.focusScore !== undefined && (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label={t("focusScore.label")}
                  description={t("focusScore.description")}
                />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("focusScore.howToImprove")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.reduceBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.shortenBreaks")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.usePomodoro")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{t("focusScore.tips.eliminateDistractions")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <WeeklyChart />

            <div className="grid md:grid-cols-3 gap-6">
              <DailyMetricsCard />
              <div className="md:col-span-2 bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("weekly.summary")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("weekly.comingSoon")}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6">
            {todayMetrics?.focusScore !== undefined ? (
              <div className="grid md:grid-cols-2 gap-6">
                <FocusScoreGauge
                  score={todayMetrics.focusScore}
                  label={t("focusScore.label")}
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.whatIs")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("focusScore.whatIsDescription")}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.howCalculated")}
                    </h3>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      <div>{t("focusScore.calculation")}</div>
                      <div className="mt-2 text-muted-foreground">
                        {t("focusScore.penalty")}
                      </div>
                      <div className="text-muted-foreground">
                        {t("focusScore.max")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("focusScore.interpretation")}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-600" />
                        <span className="font-medium">80-100%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.excellent")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-600" />
                        <span className="font-medium">50-79%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.moderate")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="font-medium">0-49%:</span>
                        <span className="text-muted-foreground">
                          {t("focusScore.needsImprovement")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("focusScore.noData")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("focusScore.noDataDescription")}
                </p>
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Productivity Insights */}
              <ProductivityInsights />

              {/* Peak Hours Chart */}
              <PeakHoursChart />

              {/* Info Section */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t("aiLearning.title")}
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>{t("aiLearning.description")}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">
                      {t("aiLearning.whatAnalyzes")}
                    </h4>
                    <ul className="space-y-1 ml-4">
                      <li>• {t("aiLearning.analyzesList.hours")}</li>
                      <li>• {t("aiLearning.analyzesList.days")}</li>
                      <li>• {t("aiLearning.analyzesList.duration")}</li>
                      <li>• {t("aiLearning.analyzesList.completion")}</li>
                      <li>• {t("aiLearning.analyzesList.patterns")}</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">
                      {t("aiLearning.whatOffers")}
                    </h4>
                    <ul className="space-y-1 ml-4">
                      <li>• {t("aiLearning.offersList.recommendations")}</li>
                      <li>• {t("aiLearning.offersList.predictions")}</li>
                      <li>• {t("aiLearning.offersList.insights")}</li>
                      <li>• {t("aiLearning.offersList.visualizations")}</li>
                    </ul>
                  </div>
                  <p className="italic pt-2 border-t">{t("aiLearning.tip")}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
