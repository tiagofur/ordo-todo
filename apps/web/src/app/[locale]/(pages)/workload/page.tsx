"use client";

import { useState, useEffect, useMemo } from "react";
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
  Search,
  X,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/shared/app-layout";
import { useWorkspaces } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
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

type LevelFilter = "ALL" | "LOW" | "MODERATE" | "HIGH" | "OVERLOADED";

export default function WorkloadPage() {
  const t = useTranslations("Workload");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");
  const [workloadData, setWorkloadData] = useState<TeamWorkloadData | null>(null);

  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  // Active workspace fallback
  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  const fetchWorkload = async (workspaceId: string) => {
    setIsRefreshing(true);
    try {
      const data = await apiClient.getWorkspaceWorkload(workspaceId);
      setWorkloadData(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch workload:", error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkload(activeWorkspaceId);
    } else {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "LOW":
        return {
          bar: "bg-blue-500",
          badge:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
          color: "#3b82f6",
        };
      case "MODERATE":
        return {
          bar: "bg-emerald-500",
          badge:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          color: "#10b981",
        };
      case "HIGH":
        return {
          bar: "bg-amber-500",
          badge:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          color: "#f59e0b",
        };
      case "OVERLOADED":
        return {
          bar: "bg-rose-500",
          badge:
            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
          color: "#f43f5e",
        };
      default:
        return {
          bar: "bg-muted-foreground",
          badge: "bg-muted text-muted-foreground border border-border",
          color: "#6b7280",
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LOW":
        return t("levels.LOW");
      case "MODERATE":
        return t("levels.MODERATE");
      case "HIGH":
        return t("levels.HIGH");
      case "OVERLOADED":
        return t("levels.OVERLOADED");
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "INCREASING":
        return (
          <span
            title={t("trends.INCREASING")}
            aria-label={t("trends.INCREASING")}
          >
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </span>
        );
      case "DECREASING":
        return (
          <span
            title={t("trends.DECREASING")}
            aria-label={t("trends.DECREASING")}
          >
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

  const membersList = workloadData?.members || [];
  const totalAssignedTasks = useMemo(
    () => membersList.reduce((acc, m) => acc + (m.assignedTasks || 0), 0),
    [membersList]
  );
  const balanceScore = workloadData?.balanceScore ?? 100;

  const lowCount = useMemo(
    () => membersList.filter((m) => m.workloadLevel === "LOW").length,
    [membersList]
  );
  const moderateCount = useMemo(
    () => membersList.filter((m) => m.workloadLevel === "MODERATE").length,
    [membersList]
  );
  const highCount = useMemo(
    () => membersList.filter((m) => m.workloadLevel === "HIGH").length,
    [membersList]
  );
  const overloadedCount = useMemo(
    () => membersList.filter((m) => m.workloadLevel === "OVERLOADED").length,
    [membersList]
  );

  const filteredMembers = useMemo(() => {
    return membersList.filter((member) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = member.userName?.toLowerCase().includes(q);
        const emailMatch = member.userEmail?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      if (levelFilter !== "ALL" && member.workloadLevel !== levelFilter) {
        return false;
      }

      return true;
    });
  }, [membersList, searchQuery, levelFilter]);

  if (isLoading && !workloadData) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-2xl w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-card rounded-2xl border border-border/60"
                />
              ))}
            </div>
            <div className="h-64 bg-card rounded-2xl border border-border/60" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const balanceColor =
    balanceScore >= 70
      ? "#10b981"
      : balanceScore >= 40
        ? "#f59e0b"
        : "#f43f5e";

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm shadow-purple-500/25 shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Live Summary Pills */}
            {workloadData && (
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Miembros:</span>
                <span className="font-bold text-foreground">
                  {membersList.length}
                </span>
                <span className="text-border">|</span>
                <span>Carga Media:</span>
                <span className="font-bold text-foreground">
                  {workloadData.averageWorkload}%
                </span>
                <span className="text-border">|</span>
                <span>Balance:</span>
                <span className="font-bold" style={{ color: balanceColor }}>
                  {balanceScore}%
                </span>
              </div>
            )}

            {/* Workspace Selector */}
            <div className="relative inline-flex items-center">
              <select
                aria-label={t("selectWorkspace")}
                value={activeWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors cursor-pointer shadow-xs"
              >
                {workspaces.map((ws: any) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => activeWorkspaceId && fetchWorkload(activeWorkspaceId)}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-all duration-200 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-muted-foreground",
                  isRefreshing && "animate-spin text-foreground"
                )}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? t("refreshing") : t("refresh")}
              </span>
            </button>
          </div>
        </div>

        {workloadData ? (
          <>
            {/* 4 Apple-grade KPI Stats Cards with Micro-Halo Hover Effects */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Miembros */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                onClick={() => setLevelFilter("ALL")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a855f770";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(168, 85, 247, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("teamMembers")}
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                    <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {membersList.length}
                </div>
              </div>

              {/* Card 2: Carga Promedio */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f670";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("averageWorkload")}
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                    <BarChart3 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {workloadData.averageWorkload}%
                </div>
              </div>

              {/* Card 3: Tareas Asignadas */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f59e0b70";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("assignedTasks")}
                  </span>
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                    <CheckSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {totalAssignedTasks}
                </div>
              </div>

              {/* Card 4: Balance del Equipo */}
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${balanceColor}70`;
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${balanceColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("teamBalance")}
                  </span>
                  <div
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${balanceColor}18`,
                      color: balanceColor,
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                </div>
                <div
                  className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ color: balanceColor }}
                >
                  {balanceScore}%
                </div>
              </div>
            </div>

            {/* AI Suggestions (Redistribution Recommendations) */}
            {workloadData.redistributionSuggestions &&
              workloadData.redistributionSuggestions.length > 0 && (
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.03] p-5 shadow-xs space-y-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>{t("aiSuggestions")}</span>
                  </h2>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {workloadData.redistributionSuggestions.map(
                      (suggestion: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 mt-0.5">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                              {suggestion.reason || suggestion.message}
                            </p>
                            {suggestion.fromUserName && suggestion.toUserName && (
                              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-foreground/90">
                                  {suggestion.fromUserName}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                                <span className="font-semibold text-foreground/90">
                                  {suggestion.toUserName}
                                </span>
                                {suggestion.taskCount && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-[11px]">
                                    {t("tasksCount", {
                                      count: suggestion.taskCount,
                                    })}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Apple Toolbar: Search + Workload Level Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar miembro o email..."
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Workload Level Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                  {(
                    [
                      { key: "ALL", label: "Todos", count: membersList.length },
                      { key: "LOW", label: t("levels.LOW"), count: lowCount },
                      {
                        key: "MODERATE",
                        label: t("levels.MODERATE"),
                        count: moderateCount,
                      },
                      { key: "HIGH", label: t("levels.HIGH"), count: highCount },
                      {
                        key: "OVERLOADED",
                        label: t("levels.OVERLOADED"),
                        count: overloadedCount,
                      },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setLevelFilter(filter.key)}
                      className={cn(
                        "px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                        levelFilter === filter.key
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{filter.label}</span>
                      <span className="text-[11px] opacity-70">
                        ({filter.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
                  <Users className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">
                    No se encontraron miembros
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Ningún miembro del equipo coincide con el criterio de búsqueda o nivel de carga seleccionado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLevelFilter("ALL");
                    }}
                    className="mt-4 rounded-xl border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                filteredMembers.map((member, idx) => {
                  const styles = getStatusStyles(member.workloadLevel);
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card hover:bg-muted/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${styles.color}70`;
                        e.currentTarget.style.boxShadow = `0 10px 25px -5px ${styles.color}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      {/* Avatar & User Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.userName}
                              className="h-11 w-11 rounded-2xl object-cover border border-border/60"
                            />
                          ) : (
                            <div
                              className="h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-base transition-transform duration-300 group-hover:scale-105"
                              style={{
                                backgroundColor: `${styles.color}18`,
                                color: styles.color,
                              }}
                            >
                              {member.userName?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base truncate text-foreground">
                              {member.userName}
                            </h3>
                            {getTrendIcon(member.trend)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {member.userEmail}
                          </p>

                          {/* Mobile inline stats */}
                          <div className="sm:hidden flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>
                              <strong className="text-foreground">
                                {member.assignedTasks}
                              </strong>{" "}
                              {t("tasks").toLowerCase()}
                            </span>
                            <span>•</span>
                            <span>
                              <strong className="text-foreground">
                                {member.hoursWorkedThisWeek}h
                              </strong>{" "}
                              esta semana
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                        <div className="text-center min-w-[60px]">
                          <p className="font-bold text-foreground text-base">
                            {member.assignedTasks}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("tasks")}
                          </p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="font-bold text-foreground text-base">
                            {member.completedTasks}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("today")}
                          </p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="font-bold text-foreground text-base">
                            {member.hoursWorkedThisWeek}h
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("hours")}
                          </p>
                        </div>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="w-full sm:w-40 md:w-48 flex flex-col justify-center shrink-0">
                        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                          <span className="text-muted-foreground">{t("load")}</span>
                          <span style={{ color: styles.color }}>
                            {member.workloadScore}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              styles.bar
                            )}
                            style={{
                              width: `${Math.min(member.workloadScore, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex sm:justify-end shrink-0">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap",
                            styles.badge
                          )}
                        >
                          {getStatusLabel(member.workloadLevel)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 mx-auto mb-4">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-foreground">
              {t("selectWorkspacePrompt")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t("selectWorkspaceDesc")}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
