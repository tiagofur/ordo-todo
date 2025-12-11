"use client";

import { Target, TrendingUp, AlertTriangle, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useObjectivesDashboardSummary } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface OkrWidgetProps {
  accentColor?: string;
}

export function OkrWidget({ accentColor = "#3B82F6" }: OkrWidgetProps) {
  const t = useTranslations("Goals");
  const { data: summary, isLoading } = useObjectivesDashboardSummary();

  const objectives = (summary?.objectives ?? []).slice(0, 3);
  
  if (isLoading) {
    return (
      <div className="h-full w-full rounded-2xl border border-border/50 bg-card p-4 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 flex flex-col h-full"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("title")}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {Math.round(summary?.averageProgress || 0)}% {t("averageProgress").toLowerCase()}
              </p>
            </div>
          </div>
          <Link
            href="/goals"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("viewAll")}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
           <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
             <span>{summary?.completed} {t("completed").toLowerCase()}</span>
             <span>{summary?.total} {t("total").toLowerCase()}</span>
           </div>
           <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary?.averageProgress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
        </div>
      </div>

      {/* Stats Summary */}
      {summary && summary.atRisk > 0 && (
         <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/10 flex items-center gap-2 text-xs text-red-500 font-medium">
            <AlertTriangle className="h-3 w-3" />
            {summary.atRisk} {t("okrsAtRisk")}
         </div>
      )}

      {/* Objectives List */}
      <div className="p-2 flex-1">
        {(objectives.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-6 text-center h-full">
            <Target className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t("noObjectives")}</p>
            <Link
              href="/goals"
              className="mt-2 text-xs font-medium hover:underline"
              style={{ color: accentColor }}
            >
              {t("createObjective")}
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {objectives.map((objective, index) => (
              <Link 
                key={objective.id} 
                href={`/goals/${objective.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group/item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Status Indicator / Progress Ring could be here, simple circle for now */}
                   <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
                      <svg className="h-full w-full -rotate-90 text-muted/30" viewBox="0 0 36 36">
                        <path className="fill-none stroke-current stroke-[3]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path 
                            className="fill-none stroke-current stroke-[3] transition-all duration-500 ease-out" 
                            strokeDasharray={`${objective.progress}, 100`}
                            style={{ stroke: objective.color || accentColor }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                      </svg>
                      <span className="absolute text-[9px] font-semibold">{Math.round(objective.progress)}</span>
                   </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover/item:text-primary transition-colors">
                      {objective.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> 
                            {objective.daysRemaining}d {t("left")}
                        </span>
                        <span>•</span>
                        <span>{objective.keyResultsCount} KRs</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div 
        className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none"
        style={{ color: accentColor }}
      >
        <Target className="h-32 w-32" />
      </div>
    </motion.div>
  );
}
