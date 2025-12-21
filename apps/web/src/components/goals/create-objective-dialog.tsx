"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateObjective } from "@/lib/api-hooks";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Button, Input, Textarea, Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@ordo-todo/ui";
import { Loader2 } from "lucide-react";
import { OKRPeriod } from "@ordo-todo/api-client";
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
    const t = useTranslations("Goals");
    const createObjective = useCreateObjective();
    
    // Removing explicit generic to avoid Zod vs RHF type mismatch on optional fields
    const form = useForm({
        resolver: zodResolver(objectiveSchema),
        defaultValues: {
            title: "",
            description: "",
            period: "QUARTERLY" as const, // Cast needed for literal type matching
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            color: "#3B82F6"
        }
    });

    const onSubmit = (values: z.infer<typeof objectiveSchema>) => {
        createObjective.mutate({
            ...values,
            // Cast to OKRPeriod type from api-client to satisfy DTO constraint
            period: values.period as unknown as OKRPeriod,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
            description: values.description || undefined,
        }, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            },
            onError: (error) => {
                console.error(error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("createObjective")}</DialogTitle>
                    <DialogDescription>{t("createDescription")}</DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <div className="flex flex-wrap gap-2">
                                        {TAG_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`h-10 w-10 rounded-lg transition-all ${field.value === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
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
                                        <FormLabel>{t("form.startDate")}</FormLabel>
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
                                        <FormLabel>{t("form.endDate")}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={createObjective.isPending}>
                                {createObjective.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
