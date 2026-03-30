"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ordo-todo/ui";
import {
  BarChart3,
  FileText,
  Heart,
  TrendingUp,
  Target,
  Brain,
  CalendarIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

// Analytics components
import { DailyMetricsCard } from "@/components/analytics/daily-metrics-card";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { FocusScoreGauge } from "@/components/analytics/focus-score-gauge";
import { ProductivityInsights } from "@/components/analytics/productivity-insights";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import {
  ProjectTimeChart,
  TaskStatusChart,
} from "@/components/analytics/distribution-charts";
import { AIWeeklyReport } from "@/components/analytics/ai-weekly-report";

// Reports components
import { ReportCard } from "@/components/ai/report-card";
import { ReportDetail } from "@/components/ai/report-detail";
import { GenerateReportDialog } from "@/components/ai/generate-report-dialog";

// Wellbeing - inline since it uses direct API calls
import { WellbeingTab } from "./wellbeing-tab";

// Hooks
import {
  useDailyMetrics,
  useDashboardStats,
  useProjectDistribution,
  useTaskStatusDistribution,
  useReports,
} from "@/lib/api-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ordo-todo/ui";
import { Button, Skeleton } from "@ordo-todo/ui";
import { ArrowLeft } from "lucide-react";

export default function InsightsPage() {
  const t = useTranslations("Analytics");
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "analytics";

  const accentColor = "#06b6d4";

  // Analytics data
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

  const { data: todayMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const todayMetrics = todayMetricsArray?.[0];
  const { data: dashboardStats } = useDashboardStats();
  const { data: projectData } = useProjectDistribution();
  const { data: statusData } = useTaskStatusDistribution();

  // Reports data
  const { data: reports, isLoading: reportsLoading } = useReports({
    limit: 20,
  });
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Insights
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("title")}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="wellbeing" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Bienestar
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Daily Metrics */}
            <DailyMetricsCard />

            {/* Weekly Chart */}
            <WeeklyChart />

            {/* Distribution Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <ProjectTimeChart data={projectData || []} />
              <TaskStatusChart data={statusData || []} />
            </div>

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

            {/* AI Insights */}
            <ProductivityInsights />

            {/* Peak Hours */}
            <PeakHoursChart />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-end">
              <GenerateReportDialog onSuccess={() => {}} />
            </div>

            {reportsLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {reports.map((report: any) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={() => setSelectedReport(report)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay reportes todavía
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Genera tu primer reporte de productividad para obtener
                  insights personalizados sobre tu trabajo.
                </p>
                <GenerateReportDialog />
              </div>
            )}

            {/* Report Detail Dialog */}
            <Dialog
              open={!!selectedReport}
              onOpenChange={() => setSelectedReport(null)}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <DialogTitle>Detalle del Reporte</DialogTitle>
                  </div>
                </DialogHeader>
                {selectedReport && <ReportDetail report={selectedReport} />}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Wellbeing Tab */}
          <TabsContent value="wellbeing" className="space-y-6">
            <WellbeingTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
