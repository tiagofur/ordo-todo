import { z } from 'zod';
declare const createHabitSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    frequency: z.ZodEnum<["daily", "weekly", "custom"]>;
    daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    timeOfDay: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "anytime"]>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    reminderTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    frequency: "custom" | "daily" | "weekly";
    color?: string | undefined;
    icon?: string | undefined;
    description?: string | undefined;
    daysOfWeek?: number[] | undefined;
    timeOfDay?: "morning" | "afternoon" | "evening" | "anytime" | undefined;
    reminderTime?: string | undefined;
}, {
    name: string;
    frequency: "custom" | "daily" | "weekly";
    color?: string | undefined;
    icon?: string | undefined;
    description?: string | undefined;
    daysOfWeek?: number[] | undefined;
    timeOfDay?: "morning" | "afternoon" | "evening" | "anytime" | undefined;
    reminderTime?: string | undefined;
}>;
export type CreateHabitFormData = z.infer<typeof createHabitSchema>;
export interface CreateHabitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateHabitFormData) => Promise<void>;
    isPending?: boolean;
    labels?: {
        createTitle?: string;
        createDescription?: string;
        name?: string;
        namePlaceholder?: string;
        description?: string;
        descriptionPlaceholder?: string;
        frequency?: string;
        daily?: string;
        weekly?: string;
        custom?: string;
        daysOfWeek?: string;
        timeOfDay?: string;
        morning?: string;
        afternoon?: string;
        evening?: string;
        anytime?: string;
        color?: string;
        reminder?: string;
        cancel?: string;
        create?: string;
        creating?: string;
        errorMessage?: string;
    };
}
export declare function CreateHabitDialog({ open, onOpenChange, onSubmit, isPending, labels, }: CreateHabitDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-habit-dialog.d.ts.map