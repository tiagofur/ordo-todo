"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Pencil, X, Settings2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Switch,
  Textarea,
} from "@ordo-todo/ui";
import {
  useCustomFields,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField,
} from "@/hooks/use-custom-fields";
import type { CustomField, CustomFieldType } from "@ordo-todo/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FIELD_TYPES: { value: CustomFieldType; label: string; icon: string }[] = [
  { value: "TEXT", label: "Text", icon: "📝" },
  { value: "NUMBER", label: "Number", icon: "🔢" },
  { value: "SELECT", label: "Single Select", icon: "📋" },
  { value: "MULTI_SELECT", label: "Multi Select", icon: "☑️" },
  { value: "DATE", label: "Date", icon: "📅" },
  { value: "URL", label: "URL", icon: "🔗" },
  { value: "EMAIL", label: "Email", icon: "📧" },
  { value: "CHECKBOX", label: "Checkbox", icon: "✅" },
];

interface CustomFieldsEditorProps {
  projectId: string;
}

export function CustomFieldsEditor({ projectId }: CustomFieldsEditorProps) {
  const { data: fields, isLoading } = useCustomFields(projectId);
  const createField = useCreateCustomField();
  const updateField = useUpdateCustomField();
  const deleteField = useDeleteCustomField();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomFieldType>("TEXT");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const resetForm = () => {
    setName("");
    setType("TEXT");
    setDescription("");
    setOptions([]);
    setOptionInput("");
    setIsRequired(false);
    setEditingField(null);
  };

  const openEditDialog = (field: CustomField) => {
    setEditingField(field);
    setName(field.name);
    setType(field.type);
    setDescription(field.description || "");
    setOptions(field.options || []);
    setIsRequired(field.isRequired);
    setIsCreateOpen(true);
  };

  const handleAddOption = () => {
    if (optionInput.trim() && !options.includes(optionInput.trim())) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Field name is required");
      return;
    }

    if ((type === "SELECT" || type === "MULTI_SELECT") && options.length === 0) {
      toast.error("Select fields require at least one option");
      return;
    }

    try {
      if (editingField) {
        await updateField.mutateAsync({
          fieldId: editingField.id,
          projectId,
          data: {
            name,
            description: description || undefined,
            options: type === "SELECT" || type === "MULTI_SELECT" ? options : undefined,
            isRequired,
          },
        });
        toast.success("Field updated");
      } else {
        await createField.mutateAsync({
          projectId,
          data: {
            name,
            type,
            description: description || undefined,
            options: type === "SELECT" || type === "MULTI_SELECT" ? options : undefined,
            isRequired,
          },
        });
        toast.success("Field created");
      }
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save field");
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm("Delete this custom field? All values will be lost.")) return;
    try {
      await deleteField.mutateAsync({ fieldId, projectId });
      toast.success("Field deleted");
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  const getTypeInfo = (fieldType: CustomFieldType) =>
    FIELD_TYPES.find((t) => t.value === fieldType) || FIELD_TYPES[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Custom Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Custom Fields
            </CardTitle>
            <CardDescription>
              Add custom properties to tasks in this project
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingField ? "Edit Field" : "Create Custom Field"}
                </DialogTitle>
                <DialogDescription>
                  {editingField
                    ? "Update the field properties"
                    : "Add a new custom property for tasks"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    placeholder="e.g. Sprint, Story Points, Client"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {!editingField && (
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as CustomFieldType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((ft) => (
                          <SelectItem key={ft.value} value={ft.value}>
                            <span className="flex items-center gap-2">
                              <span>{ft.icon}</span>
                              <span>{ft.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="field-desc">Description (optional)</Label>
                  <Textarea
                    id="field-desc"
                    placeholder="Help text for this field"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {(type === "SELECT" || type === "MULTI_SELECT") && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add option..."
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={handleAddOption}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {options.map((opt) => (
                        <Badge key={opt} variant="secondary" className="gap-1">
                          {opt}
                          <button
                            onClick={() => handleRemoveOption(opt)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="required">Required field</Label>
                  <Switch
                    id="required"
                    checked={isRequired}
                    onCheckedChange={setIsRequired}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createField.isPending || updateField.isPending}>
                  {editingField ? "Save Changes" : "Create Field"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {fields?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No custom fields yet</p>
            <p className="text-sm">Add fields to track additional properties on tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields?.map((field: CustomField) => {
              const typeInfo = getTypeInfo(field.type);
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="text-lg">{typeInfo.icon}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {field.name}
                        {field.isRequired && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {typeInfo.label}
                        {field.options && field.options.length > 0 && (
                          <span className="ml-2">
                            ({field.options.length} options)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(field)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
