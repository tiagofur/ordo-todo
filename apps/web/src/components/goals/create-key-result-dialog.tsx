"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";
import { useAddKeyResult } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";

interface CreateKeyResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectiveId: string;
}

const metricTypes = [
  { value: "PERCENTAGE", label: "Porcentaje", unit: "%" },
  { value: "NUMBER", label: "Número", unit: "" },
  { value: "CURRENCY", label: "Moneda", unit: "$" },
  { value: "BOOLEAN", label: "Sí/No", unit: "" },
  { value: "TASK_COUNT", label: "Tareas completadas", unit: "tareas" },
];

export function CreateKeyResultDialog({
  open,
  onOpenChange,
  objectiveId,
}: CreateKeyResultDialogProps) {
  const t = useTranslations("Goals.keyResults");
  const addKeyResult = useAddKeyResult();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metricType, setMetricType] = useState("PERCENTAGE");
  const [startValue, setStartValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("%");

  const handleMetricTypeChange = (value: string) => {
    setMetricType(value);
    const metric = metricTypes.find((m) => m.value === value);
    if (metric) {
      setUnit(metric.unit);
      if (value === "PERCENTAGE") {
        setStartValue(0);
        setTargetValue(100);
      } else if (value === "BOOLEAN") {
        setStartValue(0);
        setTargetValue(1);
      } else {
        setStartValue(0);
        setTargetValue(10);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      notify.error(t("validation.titleRequired") || "El título es requerido");
      return;
    }

    try {
      await addKeyResult.mutateAsync({
        objectiveId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          metricType: metricType as any,
          startValue,
          targetValue,
          unit: unit || undefined,
        },
      });

      notify.success(t("toast.created") || "Resultado clave creado");
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      notify.error(error?.message || t("toast.error") || "Error al crear");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMetricType("PERCENTAGE");
    setStartValue(0);
    setTargetValue(100);
    setUnit("%");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createTitle") || "Agregar Resultado Clave"}</DialogTitle>
          <DialogDescription>
            {t("createDescription") || "Define un resultado medible para tu objetivo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("form.title") || "Título"} *</Label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("form.titlePlaceholder") || "Ej: Aumentar ventas mensuales"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("form.description") || "Descripción"}</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder") || "Describe cómo medirás el progreso..."}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Metric Type */}
          <div className="space-y-2">
            <Label>{t("form.metricType") || "Tipo de métrica"}</Label>
            <Select value={metricType} onValueChange={handleMetricTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          {metricType !== "BOOLEAN" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startValue">{t("form.startValue") || "Valor inicial"}</Label>
                <input
                  id="startValue"
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetValue">{t("form.targetValue") || "Valor objetivo"}</Label>
                <input
                  id="targetValue"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Unit */}
          {metricType !== "BOOLEAN" && metricType !== "PERCENTAGE" && (
            <div className="space-y-2">
              <Label htmlFor="unit">{t("form.unit") || "Unidad"}</Label>
              <input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t("form.unitPlaceholder") || "Ej: ventas, usuarios, horas"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("actions.cancel") || "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={addKeyResult.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {addKeyResult.isPending
                ? t("actions.creating") || "Creando..."
                : t("actions.create") || "Crear"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
