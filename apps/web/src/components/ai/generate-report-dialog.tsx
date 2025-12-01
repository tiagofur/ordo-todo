"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useGenerateWeeklyReport } from "@/lib/api-hooks";

interface GenerateReportDialogProps {
  onSuccess?: (report: any) => void;
  trigger?: React.ReactNode;
}

export function GenerateReportDialog({ onSuccess, trigger }: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const generateReport = useGenerateWeeklyReport();

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync();
      if (onSuccess) {
        onSuccess(result);
      }
      // Keep dialog open to show success message
      setTimeout(() => {
        setOpen(false);
        generateReport.reset();
      }, 2000);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    generateReport.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generar Reporte con IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar Reporte de Productividad
          </DialogTitle>
          <DialogDescription>
            La IA analizará tu productividad de la última semana y generará un reporte detallado con insights y recomendaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!generateReport.isLoading && !generateReport.isSuccess && (
            <>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>El reporte incluirá:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Análisis de tus métricas semanales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Identificación de fortalezas y áreas de mejora</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Recomendaciones personalizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Patrones de productividad detectados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Score de productividad general</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generar Reporte
                </Button>
              </div>
            </>
          )}

          {generateReport.isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-medium">Generando tu reporte...</p>
                <p className="text-sm text-muted-foreground">
                  La IA está analizando tus datos de productividad. Esto puede tomar unos segundos.
                </p>
              </div>
            </div>
          )}

          {generateReport.isSuccess && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-green-600">¡Reporte generado exitosamente!</p>
                <p className="text-sm text-muted-foreground">
                  Tu reporte de productividad está listo.
                </p>
              </div>
            </div>
          )}

          {generateReport.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Hubo un error al generar el reporte. Por favor, intenta nuevamente.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cerrar
                </Button>
                <Button onClick={handleGenerate} variant="destructive" className="gap-2">
                  Reintentar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
