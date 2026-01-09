import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, TaskTemplate } from "@/hooks/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  titlePattern: z.string().optional(),
  defaultPriority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  defaultDescription: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

export function TemplateManager() {
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates, isLoading } = useTemplates(selectedWorkspaceId || undefined);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      defaultPriority: "MEDIUM",
    },
  });

  const onSubmit = async (data: TemplateForm) => {
    if (!selectedWorkspaceId) return;

    try {
      if (editingId) {
        await updateTemplate.mutateAsync({
          id: editingId,
          data,
        });
        toast.success("Template updated");
        setEditingId(null);
      } else {
        await createTemplate.mutateAsync({
          workspaceId: selectedWorkspaceId,
          ...data,
          isPublic: true,
        });
        toast.success("Template created");
        setIsCreating(false);
      }
      form.reset();
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingId(template.id);
    setIsCreating(false);
    form.reset({
      name: template.name,
      description: template.description,
      titlePattern: template.titlePattern,
      defaultPriority: template.defaultPriority as any,
      defaultDescription: template.defaultDescription,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate.mutateAsync(id);
        toast.success("Template deleted");
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    form.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Task Templates</h3>
        <Button onClick={() => { setIsCreating(true); setEditingId(null); form.reset(); }} disabled={isCreating || !!editingId}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {(isCreating || editingId) && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input {...form.register("name")} placeholder="e.g. Bug Report" />
                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Title Pattern (Optional)</Label>
                <Input {...form.register("titlePattern")} placeholder="e.g. Bug: {date}" />
                <p className="text-xs text-muted-foreground">Supported: {'{date}, {time}'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Priority</Label>
                <Select 
                  onValueChange={(v) => form.setValue("defaultPriority", v as any)} 
                  defaultValue={form.getValues("defaultPriority")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Description</Label>
                <Input {...form.register("description")} placeholder="Short description of the template" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Task Description</Label>
              <Textarea 
                {...form.register("defaultDescription")} 
                placeholder="# Steps to reproduce..." 
                className="min-h-[100px]" 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
           <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : templates?.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
             No templates found. Create one to get started.
           </div>
        ) : (
          <div className="grid gap-2">
            {templates?.map((template: any) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                      {template.defaultPriority}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
