"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkspace } from "@/lib/api-hooks";
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
import { Building2, Home, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const t = useTranslations('CreateWorkspaceDialog');
  const [selectedType, setSelectedType] = useState<"PERSONAL" | "WORK" | "TEAM">("PERSONAL");

  const createWorkspaceSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
    type: z.enum(["PERSONAL", "WORK", "TEAM"]),
    color: z.string().optional(),
  });

  type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      type: "PERSONAL",
    },
  });

  const createWorkspace = useCreateWorkspace();

  const onSubmit = (data: CreateWorkspaceForm) => {
    createWorkspace.mutate({
      ...data,
      type: selectedType,
    }, {
      onSuccess: () => {
        toast.success(t('toast.success'));
        reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.message || t('toast.error'));
      }
    });
  };

  const workspaceTypes = [
    {
      value: "PERSONAL" as const,
      label: t('types.personal'),
      description: t('types.personalDesc'),
      icon: Home,
      color: "#06b6d4", // cyan-500
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-500",
      borderColor: "border-cyan-500",
    },
    {
      value: "WORK" as const,
      label: t('types.work'),
      description: t('types.workDesc'),
      icon: Building2,
      color: "#a855f7", // purple-500
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-500",
      borderColor: "border-purple-500",
    },
    {
      value: "TEAM" as const,
      label: t('types.team'),
      description: t('types.teamDesc'),
      icon: Users,
      color: "#ec4899", // pink-500
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-500",
      borderColor: "border-pink-500",
    },
  ];

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Workspace Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">{t('form.type')}</Label>
              <div className="grid grid-cols-3 gap-3">
                {workspaceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.value);
                        setValue("type", type.value);
                      }}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                        isSelected
                          ? `${type.borderColor} ${type.bgColor} shadow-lg`
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <div 
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                          isSelected ? type.bgColor : "bg-muted"
                        }`}
                        style={isSelected ? { backgroundColor: `${type.color}20` } : {}}
                      >
                        <Icon 
                          className={`w-6 h-6 transition-all duration-200 ${
                            isSelected ? type.textColor : "text-muted-foreground"
                          }`}
                          style={isSelected ? { color: type.color } : {}}
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {type.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight px-1">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
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
                disabled={createWorkspace.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl h-10 px-6 py-2"
              >
                {createWorkspace.isPending ? t('buttons.creating') : t('buttons.create')}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
