'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '../ui/sheet.js';
import { Label } from '../ui/label.js';
import { Sparkles, Flame, TrendingUp, Calendar, BarChart3, Trash2, Pause, Play, Edit3, CheckCircle2, } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    description: 'Description',
    statusPaused: 'Paused',
    statusActive: 'Active',
    frequencyDaily: 'Daily',
    frequencyWeekly: 'Weekly',
    frequencySpecific: 'Specific Days',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    totalCompletions: 'Total Completions',
    completionRate: 'Completion Rate',
    days: 'days',
    times: 'times',
    successRate: 'success rate',
    last30Days: 'Last 30 Days',
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    pause: 'Pause',
    resume: 'Resume',
    confirmDelete: 'Are you sure you want to delete this habit?',
    notFound: 'Habit not found',
};
export function HabitDetailPanel({ habit, stats, open, onOpenChange, isLoading = false, onUpdate, onDelete, onTogglePause, isUpdating = false, isDeleting = false, isPausing = false, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const handleStartEdit = () => {
        if (habit) {
            setEditedName(habit.name);
            setEditedDescription(habit.description || '');
            setIsEditing(true);
        }
    };
    const handleSave = async () => {
        if (!habit)
            return;
        try {
            await onUpdate(habit.id, {
                name: editedName,
                description: editedDescription || undefined,
            });
            setIsEditing(false);
        }
        catch {
            // Error handling by parent
        }
    };
    const handleDelete = async () => {
        if (!habit)
            return;
        if (!confirm(t.confirmDelete))
            return;
        try {
            await onDelete(habit.id);
            onOpenChange(false);
        }
        catch {
            // Error handling by parent
        }
    };
    const accentColor = habit?.color || '#10B981';
    // Calculate calendar data for the last 30 days
    const calendarData = stats?.calendarData || [];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        const found = calendarData.find((d) => d.date === dateStr);
        return {
            date: dateStr,
            completed: found?.completed || false,
            dayOfWeek: date.getDay(),
        };
    });
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, children: _jsx(SheetContent, { className: "w-full sm:max-w-lg overflow-y-auto", children: isLoading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) })) : habit ? (_jsxs("div", { className: "space-y-6", children: [_jsx(SheetHeader, { className: "space-y-4", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(motion.div, { initial: { scale: 0.9 }, animate: { scale: 1 }, className: "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg", style: {
                                        backgroundColor: accentColor,
                                        boxShadow: `0 10px 15px -3px ${accentColor}40`,
                                    }, children: _jsx(Sparkles, { className: "h-7 w-7" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [isEditing ? (_jsx("input", { value: editedName, onChange: (e) => setEditedName(e.target.value), className: "text-xl font-semibold w-full bg-transparent border-b border-primary focus:outline-none", autoFocus: true })) : (_jsx(SheetTitle, { className: "text-xl font-semibold truncate", children: habit.name })), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [habit.isPaused ? (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground", children: [_jsx(Pause, { className: "h-3 w-3" }), t.statusPaused] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", children: [_jsx(CheckCircle2, { className: "h-3 w-3" }), t.statusActive] })), _jsxs("span", { className: "text-sm text-muted-foreground", children: [habit.frequency === 'DAILY' && t.frequencyDaily, habit.frequency === 'WEEKLY' && t.frequencyWeekly, habit.frequency === 'SPECIFIC_DAYS' && t.frequencySpecific] })] })] })] }) }), (habit.description || isEditing) && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: t.description }), isEditing ? (_jsx("textarea", { value: editedDescription, onChange: (e) => setEditedDescription(e.target.value), className: "w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary" })) : (_jsx("p", { className: "text-sm border p-3 rounded-lg bg-muted/20", children: habit.description }))] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "p-4 rounded-xl border bg-card", children: [_jsxs("div", { className: "flex items-center gap-2 text-orange-500 mb-2", children: [_jsx(Flame, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs font-medium", children: t.currentStreak })] }), _jsx("p", { className: "text-2xl font-bold", children: habit.currentStreak || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.days })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "p-4 rounded-xl border bg-card", children: [_jsxs("div", { className: "flex items-center gap-2 text-purple-500 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs font-medium", children: t.longestStreak })] }), _jsx("p", { className: "text-2xl font-bold", children: habit.longestStreak || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.days })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "p-4 rounded-xl border bg-card", children: [_jsxs("div", { className: "flex items-center gap-2 text-cyan-500 mb-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs font-medium", children: t.totalCompletions })] }), _jsx("p", { className: "text-2xl font-bold", children: stats?.totalCompletions || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.times })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 }, className: "p-4 rounded-xl border bg-card", children: [_jsxs("div", { className: "flex items-center gap-2 text-emerald-500 mb-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs font-medium", children: t.completionRate })] }), _jsxs("p", { className: "text-2xl font-bold", children: [stats?.completionRate || 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.successRate })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), t.last30Days] }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day) => (_jsx("div", { className: "text-center text-xs text-muted-foreground pb-1", children: day }, day))), Array.from({ length: last30Days[0]?.dayOfWeek || 0 }).map((_, i) => (_jsx("div", { className: "aspect-square" }, `empty-${i}`))), last30Days.map((day, i) => (_jsx(motion.div, { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: i * 0.01 }, className: cn('aspect-square rounded-sm transition-colors', day.completed
                                            ? 'bg-emerald-500'
                                            : 'bg-muted hover:bg-muted/80'), title: day.date }, day.date)))] })] }), _jsx("div", { className: "flex flex-col gap-2 pt-4 border-t", children: isEditing ? (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setIsEditing(false), className: "flex-1 py-2 px-4 rounded-lg border text-muted-foreground hover:bg-muted transition-colors", children: t.cancel }), _jsx("button", { onClick: handleSave, disabled: isUpdating, className: "flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50", children: isUpdating ? '...' : t.save })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleStartEdit, className: "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border hover:bg-muted transition-colors", children: [_jsx(Edit3, { className: "h-4 w-4" }), t.edit] }), _jsx("button", { onClick: () => onTogglePause(habit.id), disabled: isPausing, className: "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border hover:bg-muted transition-colors", children: habit.isPaused ? (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-4 w-4" }), t.resume] })) : (_jsxs(_Fragment, { children: [_jsx(Pause, { className: "h-4 w-4" }), t.pause] })) }), _jsxs("button", { onClick: handleDelete, disabled: isDeleting, className: "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors", children: [_jsx(Trash2, { className: "h-4 w-4" }), t.delete] })] })) })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground", children: [_jsx(Sparkles, { className: "h-12 w-12 mb-4 opacity-50" }), _jsx("p", { children: t.notFound })] })) }) }));
}
