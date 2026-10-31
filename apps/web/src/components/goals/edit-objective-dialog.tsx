"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateObjective } from "@/lib/api-hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Button, Input, Textarea, Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    ColorSwatchPicker, IconPicker, DatePicker
} from "@ordo-todo/ui";
import { Loader2 } from "lucide-react";
import { OKRPeriod } from "@ordo-todo/api-client";
import { notify } from "@/lib/notify";
import { parseCalendarDate } from "@ordo-todo/core";
import { format } from "date-fns";

const periodValues = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"] as const;

const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  period: z.enum(periodValues),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  color: z.string().default("#3B82F6"),
  icon: z.string().optional(),
});

interface EditObjectiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    objective: {
        id: string;
        title: string;
        description?: string | null;
        period: string;
        startDate: string | Date;
        endDate: string | Date;
        color?: string | null;
        icon?: string | null;
    };
}

/**
 * Dialog for editing an existing objective's title, description, period, dates, and color.
 */
export function EditObjectiveDialog({ open, onOpenChange, objective }: EditObjectiveDialogProps) {
    const t = useTranslations("Goals");
    const updateObjective = useUpdateObjective();

    const form = useForm({
        resolver: zodResolver(objectiveSchema),
        defaultValues: {
            title: objective.title,
            description: objective.description || "",
            period: (periodValues.includes(objective.period as typeof periodValues[number])
                ? objective.period
                : "QUARTERLY") as typeof periodValues[number],
            startDate: new Date(objective.startDate).toISOString().split('T')[0],
            endDate: new Date(objective.endDate).toISOString().split('T')[0],
            color: objective.color || "#3B82F6",
            icon: objective.icon || "🎯",
        }
    });

    // Reset form values when objective data changes
    useEffect(() => {
        if (open) {
            form.reset({
                title: objective.title,
                description: objective.description || "",
                period: (periodValues.includes(objective.period as typeof periodValues[number])
                    ? objective.period
                    : "QUARTERLY") as typeof periodValues[number],
                startDate: new Date(objective.startDate).toISOString().split('T')[0],
                endDate: new Date(objective.endDate).toISOString().split('T')[0],
                color: objective.color || "#3B82F6",
                icon: objective.icon || "🎯",
            });
        }
    }, [open, objective, form]);

    const onSubmit = (values: z.infer<typeof objectiveSchema>) => {
        updateObjective.mutate({
            objectiveId: objective.id,
            data: {
                title: values.title,
                description: values.description || undefined,
                period: values.period as unknown as OKRPeriod,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
                color: values.color,
                icon: values.icon,
            },
        }, {
            onSuccess: () => {
                onOpenChange(false);
                notify.success(t("updated") || "Objective updated successfully");
            },
            onError: () => {
                notify.error(t("updateError") || "Error updating objective");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
                <div className="p-6 pb-0">
                    <DialogHeader>
                        <DialogTitle>{t("editObjective")}</DialogTitle>
                        <DialogDescription>{t("editDescription")}</DialogDescription>
                    </DialogHeader>
                </div>

                <Form {...form}>
                    <form id="edit-objective-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.title")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("form.titlePlaceholder")} {...field} />
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
                                    <FormLabel>{t("form.description")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("form.descriptionPlaceholder")} {...field} />
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
                                    <FormLabel>{t("form.period")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="QUARTERLY">{t("periods.QUARTERLY")}</SelectItem>
                                            <SelectItem value="YEARLY">{t("periods.YEARLY")}</SelectItem>
                                            <SelectItem value="CUSTOM">{t("periods.CUSTOM")}</SelectItem>
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
                                    <FormLabel>{t("form.color")}</FormLabel>
                                    {/* ODD 025: picker canónico (muestra el color actual
                                        del objetivo como swatch extra si es de datos previos) */}
                                    <ColorSwatchPicker
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Icon — ODD 025 S3: picker canónico */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form.icon")}</FormLabel>
                                    <IconPicker
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
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
                                        <FormLabel>{t("form.startDate")}</FormLabel>
                                        {/* ODD 025 S11: DatePicker canónico */}
                                        <FormControl>
                                            <DatePicker
                                                date={field.value ? (parseCalendarDate(field.value) ?? undefined) : undefined}
                                                setDate={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                                            />
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
                                        <FormLabel>{t("form.endDate")}</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value ? (parseCalendarDate(field.value) ?? undefined) : undefined}
                                                setDate={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                                            />
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
                                {t("cancel")}
                            </Button>
                            <Button type="submit" form="edit-objective-form" disabled={updateObjective.isPending}>
                                {updateObjective.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("update")}
                            </Button>
                        </DialogFooter>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
