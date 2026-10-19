import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateObjective } from "@/hooks/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";
import { Loader2 } from "lucide-react";
import { TAG_COLORS } from "@ordo-todo/core";

const periodValues = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"] as const;

const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  period: z.enum(periodValues),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  color: z.string().default("#3B82F6"),
});

interface CreateObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateObjectiveDialog({ open, onOpenChange }: CreateObjectiveDialogProps) {
  const { t } = (useTranslation as any)();
  const createObjective = useCreateObjective();

  const form = useForm({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: "",
      description: "",
      period: "QUARTERLY" as const,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
      color: "#3B82F6",
    },
  });

  const onSubmit = (values: z.infer<typeof objectiveSchema>) => {
    createObjective.mutate(
      {
        ...values,
        period: values.period as any,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
        onError: (error) => {
          if (process.env.NODE_ENV === "development") console.error(error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>{t("Goals.createObjective", "Nuevo Objetivo")}</DialogTitle>
            <DialogDescription>
              {t("Goals.createDescription", "Crea un nuevo objetivo para rastrear tus metas.")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            id="objective-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Goals.form.title", "Título")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Goals.form.titlePlaceholder", "ej. Aumentar ingresos en un 20%")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Goals.form.description", "Descripción")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "Goals.form.descriptionPlaceholder",
                        "Descripción opcional del objetivo"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Goals.form.period", "Período")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="QUARTERLY">
                        {t("Goals.periods.QUARTERLY", "Trimestral")}
                      </SelectItem>
                      <SelectItem value="YEARLY">{t("Goals.periods.YEARLY", "Anual")}</SelectItem>
                      <SelectItem value="CUSTOM">
                        {t("Goals.periods.CUSTOM", "Personalizado")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Goals.form.color", "Color")}</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-lg transition-all ${
                          field.value === color
                            ? "scale-110 ring-2 ring-offset-2 ring-primary"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Goals.form.startDate", "Fecha de Inicio")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Goals.form.endDate", "Fecha de Fin")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>

          <div className="p-6 pt-4 border-t bg-background">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("Goals.cancel", "Cancelar")}
              </Button>
              <Button type="submit" form="objective-form" disabled={createObjective.isPending}>
                {createObjective.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("Goals.create", "Crear Objetivo")}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
