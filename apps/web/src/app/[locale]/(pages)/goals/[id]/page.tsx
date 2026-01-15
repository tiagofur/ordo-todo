"use client";

import { useState } from "react";
import { useObjective, useDeleteKeyResult } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button, Skeleton } from "@ordo-todo/ui";
import { ArrowLeft, Plus, Calendar, Edit2, Trash2, Target, TrendingUp, Link2 } from "lucide-react";
import { AppLayout } from "@/components/shared/app-layout";
import { CreateKeyResultDialog } from "@/components/goals/create-key-result-dialog";
import { notify } from "@/lib/notify";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@ordo-todo/ui";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Goals");
  const { data: objective, isLoading } = useObjective(params.id as string);
  const deleteKeyResult = useDeleteKeyResult();

  const [showCreateKR, setShowCreateKR] = useState(false);

  const handleDeleteKR = async (krId: string) => {
    if (!confirm(t("keyResults.confirmDelete") || "¿Eliminar este resultado clave?")) return;

    try {
      await deleteKeyResult.mutateAsync({
        objectiveId: params.id as string,
        keyResultId: krId,
      });
      notify.success(t("keyResults.deleted") || "Resultado clave eliminado");
    } catch (error: any) {
      notify.error(error?.message || "Error al eliminar");
    }
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

  if (isLoading)
    return (
      <AppLayout>
        <div className="p-4 sm:p-6">
          <Skeleton className="h-[600px] w-full max-w-5xl mx-auto rounded-3xl" />
        </div>
      </AppLayout>
    );

  if (!objective) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">{t("notFound") || "Objetivo no encontrado"}</h1>
          <Button onClick={() => router.push("/goals")} className="mt-4" variant="outline">
            {t("backToList")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-goals",
    CANCELLED: "bg-red-500",
    AT_RISK: "bg-orange-500",
  };

  const recordColor = objective.color || "#EC4899"; // Pink as fallback

  return (
    <AppLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex bg-background h-full flex-col max-w-5xl mx-auto w-full transition-all space-y-4 sm:space-y-6 p-4 sm:p-6"
      >
        {/* Iconic Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 sm:p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-goals/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                <div 
                    className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-[2rem] text-white shadow-lg shadow-goals/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500"
                    style={{ backgroundColor: recordColor }}
                >
                    <Target className="h-7 w-7 sm:h-10 sm:w-10" />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1 sm:mb-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push("/goals")}
                            className="h-7 px-2 -ml-2 text-muted-foreground hover:text-goals"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t("title")}
                        </Button>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", statusColors[objective.status] || "bg-goals")} />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {t(`status.${objective.status}`) || objective.status}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                        {objective.title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
                <Button
                    variant="outline"
                    className="rounded-xl border-border/50 hover:bg-goals/5 hover:text-goals transition-all duration-300"
                    onClick={() => notify.info("Función de editar en desarrollo")}
                >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t("edit") || "Editar"}
                </Button>
                <Button
                    onClick={() => setShowCreateKR(true)}
                    className="bg-goals hover:bg-goals/90 text-white rounded-xl shadow-lg shadow-goals/20 transition-all duration-300 px-4 sm:px-6"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{t("keyResults.add")}</span>
                    <span className="sm:hidden">{t("keyResults.addShort")}</span>
                </Button>
            </div>
        </motion.div>

        {/* Description & Metadata */}
        {(objective.description || (objective.startDate && objective.endDate)) && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {objective.description && (
                <div className="bg-card p-6 rounded-2xl border border-border/50 h-full">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("description")}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {objective.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Dates */}
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-goals/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-goals" />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{t("period")}</p>
                      <p className="text-sm font-semibold truncate">
                        {formatDate(objective.startDate)} - {formatDate(objective.endDate)}
                      </p>
                  </div>
              </div>

              {/* Progress Detail */}
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out" 
                    style={{ width: `${objective.progress}%`, backgroundColor: recordColor }}
                  />
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${recordColor}15` }}>
                      <span className="text-lg font-black" style={{ color: recordColor }}>
                        {Math.round(objective.progress)}%
                      </span>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{t("overallProgress")}</p>
                      <p className="text-sm text-foreground font-semibold">
                        {objective.period || objective.status}
                      </p>
                  </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Results Section */}
        <motion.div variants={itemVariants} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-goals" />
                {t("keyResults.title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 ml-5">
                {t("keyResults.subtitle") || "Métricas clave para medir el éxito"}
              </p>
            </div>
            {objective.keyResults && objective.keyResults.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <TrendingUp className="h-3.5 w-3.5 text-goals" />
                    <span className="text-xs font-bold text-muted-foreground">{objective.keyResults.length} KR</span>
                </div>
            )}
          </div>

          <div className="grid gap-6">
            {objective.keyResults && objective.keyResults.length > 0 ? (
              objective.keyResults.map((kr, index) => (
                <motion.div
                  key={kr.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-6 bg-card hover:bg-background transition-all duration-300 rounded-2xl border border-border/50 group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg group-hover:text-goals transition-colors">{kr.title}</h4>
                      {kr.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {kr.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("target")}</p>
                        <div className="font-mono font-black text-lg">
                          {kr.currentValue} <span className="text-muted-foreground/50 font-medium">/</span> {kr.targetValue}
                          {kr.unit && (
                            <span className="text-muted-foreground text-xs ml-1 font-bold">{kr.unit}</span>
                          )}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-border/50 hidden sm:block" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeleteKR(kr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            {Math.round(kr.progress)}% {t("completed")}
                        </span>
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/10 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, kr.progress))}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="h-full bg-goals shadow-[0_0_10px_rgba(236,72,153,0.3)] relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Linked Tasks Section (Optional premium UI) */}
                  {kr.linkedTasks && kr.linkedTasks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
                      <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                              <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                                  <Link2 className="h-3 w-3 text-muted-foreground" />
                              </div>
                          ))}
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                        {kr.linkedTasks.length} {kr.linkedTasks.length === 1 ? t("taskLinked") : t("tasksLinked")}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50"
              >
                <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("keyResults.emptyTitle")}</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  {t("keyResults.empty")}
                </p>
                <Button 
                    onClick={() => setShowCreateKR(true)} 
                    variant="outline"
                    className="rounded-xl px-8 py-6 h-auto hover:bg-goals hover:text-white hover:border-goals transition-all duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t("keyResults.addFirst")}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Create Key Result Dialog */}
      <CreateKeyResultDialog
        open={showCreateKR}
        onOpenChange={setShowCreateKR}
        objectiveId={params.id as string}
      />
    </AppLayout>
  );
}
