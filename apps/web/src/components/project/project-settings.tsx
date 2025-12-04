"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useUpdateProject,
  useArchiveProject,
  useDeleteProject,
} from "@/lib/api-hooks";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Palette, Check, Archive, Trash2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { PROJECT_COLORS, updateProjectSchema } from "@ordo-todo/core";

interface ProjectSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    archived?: boolean;
    slug?: string;
  };
  workspaceSlug: string;
}

export function ProjectSettings({
  project,
  workspaceSlug,
}: ProjectSettingsProps) {
  const t = useTranslations("ProjectSettings");
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(
    project.color || PROJECT_COLORS[3]
  );

  const formSchema = updateProjectSchema.extend({
    name: z.string().min(1, t("form.name.required")),
  });

  type UpdateProjectForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      color: project.color,
    },
  });

  useEffect(() => {
    reset({
      name: project.name,
      description: project.description || "",
      color: project.color,
    });
    setSelectedColor(project.color || PROJECT_COLORS[3]);
  }, [project, reset]);

  const updateProjectMutation = useUpdateProject();
  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        data: {
          ...data,
          color: selectedColor,
        },
      });

      toast.success(t("toast.updated"));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("toast.updateError"));
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProjectMutation.mutateAsync(project.id);
      toast.success(
        project.archived ? t("toast.unarchived") : t("toast.archived")
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("toast.archiveError"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      toast.success(t("toast.deleted"));
      router.push(`/workspaces/${workspaceSlug}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("toast.deleteError"));
    }
  };

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{t("general.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("general.description")}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4" /> {t("form.color.label")}
            </Label>
            <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
              {PROJECT_COLORS.map((color) => (
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
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              {t("form.name.label")}
            </Label>
            <input
              id="name"
              {...register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("form.name.placeholder")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              {t("form.description.label")}
            </Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={t("form.description.placeholder")}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                updateProjectMutation.isPending ||
                (!isDirty && selectedColor === project.color)
              }
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {updateProjectMutation.isPending
                ? t("actions.saving")
                : t("actions.save")}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/50 bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b border-destructive/50">
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("danger.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("danger.description")}
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Archive */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
            <div>
              <h4 className="font-medium">
                {project.archived
                  ? t("danger.unarchive.title")
                  : t("danger.archive.title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {project.archived
                  ? t("danger.unarchive.description")
                  : t("danger.archive.description")}
              </p>
            </div>
            <button
              onClick={handleArchive}
              disabled={archiveProjectMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
            >
              <Archive className="w-4 h-4" />
              {project.archived ? t("actions.unarchive") : t("actions.archive")}
            </button>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <h4 className="font-medium text-destructive">
                {t("danger.delete.title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("danger.delete.description")}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t("actions.delete")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteDialog.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("deleteDialog.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("deleteDialog.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
