"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWorkspaces, useWorkflows, useCreateProject, useCreateWorkflow } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Check, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
}

const projectColors = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6B7280", // gray
];

export function CreateProjectDialog({ open, onOpenChange, workspaceId }: CreateProjectDialogProps) {
  const t = useTranslations('CreateProjectDialog');
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState(projectColors[3]);

  const createWorkflowMutation = useCreateWorkflow();

  // Fetch workspaces if not provided (to check if any exist)
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();

  const createProjectSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
    color: z.string().optional(),
    workspaceId: z.string().min(1, t('validation.workspaceRequired')),
    workflowId: z.string().optional(),
  });

  type CreateProjectForm = z.infer<typeof createProjectSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId: workspaceId || "",
      color: projectColors[3],
      workflowId: "",
    },
  });

  const selectedWorkspaceId = watch("workspaceId");

  // Fetch workflows for the selected workspace
  const { data: workflows } = useWorkflows(selectedWorkspaceId);

  // Update default workflow when workflows change
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const firstWorkflow = workflows[0];
      if (firstWorkflow?.id) {
        setValue("workflowId", String(firstWorkflow.id));
      }
    } else if (workflows && workflows.length === 0) {
      // If no workflows, set to NEW to pass validation (we'll handle creation in submit)
      setValue("workflowId", "NEW");
    }
  }, [workflows, setValue]);

  // If we fetched workspaces and found some, set the first one as default if none selected
  useEffect(() => {
    if (!workspaceId && workspaces && workspaces.length > 0) {
      setValue("workspaceId", String(workspaces[0].id));
    }
  }, [workspaces, workspaceId, setValue]);

  // Sync workspaceId prop to form value
  useEffect(() => {
    if (workspaceId) {
      setValue("workspaceId", workspaceId);
    }
  }, [workspaceId, setValue]);

  const createProjectMutation = useCreateProject();

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      let finalWorkflowId = data.workflowId;

      // If no workflow ID provided (which is expected now as we removed the selector)
      if (!finalWorkflowId || finalWorkflowId === "NEW") {
        // 1. Try to find an existing "General" workflow in the current list
        const generalWorkflow = workflows?.find((w: any) => w.name === "General");

        if (generalWorkflow) {
          finalWorkflowId = String(generalWorkflow.id);
        } else {
          // 2. If not found, create a new "General" workflow
          const newWorkflow = await createWorkflowMutation.mutateAsync({
            name: "General",
            workspaceId: data.workspaceId,
            color: "#3B82F6", // Default blue
            icon: "layers",
          });
          finalWorkflowId = String(newWorkflow.id);
        }
      }

      await createProjectMutation.mutateAsync({
        ...data,
        workflowId: finalWorkflowId!, // We ensure it's set above
        color: selectedColor,
      });

      toast.success(t('toast.success'));
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('toast.error'));
    }
  };

  const showEmptyState = !workspaceId && !isLoadingWorkspaces && workspaces?.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          {showEmptyState ? (
             <EmptyState
             icon={Briefcase}
             title={t('emptyState.title')}
             description={t('emptyState.description')}
             actionLabel={t('emptyState.action')}
             onAction={() => {
                 onOpenChange(false);
                 toast.info(t('toast.createWorkspace'));
             }}
           />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Color Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" /> {t('form.color')}
                </Label>
                <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color 
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" 
                          : "hover:opacity-80"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">{t('form.name')}</Label>
                <input
                  id="name"
                  {...register("name")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('form.namePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Workspace Selection (if not provided) */}
              {!workspaceId && (
                 <div className="space-y-2">
                 <Label htmlFor="workspaceId" className="text-sm font-medium text-foreground">{t('form.workspace')}</Label>
                 <select
                   id="workspaceId"
                   {...register("workspaceId")}
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                   {workspaces?.map((ws: any) => (
                     <option key={ws.id} value={ws.id}>
                       {ws.name}
                     </option>
                   ))}
                 </select>
                 {errors.workspaceId && (
                   <p className="text-sm text-red-500">{errors.workspaceId.message}</p>
                 )}
               </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">{t('form.description')}</Label>
                <textarea
                  id="description"
                  {...register("description")}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={t('form.descriptionPlaceholder')}
                />
              </div>

              {/* Hidden workspace ID if provided */}
              {workspaceId && <input type="hidden" {...register("workspaceId")} />}

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {createProjectMutation.isPending ? t('buttons.creating') : t('buttons.create')}
                </button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
