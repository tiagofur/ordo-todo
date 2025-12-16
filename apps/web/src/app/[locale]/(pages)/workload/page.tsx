"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/shared/app-layout";
import { useWorkspaces } from "@/lib/api-hooks";

interface MemberWorkload {
  userId: string;
  name: string;
  email: string;
  image?: string;
  workloadScore: number;
  taskCount: number;
  completedToday: number;
  hoursLogged: number;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  status: "UNDERLOADED" | "OPTIMAL" | "OVERLOADED" | "CRITICAL";
}

interface WorkloadSuggestion {
  type: "REDISTRIBUTE" | "URGENT_HELP" | "BALANCE";
  message: string;
  fromMember?: string;
  toMember?: string;
  taskCount?: number;
}

interface TeamWorkloadData {
  workspaceId: string;
  workspaceName: string;
  members: MemberWorkload[];
  averageWorkload: number;
  balanceScore: number;
  suggestions: WorkloadSuggestion[];
}

export default function WorkloadPage() {
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
  }, [workspaces]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkload(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNDERLOADED": return { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" };
      case "OPTIMAL": return { bg: "bg-green-500", text: "text-green-500", light: "bg-green-500/10" };
      case "OVERLOADED": return { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10" };
      case "CRITICAL": return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/10" };
      default: return { bg: "bg-gray-500", text: "text-gray-500", light: "bg-gray-500/10" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "UNDERLOADED": return "Baja carga";
      case "OPTIMAL": return "Óptimo";
      case "OVERLOADED": return "Sobrecargado";
      case "CRITICAL": return "Crítico";
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

  if (isLoading && !workloadData) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-6 pb-10"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Carga de Trabajo
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visualiza y balancea la carga del equipo
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Workspace selector */}
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

        {workloadData ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{workloadData.members.length}</p>
                    <p className="text-xs text-muted-foreground">Miembros del equipo</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
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
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    workloadData.balanceScore >= 70 ? "bg-green-500/10" : 
                    workloadData.balanceScore >= 40 ? "bg-yellow-500/10" : "bg-red-500/10"
                  )}>
                    <CheckCircle2 className={cn(
                      "h-5 w-5",
                      workloadData.balanceScore >= 70 ? "text-green-500" : 
                      workloadData.balanceScore >= 40 ? "text-yellow-500" : "text-red-500"
                    )} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{workloadData.balanceScore}%</p>
                    <p className="text-xs text-muted-foreground">Balance del equipo</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Suggestions */}
            {workloadData.suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Sugerencias de IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workloadData.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          suggestion.type === "URGENT_HELP" ? "bg-red-500/10" :
                          suggestion.type === "REDISTRIBUTE" ? "bg-orange-500/10" : "bg-blue-500/10"
                        )}>
                          {suggestion.type === "URGENT_HELP" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : suggestion.type === "REDISTRIBUTE" ? (
                            <Users className="h-4 w-4 text-orange-500" />
                          ) : (
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{suggestion.message}</p>
                          {suggestion.fromMember && suggestion.toMember && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              {suggestion.fromMember} <ChevronRight className="h-3 w-3" /> {suggestion.toMember}
                              {suggestion.taskCount && ` (${suggestion.taskCount} tareas)`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Miembros del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workloadData.members.map((member, idx) => (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                            {member.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{member.name}</h3>
                          {getTrendIcon(member.trend)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{member.taskCount}</p>
                          <p className="text-xs text-muted-foreground">Tareas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{member.completedToday}</p>
                          <p className="text-xs text-muted-foreground">Hoy</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{member.hoursLogged}h</p>
                          <p className="text-xs text-muted-foreground">Horas</p>
                        </div>
                      </div>

                      {/* Workload bar */}
                      <div className="w-32 hidden md:block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Carga</span>
                          <span className="text-xs font-medium">{member.workloadScore}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", getStatusColor(member.status).bg)}
                            style={{ width: `${Math.min(member.workloadScore, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                        getStatusColor(member.status).light,
                        getStatusColor(member.status).text
                      )}>
                        {getStatusLabel(member.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecciona un workspace</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Elige un workspace para ver la carga de trabajo del equipo
            </p>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
