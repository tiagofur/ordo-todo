"use client";

import { useState } from "react";
import { useObjective, useDeleteKeyResult } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button, Skeleton } from "@ordo-todo/ui";
import { ArrowLeft, Plus, Calendar, Edit2, Trash2, Target } from "lucide-react";
import { AppLayout } from "@/components/shared/app-layout";
import { CreateKeyResultDialog } from "@/components/goals/create-key-result-dialog";
import { notify } from "@/lib/notify";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
          <Skeleton className="h-96 w-full max-w-5xl mx-auto rounded-3xl" />
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
    DRAFT: "bg-gray-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-blue-500",
    CANCELLED: "bg-red-500",
    AT_RISK: "bg-orange-500",
  };

  return (
    <AppLayout>
      <div className="flex bg-background h-full flex-col max-w-5xl mx-auto w-full transition-all space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/goals")}
          className="w-fit pl-0 hover:bg-transparent hover:text-primary -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToList")}
        </Button>

        {/* Header Section */}
        <div className="flex flex-col gap-4">
          {/* Status and Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${statusColors[objective.status] || "bg-primary"}`}
              />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {t(`status.${objective.status}`) || objective.status}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement edit objective
                notify.info("Función de editar en desarrollo");
              }}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {t("edit") || "Editar"}
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {objective.title}
          </h1>

          {/* Description */}
          {objective.description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {objective.description}
            </p>
          )}

          {/* Dates and Progress Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(objective.startDate)} - {formatDate(objective.endDate)}
              </span>
            </div>

            {/* Progress Card */}
            <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl border shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-primary">
                {Math.round(objective.progress)}%
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {t("progress")}
              </span>
            </div>
          </div>
        </div>

        {/* Key Results Section */}
        <div className="bg-card border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{t("keyResults.title")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("keyResults.subtitle") || "Define métricas para medir tu progreso"}</p>
            </div>
            <Button
              variant="default"
              onClick={() => setShowCreateKR(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("keyResults.add")}
            </Button>
          </div>

          {/* Key Results List */}
          <div className="grid gap-4">
            {objective.keyResults && objective.keyResults.length > 0 ? (
              objective.keyResults.map((kr) => (
                <div
                  key={kr.id}
                  className="p-4 sm:p-5 bg-background hover:bg-muted/30 transition-colors rounded-xl sm:rounded-2xl border group"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base sm:text-lg truncate">{kr.title}</h4>
                      {kr.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {kr.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <div className="font-mono font-medium text-sm sm:text-base">
                          {kr.currentValue} / {kr.targetValue}
                          {kr.unit && (
                            <span className="text-muted-foreground text-xs ml-1">{kr.unit}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteKR(kr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="h-2 sm:h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, kr.progress))}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground font-medium">
                        {Math.round(kr.progress)}%
                      </span>
                    </div>
                  </div>

                  {/* Linked Tasks Count */}
                  {kr.linkedTasks && kr.linkedTasks.length > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      {kr.linkedTasks.length} {kr.linkedTasks.length === 1 ? "tarea vinculada" : "tareas vinculadas"}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 bg-muted/20 rounded-xl sm:rounded-2xl border border-dashed">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {t("keyResults.empty") || "No hay resultados clave. Agrega uno para empezar a medir tu progreso."}
                </p>
                <Button onClick={() => setShowCreateKR(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("keyResults.addFirst") || "Agregar primer resultado clave"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Key Result Dialog */}
      <CreateKeyResultDialog
        open={showCreateKR}
        onOpenChange={setShowCreateKR}
        objectiveId={params.id as string}
      />
    </AppLayout>
  );
}
