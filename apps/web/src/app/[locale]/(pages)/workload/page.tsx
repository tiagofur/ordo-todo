"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/shared/app-layout";
import { useWorkspaces } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";

interface MemberWorkload {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  workloadScore: number;
  assignedTasks: number;
  completedTasks: number;
  hoursWorkedThisWeek: number;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  workloadLevel: "LOW" | "MODERATE" | "HIGH" | "OVERLOADED";
}

interface WorkloadSuggestion {
  type: "REDISTRIBUTE" | "URGENT_HELP" | "BALANCE";
  message: string;
  reason?: string;
  fromMember?: string;
  toMember?: string;
  fromUserName?: string;
  toUserName?: string;
  taskCount?: number;
}

interface TeamWorkloadData {
  workspaceId: string;
  workspaceName: string;
  members: MemberWorkload[];
  averageWorkload: number;
  balanceScore?: number;
  redistributionSuggestions: WorkloadSuggestion[];
}

export default function WorkloadPage() {
  const t = useTranslations("Workload");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [workloadData, setWorkloadData] = useState<TeamWorkloadData | null>(null);
  
  const { data: workspaces = [] } = useWorkspaces();

  const fetchWorkload = async (workspaceId: string) => {
    setIsRefreshing(true);
    try {
      const data = await apiClient.getWorkspaceWorkload(workspaceId);
      setWorkloadData(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to fetch workload:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkload(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "LOW":
        return {
          bar: "bg-blue-500",
          badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        };
      case "MODERATE":
        return {
          bar: "bg-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        };
      case "HIGH":
        return {
          bar: "bg-amber-500",
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        };
      case "OVERLOADED":
        return {
          bar: "bg-rose-500",
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        };
      default:
        return {
          bar: "bg-muted-foreground",
          badge: "bg-muted text-muted-foreground border border-border",
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LOW": return t("levels.LOW");
      case "MODERATE": return t("levels.MODERATE");
      case "HIGH": return t("levels.HIGH");
      case "OVERLOADED": return t("levels.OVERLOADED");
      default: return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "INCREASING":
        return (
          <span title={t("trends.INCREASING")} aria-label={t("trends.INCREASING")}>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </span>
        );
      case "DECREASING":
        return (
          <span title={t("trends.DECREASING")} aria-label={t("trends.DECREASING")}>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </span>
        );
      default:
        return (
          <span title={t("trends.STABLE")} aria-label={t("trends.STABLE")}>
            <Minus className="h-4 w-4 text-amber-500" />
          </span>
        );
    }
  };

  if (isLoading && !workloadData) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-2xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card rounded-2xl border border-border" />
              ))}
            </div>
            <div className="h-64 bg-card rounded-2xl border border-border" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const balanceScore = workloadData?.balanceScore ?? 100;

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -8, scale: 0.92 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm shadow-orange-500/25"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Workspace selector */}
            <div className="relative inline-flex items-center">
              <select
                aria-label={t("selectWorkspace")}
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="appearance-none bg-card border border-border rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors cursor-pointer shadow-xs"
              >
                {workspaces.map((ws: any) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => selectedWorkspaceId && fetchWorkload(selectedWorkspaceId)}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-all duration-200 shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isRefreshing && "animate-spin text-foreground")} />
              <span>{isRefreshing ? t("refreshing") : t("refresh")}</span>
            </motion.button>
          </div>
        </div>

        {workloadData ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{workloadData.members.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("teamMembers")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{workloadData.averageWorkload}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("averageWorkload")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    balanceScore >= 70 ? "bg-emerald-500/10 text-emerald-500" :
                    balanceScore >= 40 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{balanceScore}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("teamBalance")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {workloadData.redistributionSuggestions && workloadData.redistributionSuggestions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  {t("aiSuggestions")}
                </h2>
                <div className="space-y-2">
                  {workloadData.redistributionSuggestions.map((suggestion: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{suggestion.reason || suggestion.message}</p>
                        {suggestion.fromUserName && suggestion.toUserName && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span>{suggestion.fromUserName}</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>{suggestion.toUserName}</span>
                            {suggestion.taskCount && (
                              <span className="font-medium text-foreground/80">
                                {t("tasksCount", { count: suggestion.taskCount })}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members List */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                {t("membersSectionTitle")}
              </h2>

              <div className="space-y-3">
                {workloadData.members.map((member, idx) => {
                  const styles = getStatusStyles(member.workloadLevel);
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      whileHover={{ y: -2 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-all duration-200"
                    >
                      {/* Avatar & User Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.userName}
                              className="h-11 w-11 rounded-xl object-cover border border-border"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-semibold text-base">
                              {member.userName?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base truncate text-foreground">
                              {member.userName}
                            </h3>
                            {getTrendIcon(member.trend)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{member.userEmail}</p>

                          {/* Mobile inline stats */}
                          <div className="sm:hidden flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span>{member.assignedTasks} {t("tasks").toLowerCase()}</span>
                            <span>•</span>
                            <span>{member.hoursWorkedThisWeek}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center min-w-[50px]">
                          <p className="font-semibold text-foreground">{member.assignedTasks}</p>
                          <p className="text-xs text-muted-foreground">{t("tasks")}</p>
                        </div>
                        <div className="text-center min-w-[50px]">
                          <p className="font-semibold text-foreground">{member.completedTasks}</p>
                          <p className="text-xs text-muted-foreground">{t("today")}</p>
                        </div>
                        <div className="text-center min-w-[50px]">
                          <p className="font-semibold text-foreground">{member.hoursWorkedThisWeek}h</p>
                          <p className="text-xs text-muted-foreground">{t("hours")}</p>
                        </div>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="w-full sm:w-36 md:w-44 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-muted-foreground">{t("load")}</span>
                          <span className="font-semibold text-foreground">{member.workloadScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-300", styles.bar)}
                            style={{ width: `${Math.min(member.workloadScore, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex sm:justify-end">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap shadow-2xs",
                          styles.badge
                        )}>
                          {getStatusLabel(member.workloadLevel)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mx-auto mb-4">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-foreground">{t("selectWorkspacePrompt")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t("selectWorkspaceDesc")}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

