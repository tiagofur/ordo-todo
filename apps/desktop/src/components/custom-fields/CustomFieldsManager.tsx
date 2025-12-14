import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ordo-todo/ui";
import { Button } from "@ordo-todo/ui";
import { ScrollArea } from "@ordo-todo/ui";
import { Separator, EmptyState } from "@ordo-todo/ui";
import { Settings, Edit, Trash2, Plus } from "lucide-react";
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField } from "@/hooks/api/use-custom-fields";
import type { CustomField, CreateCustomFieldDto, UpdateCustomFieldDto } from "@ordo-todo/api-client";
import { CustomFieldForm } from "./CustomFieldForm";
import { toast } from "sonner";

interface CustomFieldsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CustomFieldsManager({
  open,
  onOpenChange,
  projectId,
}: CustomFieldsManagerProps) {
  const [editingField, setEditingField] = useState<CustomField | undefined>(undefined);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { data: fields, isLoading, error } = useCustomFields(projectId);
  const createFieldMutation = useCreateCustomField();
  const updateFieldMutation = useUpdateCustomField();
  const deleteFieldMutation = useDeleteCustomField();

  const handleCreate = () => {
    setEditingField(undefined);
    setIsCreateMode(true);
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setIsCreateMode(false);
  };

  const handleSave = async (data: CreateCustomFieldDto | UpdateCustomFieldDto) => {
    try {
      if (isCreateMode) {
        await createFieldMutation.mutateAsync({ projectId, data: data as CreateCustomFieldDto });
        toast.success("Campo personalizado creado exitosamente");
      } else {
        await updateFieldMutation.mutateAsync({
          fieldId: editingField!.id,
          data,
          projectId,
        });
        toast.success("Campo personalizado actualizado exitosamente");
      }
      setIsCreateMode(false);
      setEditingField(undefined);
    } catch (error) {
      toast.error("Error al guardar el campo personalizado");
      console.error("Error saving custom field:", error);
    }
  };

  const handleDelete = async (fieldId: string, fieldName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el campo "${fieldName}"?`)) {
      return;
    }

    try {
      await deleteFieldMutation.mutateAsync({ fieldId, projectId });
      toast.success("Campo personalizado eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el campo personalizado");
      console.error("Error deleting custom field:", error);
    }
  };

  const handleClose = () => {
    setIsCreateMode(false);
    setEditingField(undefined);
    onOpenChange(false);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      TEXT: "Texto",
      NUMBER: "Número",
      DATE: "Fecha",
      SELECT: "Selección",
      MULTI_SELECT: "Múltiple",
      BOOLEAN: "Sí/No",
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      TEXT: "📝",
      NUMBER: "🔢",
      DATE: "📅",
      SELECT: "📋",
      MULTI_SELECT: "☑️",
      BOOLEAN: "✅",
    };
    return iconMap[type] || "📝";
  };

  if (isCreateMode || editingField) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Crear Campo Personalizado" : "Editar Campo Personalizado"}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Agrega un nuevo campo personalizado para este proyecto"
                : "Modifica los detalles del campo personalizado"}
            </DialogDescription>
          </DialogHeader>
          <CustomFieldForm
            field={editingField}
            projectId={projectId}
            onSave={handleSave}
            onCancel={handleClose}
            isPending={createFieldMutation.isPending || updateFieldMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Campos Personalizados
          </DialogTitle>
          <DialogDescription>
            Gestiona los campos personalizados para este proyecto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {fields ? `${fields.length} campo${fields.length !== 1 ? "s" : ""} configurado${fields.length !== 1 ? "s" : ""}` : "Cargando..."}
            </p>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Campo
            </Button>
          </div>

          <Separator />

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Cargando campos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-destructive">Error al cargar los campos</p>
              </div>
            ) : !fields || fields.length === 0 ? (
              <EmptyState
                icon={Settings as any}
                title="Sin campos personalizados"
                description="Crea campos personalizados para agregar más información a tus tareas"
                onAction={handleCreate}
              />
            ) : (
              <div className="space-y-3">
                {fields.map((field: any) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTypeIcon(field.type)}</span>
                        <div>
                          <h4 className="font-medium">{field.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(field.type)}
                            {field.required && " • Requerido"}
                          </p>
                        </div>
                      </div>
                      {field.description && (
                        <p className="text-sm text-muted-foreground ml-11">
                          {field.description}
                        </p>
                      )}
                      {field.options && field.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-11">
                          {field.options.slice(0, 3).map((option: any, index: number) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-muted rounded"
                            >
                              {option}
                            </span>
                          ))}
                          {field.options.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-muted rounded">
                              +{field.options.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(field.id, field.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 Tips para campos personalizados:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Usa nombres claros como "Prioridad", "Estado", "Etiqueta"</li>
              <li>Para categorías usa "Selección" con opciones predefinidas</li>
              <li>Para múltiples etiquetas usa "Múltiple Selección"</li>
              <li>Marca como requerido los campos que siempre deben tener valor</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cerrar
          </Button>
          <Button onClick={handleCreate} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Campo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}