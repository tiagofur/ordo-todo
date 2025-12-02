"use client";

import { useState } from "react";
import { useSessionHistory, useTimerStats } from "@/lib/api-hooks";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
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
  Play,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SessionType = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";

interface SessionHistoryFilters {
  type?: SessionType;
  startDate?: string;
  endDate?: string;
  completedOnly?: boolean;
  page: number;
  limit: number;
}

export function SessionHistory() {
  const locale = useLocale();
  const t = useTranslations("SessionHistory");
  const dateLocale = locale === "es" ? es : enUS;

  const [filters, setFilters] = useState<SessionHistoryFilters>({
    page: 1,
    limit: 10,
    startDate: subDays(new Date(), 7).toISOString().split("T")[0],
  });

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useSessionHistory(filters);

  const { data: statsData, isLoading: isLoadingStats } = useTimerStats({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case "WORK":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "SHORT_BREAK":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "LONG_BREAK":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CONTINUOUS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getSessionTypeIcon = (type: SessionType) => {
    switch (type) {
      case "WORK":
        return <Target className="h-4 w-4" />;
      case "SHORT_BREAK":
      case "LONG_BREAK":
        return <Coffee className="h-4 w-4" />;
      case "CONTINUOUS":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof SessionHistoryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  if (historyError) {
    return (
      <div className="text-center py-8 text-muted-foreground">{t("error")}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-red-500" />}
          label={t("stats.pomodoros")}
          value={statsData?.pomodorosCompleted ?? 0}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label={t("stats.totalTime")}
          value={formatDuration(statsData?.totalMinutesWorked ?? 0)}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label={t("stats.focusScore")}
          value={`${statsData?.avgFocusScore ?? 0}%`}
          isLoading={isLoadingStats}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          label={t("stats.completionRate")}
          value={`${Math.round((statsData?.completionRate ?? 0) * 100)}%`}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              {t("filters.title")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.type ?? "all"}
              onValueChange={(value) =>
                handleFilterChange("type", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                <SelectItem value="WORK">{t("types.work")}</SelectItem>
                <SelectItem value="SHORT_BREAK">
                  {t("types.shortBreak")}
                </SelectItem>
                <SelectItem value="LONG_BREAK">
                  {t("types.longBreak")}
                </SelectItem>
                <SelectItem value="CONTINUOUS">
                  {t("types.continuous")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.completedOnly ? "completed" : "all"}
              onValueChange={(value) =>
                handleFilterChange("completedOnly", value === "completed")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="completed">
                  {t("filters.completedOnly")}
                </SelectItem>
              </SelectContent>
            </Select>

            <input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            />
            <input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
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
            {t("sessions.title")}
            {historyData && (
              <span className="text-sm font-normal text-muted-foreground">
                ({historyData.total} {t("sessions.count")})
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
            <div className="text-center py-8 text-muted-foreground">
              {t("sessions.empty")}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filters.page}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {historyData?.sessions.map((session: any) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          getSessionTypeColor(session.type),
                        )}
                      >
                        {getSessionTypeIcon(session.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getSessionTypeColor(session.type),
                            )}
                          >
                            {t(`types.${session.type.toLowerCase()}`)}
                          </Badge>
                          {session.wasCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : session.wasInterrupted ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(session.startedAt), "PPp", {
                            locale: dateLocale,
                          })}
                        </p>
                        {session.taskId && (
                          <p className="text-xs text-muted-foreground">
                            Task ID: {session.taskId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatDuration(session.duration ?? 0)}
                      </p>
                      {session.pauseCount > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <Pause className="h-3 w-3" />
                          {session.pauseCount}{" "}
                          {session.pauseCount === 1
                            ? t("sessions.pause")
                            : t("sessions.pauses")}
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
                {t("pagination.showing", {
                  from: (filters.page - 1) * filters.limit + 1,
                  to: Math.min(filters.page * filters.limit, historyData.total),
                  total: historyData.total,
                })}
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
              {t("chart.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {statsData.dailyBreakdown.map((day: any) => {
                const maxMinutes = Math.max(
                  ...statsData.dailyBreakdown.map((d: any) => d.minutesWorked),
                );
                const height =
                  maxMinutes > 0 ? (day.minutesWorked / maxMinutes) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-full bg-primary/80 rounded-t-md min-h-[4px]"
                      title={`${formatDuration(day.minutesWorked)} - ${day.pomodorosCompleted} pomodoros`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(day.date), "EEE", {
                        locale: dateLocale,
                      })}
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

function StatCard({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
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
