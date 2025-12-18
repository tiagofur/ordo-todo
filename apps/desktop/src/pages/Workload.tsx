"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Briefcase,
  UserCheck,
  Target,
  Zap,
  ArrowRightLeft,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Progress,
} from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { PageTransition, SlideIn, StaggerList, StaggerItem } from "@/components/motion";
import { useWorkspaces } from "@/lib/shared-hooks";

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
  reason: string;
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

export function Workload() {
  const { t } = (useTranslation as any)();
  const accentColor = "#f97316"; // Orange
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
      console.error("Failed to fetch workload:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkload(selectedWorkspaceId);
    } else {
      setIsLoading(false);
    }
  }, [selectedWorkspaceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LOW": return { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10", border: "border-blue-500/30" };
      case "MODERATE": return { bg: "bg-green-500", text: "text-green-500", light: "bg-green-500/10", border: "border-green-500/30" };
      case "HIGH": return { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10", border: "border-orange-500/30" };
      case "OVERLOADED": return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/10", border: "border-red-500/30" };
      default: return { bg: "bg-gray-500", text: "text-gray-500", light: "bg-gray-500/10", border: "border-gray-500/30" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LOW": return "Disponible";
      case "MODERATE": return "Óptimo";
      case "HIGH": return "Ocupado";
      case "OVERLOADED": return "Sobrecargado";
      default: return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "INCREASING": return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "DECREASING": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getBalanceColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <Users className="h-6 w-6" />
                </div>
                {t("Sidebar.workload")}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Visualiza y balancea la carga del equipo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {workspaces.map((ws: any) => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedWorkspaceId && fetchWorkload(selectedWorkspaceId)}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Actualizar
              </Button>
            </div>
          </div>
        </SlideIn>

        {workloadData ? (
          <>
            {/* Overview Stats */}
            <StaggerList className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StaggerItem>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{workloadData.members.length}</p>
                      <p className="text-xs text-muted-foreground">Miembros activos</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{workloadData.averageWorkload}%</p>
                      <p className="text-xs text-muted-foreground">Carga promedio</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      (workloadData.balanceScore ?? 100) >= 70 ? "bg-green-500/10" :
                      (workloadData.balanceScore ?? 100) >= 40 ? "bg-yellow-500/10" : "bg-red-500/10"
                    )}>
                      <Target className={cn(
                        "h-5 w-5",
                        getBalanceColor(workloadData.balanceScore ?? 100)
                      )} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{workloadData.balanceScore ?? 100}%</p>
                      <p className="text-xs text-muted-foreground">Balance del equipo</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {workloadData.members.filter(m => m.workloadLevel === "OVERLOADED" || m.workloadLevel === "HIGH").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Necesitan ayuda</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            </StaggerList>

            {/* AI Suggestions */}
            {workloadData.redistributionSuggestions && workloadData.redistributionSuggestions.length > 0 && (
              <SlideIn delay={0.15}>
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Sugerencias de Redistribución con IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {workloadData.redistributionSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                          <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                            <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{suggestion.reason}</p>
                            {suggestion.fromUserName && suggestion.toUserName && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="font-medium">{suggestion.fromUserName}</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="font-medium">{suggestion.toUserName}</span>
                                {suggestion.taskCount && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {suggestion.taskCount} tareas
                                  </Badge>
                                )}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Aplicar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            )}

            {/* Team Members Table */}
            <SlideIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Carga por Miembro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workloadData.members.map((member, idx) => (
                      <div
                        key={member.userId}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                          getStatusColor(member.workloadLevel).border
                        )}
                      >
                        {/* Avatar */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatarUrl} alt={member.userName} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {member.userName?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{member.userEmail}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{member.userName}</h3>
                            {getTrendIcon(member.trend)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{member.userEmail}</p>
                        </div>

                        {/* Stats */}
                        <div className="hidden lg:grid grid-cols-3 gap-8 text-center">
                          <div>
                            <p className="text-lg font-bold">{member.assignedTasks}</p>
                            <p className="text-xs text-muted-foreground">Asignadas</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-500">{member.completedTasks}</p>
                            <p className="text-xs text-muted-foreground">Completadas</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{member.hoursWorkedThisWeek}h</p>
                            <p className="text-xs text-muted-foreground">Esta semana</p>
                          </div>
                        </div>

                        {/* Workload Progress */}
                        <div className="w-40 hidden md:block">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Carga</span>
                            <span className={cn("text-sm font-bold", getStatusColor(member.workloadLevel).text)}>
                              {member.workloadScore}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(member.workloadScore, 100)}
                            className={cn("h-2", getStatusColor(member.workloadLevel).light)}
                          />
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap",
                            getStatusColor(member.workloadLevel).light,
                            getStatusColor(member.workloadLevel).text,
                            "border-0"
                          )}
                        >
                          {getStatusLabel(member.workloadLevel)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </>
        ) : workspaces.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay workspaces</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea un workspace para ver la carga de trabajo del equipo
            </p>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecciona un workspace</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Elige un workspace para ver la carga de trabajo del equipo
            </p>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
