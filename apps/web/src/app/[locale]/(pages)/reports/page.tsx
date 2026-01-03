"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { AppLayout } from "@/components/shared/app-layout";
import { ReportCard } from "@/components/ai/report-card";
import { ReportDetail } from "@/components/ai/report-detail";
import { GenerateReportDialog } from "@/components/ai/generate-report-dialog";
import { useReports } from "@/lib/api-hooks";
import { FileText, Sparkles, ArrowLeft, Calendar, FolderKanban, User, BarChart3, TrendingUp, Lightbulb, Rocket } from "lucide-react";

const REPORTS_ONBOARDING_KEY = "reports-onboarding-seen";

const reportsOnboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    color: "#8b5cf6",
    title: "Reportes Inteligentes",
    description: "La IA analiza tu productividad y genera insights personalizados para ayudarte a mejorar.",
  },
  {
    id: "weekly",
    icon: Calendar,
    color: "#10b981",
    title: "Resúmenes Semanales",
    description: "Cada semana recibirás un análisis de tu desempeño: tareas completadas, tiempo trabajado y patrones.",
  },
  {
    id: "insights",
    icon: Lightbulb,
    color: "#f59e0b",
    title: "Insights Personalizados",
    description: "Descubre tus horas más productivas, identifica obstáculos y recibe recomendaciones de mejora.",
  },
  {
    id: "trends",
    icon: TrendingUp,
    color: "#0ea5e9",
    title: "Tendencias de Productividad",
    description: "Visualiza tu progreso a lo largo del tiempo. ¿Estás mejorando o necesitas ajustar tu estrategia?",
  },
  {
    id: "getstarted",
    icon: Rocket,
    color: "#8b5cf6",
    title: "¡Genera tu Primer Reporte!",
    description: "Haz clic en 'Generar Reporte' para obtener un análisis completo de tu productividad actual.",
  },
];

export default function ReportsPage() {
  const [selectedScope, setSelectedScope] = useState<string | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const { data: reports, isLoading } = useReports({ scope: selectedScope, limit: 20 });
  const accentColor = "#8b5cf6"; // Purple

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const filterByScope = (scope?: string) => {
    setSelectedScope(scope);
  };

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
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Reportes de IA
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Análisis inteligentes de tu productividad generados por IA
            </p>
          </div>
          <GenerateReportDialog onSuccess={() => {}} />
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => filterByScope(undefined)}>
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              onClick={() => filterByScope("WEEKLY_SCHEDULED")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Semanales
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              onClick={() => filterByScope("MONTHLY_SCHEDULED")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mensuales
            </TabsTrigger>
            <TabsTrigger
              value="task"
              onClick={() => filterByScope("TASK_COMPLETION")}
              className="flex items-center gap-2"
            >
              <FolderKanban className="h-4 w-4" />
              Tareas
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              onClick={() => filterByScope("PERSONAL_ANALYSIS")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
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
                    onClick={() => handleReportClick(report)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay reportes todavía
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Genera tu primer reporte de productividad para obtener insights personalizados sobre tu trabajo.
                </p>
                <GenerateReportDialog />
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {reports.map((report: any) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={() => handleReportClick(report)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay reportes semanales
                </h3>
                <p className="text-muted-foreground mb-6">
                  Genera un reporte semanal para analizar tu productividad de los últimos 7 días.
                </p>
                <GenerateReportDialog />
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Reportes mensuales próximamente
              </h3>
              <p className="text-muted-foreground">
                Esta funcionalidad estará disponible pronto.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="task" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Reportes de tareas próximamente
              </h3>
              <p className="text-muted-foreground">
                Esta funcionalidad estará disponible pronto.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Análisis personal próximamente
              </h3>
              <p className="text-muted-foreground">
                Esta funcionalidad estará disponible pronto.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={handleCloseDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetail}
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

        {/* Onboarding */}
        <FeatureOnboarding
          steps={reportsOnboardingSteps}
          storageKey={REPORTS_ONBOARDING_KEY}
          skipText="Saltar"
          nextText="Siguiente"
          getStartedText="¡Explorar Reportes!"
        />
      </div>
    </AppLayout>
  );
}
