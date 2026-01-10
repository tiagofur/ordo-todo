"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Checkbox,
} from "@ordo-todo/ui";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExportableData {
  tasks?: any[];
  projects?: any[];
  habits?: any[];
  goals?: any[];
}

interface ExportDataButtonProps {
  data: ExportableData;
  filename?: string;
  className?: string;
}

export function ExportDataButton({ 
  data, 
  filename = "ordo-export",
  className 
}: ExportDataButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["tasks"]);

  const dataTypes = [
    { id: "tasks", label: "Tareas", count: data.tasks?.length || 0 },
    { id: "projects", label: "Proyectos", count: data.projects?.length || 0 },
    { id: "habits", label: "Hábitos", count: data.habits?.length || 0 },
    { id: "goals", label: "Metas", count: data.goals?.length || 0 },
  ].filter((type) => (data as any)[type.id]?.length > 0);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const exportData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      selectedTypes.forEach((type) => {
        if ((data as any)[type]) {
          exportData[type] = (data as any)[type];
        }
      });

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `${filename}-${format(new Date(), "yyyy-MM-dd")}.json`);
      toast.success("Datos exportados correctamente");
      setShowDialog(false);
    } catch (error) {
      toast.error("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Export each type as a separate CSV (tasks by default)
      selectedTypes.forEach((type) => {
        const items = (data as any)[type];
        if (!items?.length) return;

        const csv = convertToCSV(items, type);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        downloadBlob(
          blob,
          `${filename}-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      });

      toast.success(
        selectedTypes.length > 1
          ? `${selectedTypes.length} archivos exportados`
          : "Datos exportados correctamente"
      );
      setShowDialog(false);
    } catch (error) {
      toast.error("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <FileJson className="h-4 w-4 mr-2" />
            Exportar como JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar como CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogDescription>
              Selecciona qué datos deseas exportar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data type selection */}
            <div className="space-y-3">
              {dataTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleType(type.id)}
                    />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {type.count} items
                  </span>
                </div>
              ))}
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={exportToJSON}
                disabled={isExporting || selectedTypes.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4" />
                )}
                JSON
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={exportToCSV}
                disabled={isExporting || selectedTypes.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to download a blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert data to CSV format
function convertToCSV(items: any[], type: string): string {
  if (!items.length) return "";

  // Define columns based on type
  const columnConfigs: Record<string, { key: string; label: string }[]> = {
    tasks: [
      { key: "id", label: "ID" },
      { key: "title", label: "Título" },
      { key: "description", label: "Descripción" },
      { key: "status", label: "Estado" },
      { key: "priority", label: "Prioridad" },
      { key: "dueDate", label: "Fecha límite" },
      { key: "startDate", label: "Fecha inicio" },
      { key: "scheduledDate", label: "Fecha programada" },
      { key: "completedAt", label: "Completada" },
      { key: "estimatedMinutes", label: "Tiempo estimado (min)" },
      { key: "actualMinutes", label: "Tiempo real (min)" },
      { key: "createdAt", label: "Creada" },
    ],
    projects: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "description", label: "Descripción" },
      { key: "color", label: "Color" },
      { key: "status", label: "Estado" },
      { key: "createdAt", label: "Creado" },
    ],
    habits: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "description", label: "Descripción" },
      { key: "frequency", label: "Frecuencia" },
      { key: "currentStreak", label: "Racha actual" },
      { key: "bestStreak", label: "Mejor racha" },
      { key: "totalCompletions", label: "Total completados" },
      { key: "createdAt", label: "Creado" },
    ],
    goals: [
      { key: "id", label: "ID" },
      { key: "title", label: "Título" },
      { key: "description", label: "Descripción" },
      { key: "status", label: "Estado" },
      { key: "progress", label: "Progreso (%)" },
      { key: "startDate", label: "Fecha inicio" },
      { key: "endDate", label: "Fecha fin" },
      { key: "createdAt", label: "Creado" },
    ],
  };

  const columns = columnConfigs[type] || columnConfigs.tasks;

  // Header row
  const headers = columns.map((col) => escapeCSV(col.label)).join(",");

  // Data rows
  const rows = items.map((item) =>
    columns
      .map((col) => {
        let value = item[col.key];
        
        // Format dates
        if (value && (col.key.includes("Date") || col.key.includes("At"))) {
          try {
            value = format(new Date(value), "yyyy-MM-dd HH:mm");
          } catch {
            // Keep original value if date parsing fails
          }
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = "";
        }
        
        return escapeCSV(String(value));
      })
      .join(",")
  );

  return [headers, ...rows].join("\n");
}

// Escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
