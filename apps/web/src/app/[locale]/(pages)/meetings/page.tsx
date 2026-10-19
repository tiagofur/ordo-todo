"use client";

import { useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { MeetingAnalyzer } from "@/components/meetings/meeting-analyzer";
import {
  MessageSquare,
  Sparkles,
  ListTodo,
  CheckCircle2,
  FileText,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/lib/api-hooks";

export default function MeetingsPage() {
  const t = useTranslations("Meetings");
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm shadow-purple-500/25 shrink-0">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span>{t("subtitle")}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Workspace Selector */}
            {workspaces.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Seleccionar espacio de trabajo"
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
            )}
          </div>
        </div>

        {/* 4 Apple-grade KPI Cards with Micro-Halo Hover Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Resumen Inteligente */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
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
                {t("featureSummaryTitle")}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
              {t("featureSummaryDesc")}
            </p>
          </div>

          {/* Card 2: Action Items */}
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
                {t("featureActionItemsTitle")}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                <ListTodo className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
              {t("featureActionItemsDesc")}
            </p>
          </div>

          {/* Card 3: Decisiones */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b98170";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("featureDecisionsTitle")}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
              {t("featureDecisionsDesc")}
            </p>
          </div>

          {/* Card 4: Conversión a Tareas */}
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
                {t("convertToTasks")}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
              Crea tareas reales con un solo clic
            </p>
          </div>
        </div>

        {/* Main Analyzer */}
        <MeetingAnalyzer />
      </div>
    </AppLayout>
  );
}
