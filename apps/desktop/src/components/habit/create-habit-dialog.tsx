import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Sun, Moon, Sunset } from "lucide-react";
import { useCreateHabit } from "@/hooks/api";
import { toast } from "sonner";
import type { HabitFrequency, TimeOfDay } from "@ordo-todo/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  daysOfWeek: z.array(z.number()).optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).optional(),
  color: z.string().optional(),
  reminderTime: z.string().optional(),
});

type CreateHabitForm = z.infer<typeof createHabitSchema>;

export function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const { t } = (useTranslation as any)();
  const createHabitMutation = useCreateHabit();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateHabitForm>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      frequency: "daily",
      timeOfDay: "anytime",
      color: "#10B981",
    },
  });

  const currentFrequency = watch("frequency");
  const currentTimeOfDay = watch("timeOfDay");
  const currentColor = watch("color");

  const onSubmit = async (data: CreateHabitForm) => {
    try {
      await createHabitMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        frequency: data.frequency.toUpperCase() as HabitFrequency,
        targetDaysOfWeek: data.daysOfWeek,
        timeOfDay: data.timeOfDay?.toUpperCase() as TimeOfDay | undefined,
        color: data.color,
        preferredTime: data.reminderTime || undefined,
      });
      toast.success(t("Habits.toast.created", "Hábito criado!"));
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t("Habits.toast.error", { message: error?.message || "Failed to create habit" }));
    }
  };


  const frequencies = [
    { value: "daily", label: t("Habits.frequency.daily", "Diário") },
    { value: "weekly", label: t("Habits.frequency.weekly", "Semanal") },
    { value: "custom", label: t("Habits.frequency.custom", "Personalizado") },
  ];

  const timesOfDay = [
    { value: "morning", label: t("Habits.timeOfDay.morning", "Manhã"), icon: Sun },
    { value: "afternoon", label: t("Habits.timeOfDay.afternoon", "Tarde"), icon: Sun },
    { value: "evening", label: t("Habits.timeOfDay.evening", "Noite"), icon: Sunset },
    { value: "anytime", label: t("Habits.timeOfDay.anytime", "Qualquer hora"), icon: Moon },
  ];

  const colors = [
    "#10B981", "#f59e0b", "#8b5cf6", "#ec4899",
    "#06b6d4", "#3b82f6", "#ef4444", "#84cc16",
  ];

  const weekDays = [
    { label: "D", value: 0 },
    { label: "S", value: 1 },
    { label: "T", value: 2 },
    { label: "Q", value: 3 },
    { label: "Q", value: 4 },
    { label: "S", value: 5 },
    { label: "S", value: 6 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: currentColor }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("Habits.form.createTitle", "Novo Hábito")}</DialogTitle>
              <DialogDescription>
                {t("Habits.form.createDescription", "Crie um novo hábito")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("Habits.form.name", "Nome do hábito")}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("Habits.form.namePlaceholder", "Ex: Meditar por 10 minutos")}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("Habits.form.description", "Descrição")}</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={t("Habits.form.descriptionPlaceholder", "Por que este hábito é importante?")}
              rows={3}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>{t("Habits.form.frequency", "Frequência")}</Label>
            <div className="flex gap-2">
              {frequencies.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setValue("frequency", f.value as any)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentFrequency === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week */}
          {(currentFrequency === "weekly" || currentFrequency === "custom") && (
            <div className="space-y-2">
              <Label>{t("Habits.form.daysOfWeek", "Dias da semana")}</Label>
              <div className="flex gap-2">
                {weekDays.map((day) => {
                  const selectedDays = watch("daysOfWeek") || [];
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const current = watch("daysOfWeek") || [];
                        if (isSelected) {
                          setValue("daysOfWeek", current.filter((d) => d !== day.value));
                        } else {
                          setValue("daysOfWeek", [...current, day.value]);
                        }
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time of Day */}
          <div className="space-y-2">
            <Label>{t("Habits.form.timeOfDay", "Horário do dia")}</Label>
            <div className="grid grid-cols-4 gap-2">
              {timesOfDay.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => setValue("timeOfDay", time.value as any)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-medium transition-colors border",
                    currentTimeOfDay === time.value
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  )}
                >
                  <time.icon className="h-4 w-4" />
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>{t("Habits.form.color", "Cor")}</Label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    currentColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">{t("Habits.form.reminder", "Lembrete")}</Label>
            <Input
              type="time"
              id="reminderTime"
              {...register("reminderTime")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("Habits.form.cancel", "Cancelar")}
            </Button>
            <Button type="submit" disabled={createHabitMutation.isPending}>
              {createHabitMutation.isPending 
                ? t("Habits.form.creating", "Criando...") 
                : t("Habits.form.create", "Criar Hábito")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
