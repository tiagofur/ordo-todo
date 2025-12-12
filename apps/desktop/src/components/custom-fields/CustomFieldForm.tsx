import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { CustomField, CreateCustomFieldDto, UpdateCustomFieldDto } from "@ordo-todo/api-client";

interface CustomFieldFormProps {
  field?: CustomField;
  projectId: string;
  onSave: (data: CreateCustomFieldDto | UpdateCustomFieldDto) => void;
  onCancel: () => void;
  isPending?: boolean;
}

const fieldTypes = [
  { value: "TEXT", label: "Texto", icon: "📝" },
  { value: "NUMBER", label: "Número", icon: "🔢" },
  { value: "DATE", label: "Fecha", icon: "📅" },
  { value: "SELECT", label: "Selección", icon: "📋" },
  { value: "MULTI_SELECT", label: "Múltiple Selección", icon: "☑️" },
  { value: "BOOLEAN", label: "Sí/No", icon: "✅" },
] as const;

export function CustomFieldForm({
  field,
  projectId,
  onSave,
  onCancel,
  isPending = false,
}: CustomFieldFormProps) {
  const [formData, setFormData] = useState({
    name: field?.name || "",
    type: field?.type || "TEXT",
    description: field?.description || "",
    required: field?.required || false,
    options: field?.options || [],
  });

  const [newOption, setNewOption] = useState("");

  const isEdit = !!field;
  const isSelectType = formData.type === "SELECT" || formData.type === "MULTI_SELECT";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    const data = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      required: formData.required,
      options: isSelectType ? formData.options.filter(opt => opt.trim()) : [],
    };

    if (isEdit) {
      onSave({ ...data, fieldId: field.id } as UpdateCustomFieldDto);
    } else {
      onSave(data as CreateCustomFieldDto);
    }
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption("");
    }
  };

  const removeOption = (optionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== optionToRemove),
    }));
  };

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      options: (newType === "SELECT" || newType === "MULTI_SELECT") ? prev.options : [],
    }));
  };

  const selectedType = fieldTypes.find(t => t.value === formData.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del campo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Prioridad, Estado, Etiqueta..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo de campo</Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedType && (
          <p className="text-sm text-muted-foreground">
            {selectedType.icon} {selectedType.label}:{" "}
            {selectedType.value === "TEXT" && "Cualquier texto"}
            {selectedType.value === "NUMBER" && "Valores numéricos"}
            {selectedType.value === "DATE" && "Selección de fecha"}
            {selectedType.value === "SELECT" && "Una opción de la lista"}
            {selectedType.value === "MULTI_SELECT" && "Múltiples opciones"}
            {selectedType.value === "BOOLEAN" && "Sí o No"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe para qué sirve este campo..."
        />
      </div>

      {isSelectType && (
        <div className="space-y-3">
          <Label>Opciones del campo</Label>
          {formData.options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.options.map((option, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option}
                  <button
                    type="button"
                    onClick={() => removeOption(option)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Agregar opción..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addOption}
              disabled={!newOption.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Presiona Enter o haz clic en + para agregar opciones
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={formData.required}
          onCheckedChange={(checked) =>
            setFormData(prev => ({ ...prev, required: checked as boolean }))
          }
        />
        <Label htmlFor="required" className="text-sm">
          Campo requerido
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}