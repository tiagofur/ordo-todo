import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles, Calendar, FolderKanban, User, TrendingUp } from "lucide-react";
import { PageTransition, SlideIn } from "@/components/motion";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle } from "@ordo-todo/ui";
import { ReportCard } from "@ordo-todo/ui";
import { useReports } from "@/hooks/api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function Reports() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedScope, setSelectedScope] = useState<string | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reports, isLoading } = useReports({ scope: selectedScope, limit: 20 });

  const handleGenerateReport = async (type: "WEEKLY" | "MONTHLY") => {
    setIsGenerating(true);
    try {
      await apiClient.generateReport({ type, scope: "WEEKLY_SCHEDULED" });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Reporte generado exitosamente");
      setShowGenerateDialog(false);
    } catch (error) {
      toast.error("Error al generar reporte");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
  };

  const handleCloseDetail = () => {
    setSelectedReport(null);
  };

  const filterByScope = (scope?: string) => {
    setSelectedScope(scope);
  };

  const accentColor = "#8b5cf6"; // Purple

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <FileText className="h-6 w-6" />
                </div>
                Reportes de IA
              </h1>
              <p className="text-muted-foreground mt-2">
                Análisis inteligentes de tu productividad generados por IA
              </p>
            </div>
            <Button onClick={() => setShowGenerateDialog(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </SlideIn>

        {/* Tabs for filtering */}
        <SlideIn direction="top" delay={0.1}>
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
                  <Button onClick={() => setShowGenerateDialog(true)} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
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
                  <Button onClick={() => handleGenerateReport("WEEKLY")} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Reporte Semanal
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
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
        </SlideIn>

        {/* Generate Report Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Reporte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona el tipo de reporte que deseas generar:
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleGenerateReport("WEEKLY")}
                  disabled={isGenerating}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reporte Semanal
                  <span className="ml-auto text-xs text-muted-foreground">
                    Análisis de los últimos 7 días
                  </span>
                </Button>
                <Button
                  onClick={() => handleGenerateReport("MONTHLY")}
                  disabled={isGenerating}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reporte Mensual
                  <span className="ml-auto text-xs text-muted-foreground">
                    Próximamente
                  </span>
                </Button>
              </div>
              {isGenerating && (
                <div className="text-center py-4">
                  <Sparkles className="h-6 w-6 animate-pulse mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Generando reporte...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={handleCloseDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle del Reporte</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedReport.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p>{selectedReport.content}</p>
                </div>
                {selectedReport.insights && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Insights</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedReport.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
