import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Button,
  Badge,
} from "@ordo-todo/ui";
import { Settings, Save, X } from "lucide-react";
import { useCustomFields, useTaskCustomValues, useSetTaskCustomValues } from "@/hooks/api";
import type { CustomField, CustomFieldValue, CustomFieldType } from "@ordo-todo/api-client";
import { useCustomFieldForm } from "@/hooks/api";
import { toast } from "sonner";

interface TaskCustomFieldsProps {
  taskId: string;
  projectId: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

export function TaskCustomFields({
  taskId,
  projectId,
  isEditing: externalIsEditing = false,
  onToggleEdit,
}: TaskCustomFieldsProps) {
  const [isEditing, setIsEditing] = useState(externalIsEditing);
  const { data: fields, isLoading } = useCustomFields(projectId);
  const { data: values, isLoading: valuesLoading } = useTaskCustomValues(taskId);
  const {
    values: formValues,
    handleChange,
    getValuesForSubmit,
    saveValues,
    isPending,
  } = useCustomFieldForm(projectId, taskId);
  const saveMutation = useSetTaskCustomValues();

  // Initialize form values when values are loaded
  useEffect(() => {
    if (values && !valuesLoading && fields) {
      const initialValues: Record<string, string> = {};
      values.forEach((value: CustomFieldValue) => {
        initialValues[value.fieldId] = value.value;
      });
      // Update form values without triggering re-render
      Object.entries(initialValues).forEach(([fieldId, value]) => {
        if (formValues[fieldId] !== value) {
          handleChange(fieldId, value);
        }
      });
    }
  }, [values, valuesLoading, fields]);

  // Sync with external editing state
  useEffect(() => {
    if (isEditing !== externalIsEditing) {
      setIsEditing(externalIsEditing);
    }
  }, [externalIsEditing]);

  const handleToggleEdit = () => {
    const newState = !isEditing;
    setIsEditing(newState);
    onToggleEdit?.();
  };

  const handleSave = async () => {
    try {
      await saveValues(taskId);
      setIsEditing(false);
      onToggleEdit?.();
      toast.success("Campos personalizados guardados");
    } catch (error) {
      toast.error("Error al guardar los campos personalizados");
      console.error("Error saving custom field values:", error);
    }
  };

  const renderField = (field: CustomField) => {
    const value = formValues[field.id] || "";
    const isRequired = field.isRequired;

    switch (field.type) {
      case "TEXT":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.name}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`field-${field.id}`}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.description || undefined}
              disabled={!isEditing}
            />
          </div>
        );

      case "NUMBER":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.name}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`field-${field.id}`}
              type="number"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.description || undefined}
              disabled={!isEditing}
            />
          </div>
        );

      case "DATE":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.name}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`field-${field.id}`}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={!isEditing}
            />
          </div>
        );

      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2 mt-2" key={field.id}>
            <Checkbox
              id={`field-${field.id}`}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleChange(field.id, checked ? "true" : "false")
              }
              disabled={!isEditing}
            />
            <Label htmlFor={`field-${field.id}`}>
              {field.name}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <span className="text-sm text-muted-foreground">
                {field.description}
              </span>
            )}
          </div>
        );

      case "SELECT":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.name}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleChange(field.id, newValue)}
              disabled={!isEditing}
            >
              <SelectTrigger id={`field-${field.id}`}>
                <SelectValue placeholder={field.description || "Selecciona una opción"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "MULTI_SELECT":
        const selectedValues = value ? value.split(",") : [];
        return (
          <div className="space-y-2" key={field.id}>
            <Label>{field.name}</Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.id}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((v) => v !== option);
                      handleChange(field.id, newValues.join(","));
                    }}
                    disabled={!isEditing}
                  />
                  <Label htmlFor={`field-${field.id}-${option}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading || valuesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Campos Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Campos Personalizados
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleEdit}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={handleToggleEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Modo edición:</strong> Modifica los valores de los campos personalizados.
            </p>
          </div>
        )}

        {fields.map((field: any) => (
          <div key={field.id} className="border-l-2 border-primary pl-4">
            {renderField(field)}
          </div>
        ))}

        {!isEditing && formValues && Object.keys(formValues).length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No hay valores configurados para los campos personalizados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}