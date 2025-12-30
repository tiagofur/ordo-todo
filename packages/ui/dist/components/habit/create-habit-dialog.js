'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { Label } from '../ui/label.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Sun, Moon, Sunset } from 'lucide-react';
import { TAG_COLORS } from '@ordo-todo/core';
// Define the schema here
const createHabitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'custom']),
    daysOfWeek: z.array(z.number()).optional(),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'anytime']).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    reminderTime: z.string().optional(),
});
const DEFAULT_LABELS = {
    createTitle: 'Create New Habit',
    createDescription: 'Build a new positive habit. Small steps lead to big changes.',
    name: 'Name',
    namePlaceholder: 'e.g., Read 30 minutes',
    description: 'Description (Optional)',
    descriptionPlaceholder: 'Why do you want to build this habit?',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    custom: 'Custom',
    daysOfWeek: 'Days of Week',
    timeOfDay: 'Time of Day',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    anytime: 'Anytime',
    color: 'Color',
    reminder: 'Reminder Time (Optional)',
    cancel: 'Cancel',
    create: 'Create Habit',
    creating: 'Creating...',
    errorMessage: 'Failed to create habit',
};
export function CreateHabitDialog({ open, onOpenChange, onSubmit, isPending = false, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = useForm({
        resolver: zodResolver(createHabitSchema),
        defaultValues: {
            frequency: 'daily',
            timeOfDay: 'anytime',
            color: TAG_COLORS[2], // Emerald
        },
    });
    const currentFrequency = watch('frequency');
    const currentTimeOfDay = watch('timeOfDay');
    const currentColor = watch('color');
    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            reset();
            onOpenChange(false);
        }
        catch {
            // Error handling is usually done in the parent via toast, 
            // but form errors could be set here if passed back.
            // For now, we rely on parent to show global error toast.
        }
    };
    const frequencies = [
        { value: 'daily', label: t.daily },
        { value: 'weekly', label: t.weekly },
        { value: 'custom', label: t.custom },
    ];
    const timesOfDay = [
        { value: 'morning', label: t.morning, icon: Sun },
        { value: 'afternoon', label: t.afternoon, icon: Sun },
        { value: 'evening', label: t.evening, icon: Sunset },
        { value: 'anytime', label: t.anytime, icon: Moon },
    ];
    const weekDays = [
        { label: 'L', value: 1 },
        { label: 'M', value: 2 },
        { label: 'X', value: 3 },
        { label: 'J', value: 4 },
        { label: 'V', value: 5 },
        { label: 'S', value: 6 },
        { label: 'D', value: 0 },
    ];
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[500px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border", children: [_jsx("div", { className: "p-6 pb-0", children: _jsx(DialogHeader, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl text-white", style: { backgroundColor: currentColor }, children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-xl font-semibold text-foreground", children: t.createTitle }), _jsx(DialogDescription, { className: "text-muted-foreground", children: t.createDescription })] })] }) }) }), _jsx("div", { className: "flex-1 overflow-y-auto px-6", children: _jsxs("form", { id: "habit-form", onSubmit: (e) => {
                            e.preventDefault();
                            handleSubmit(handleFormSubmit)(e);
                        }, className: "space-y-5 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-sm font-medium text-foreground", children: t.name }), _jsx("input", { id: "name", ...register('name'), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", placeholder: t.namePlaceholder, autoFocus: true }), errors.name && (_jsx("p", { className: "text-sm text-red-500", children: errors.name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-sm font-medium text-foreground", children: t.description }), _jsx("textarea", { id: "description", ...register('description'), className: "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none", placeholder: t.descriptionPlaceholder })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.frequency }), _jsx("div", { className: "flex gap-2", children: frequencies.map((f) => (_jsx("button", { type: "button", onClick: () => setValue('frequency', f.value), className: `flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${currentFrequency === f.value
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`, children: f.label }, f.value))) })] }), (currentFrequency === 'weekly' ||
                                currentFrequency === 'custom') && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.daysOfWeek }), _jsx("div", { className: "flex gap-2", children: weekDays.map((day) => {
                                            const selectedDays = watch('daysOfWeek') || [];
                                            const isSelected = selectedDays.includes(day.value);
                                            return (_jsx("button", { type: "button", onClick: () => {
                                                    const current = watch('daysOfWeek') || [];
                                                    if (isSelected) {
                                                        setValue('daysOfWeek', current.filter((d) => d !== day.value));
                                                    }
                                                    else {
                                                        setValue('daysOfWeek', [...current, day.value]);
                                                    }
                                                }, className: `flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`, children: day.label }, day.value));
                                        }) })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.timeOfDay }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: timesOfDay.map((time) => (_jsxs("button", { type: "button", onClick: () => setValue('timeOfDay', time.value), className: `flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-medium transition-colors duration-200 ${currentTimeOfDay === time.value
                                                ? 'bg-primary/10 text-primary border border-primary'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'}`, children: [_jsx(time.icon, { className: "h-4 w-4" }), time.label] }, time.value))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-foreground", children: t.color }), _jsx("div", { className: "flex flex-wrap gap-2", children: TAG_COLORS.map((color) => (_jsx("button", { type: "button", onClick: () => setValue('color', color), className: `h-10 w-10 rounded-lg transition-all duration-200 ${currentColor === color
                                                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                                : 'hover:scale-105'}`, style: { backgroundColor: color }, "aria-label": `Select color ${color}` }, color))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reminderTime", className: "text-sm font-medium text-foreground", children: t.reminder }), _jsx("input", { type: "time", id: "reminderTime", ...register('reminderTime'), className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" })] })] }) }), _jsx("div", { className: "p-6 pt-4 border-t bg-background", children: _jsxs(DialogFooter, { children: [_jsx("button", { type: "button", onClick: () => onOpenChange(false), className: "px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: t.cancel }), _jsx("button", { type: "submit", form: "habit-form", disabled: isPending, className: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2", children: isPending ? t.creating : t.create })] }) })] }) }));
}
