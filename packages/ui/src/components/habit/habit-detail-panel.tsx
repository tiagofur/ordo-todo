'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet.js';
import { Label } from '../ui/label.js';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Calendar,
  BarChart3,
  Trash2,
  Pause,
  Play,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';

export interface HabitData {
  id: string;
  name: string;
  description?: string | null;
  frequency: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
  color?: string;
  icon?: string;
  isPaused: boolean;
  currentStreak?: number;
  longestStreak?: number;
}

export interface HabitStats {
  totalCompletions: number;
  completionRate: number;
  calendarData: Array<{
    date: string;
    completed: boolean;
  }>;
}

export interface HabitDetailPanelProps {
  habit: HabitData | null | undefined;
  stats?: HabitStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onUpdate: (id: string, data: { name: string; description?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePause: (id: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isPausing?: boolean;
  labels?: {
    description?: string;
    statusPaused?: string;
    statusActive?: string;
    frequencyDaily?: string;
    frequencyWeekly?: string;
    frequencySpecific?: string;
    currentStreak?: string;
    longestStreak?: string;
    totalCompletions?: string;
    completionRate?: string;
    days?: string;
    times?: string;
    successRate?: string;
    last30Days?: string;
    edit?: string;
    cancel?: string;
    save?: string;
    delete?: string;
    pause?: string;
    resume?: string;
    confirmDelete?: string;
    notFound?: string;
  };
}

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

export function HabitDetailPanel({
  habit,
  stats,
  open,
  onOpenChange,
  isLoading = false,
  onUpdate,
  onDelete,
  onTogglePause,
  isUpdating = false,
  isDeleting = false,
  isPausing = false,
  labels = {},
}: HabitDetailPanelProps) {
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
    if (!habit) return;
    try {
      await onUpdate(habit.id, {
        name: editedName,
        description: editedDescription || undefined,
      });
      setIsEditing(false);
    } catch {
      // Error handling by parent
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    if (!confirm(t.confirmDelete)) return;
    try {
      await onDelete(habit.id);
      onOpenChange(false);
    } catch {
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : habit ? (
          <div className="space-y-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40`,
                  }}
                >
                  <Sparkles className="h-7 w-7" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-xl font-semibold w-full bg-transparent border-b border-primary focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <SheetTitle className="text-xl font-semibold truncate">
                      {habit.name}
                    </SheetTitle>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {habit.isPaused ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Pause className="h-3 w-3" />
                        {t.statusPaused}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.statusActive}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                       {/* Map frequency enum to label */}
                      {habit.frequency === 'DAILY' && t.frequencyDaily}
                      {habit.frequency === 'WEEKLY' && t.frequencyWeekly}
                      {habit.frequency === 'SPECIFIC_DAYS' && t.frequencySpecific}
                    </span>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Description */}
            {(habit.description || isEditing) && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t.description}
                </Label>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm border p-3 rounded-lg bg-muted/20">{habit.description}</p>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t.currentStreak}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {habit.currentStreak || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t.days}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 text-purple-500 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t.longestStreak}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {habit.longestStreak || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t.days}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 text-cyan-500 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t.totalCompletions}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {stats?.totalCompletions || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t.times}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-4 rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {t.completionRate}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {stats?.completionRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground">{t.successRate}</p>
              </motion.div>
            </div>

            {/* Calendar Heatmap */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {t.last30Days}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-muted-foreground pb-1"
                  >
                    {day}
                  </div>
                ))}
                {/* Empty cells for alignment */}
                {Array.from({ length: last30Days[0]?.dayOfWeek || 0 }).map(
                  (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  )
                )}
                {last30Days.map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={cn(
                      'aspect-square rounded-sm transition-colors',
                      day.completed
                        ? 'bg-emerald-500'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                    title={day.date}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 px-4 rounded-lg border text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? '...' : t.save}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    {t.edit}
                  </button>
                  <button
                    onClick={() => onTogglePause(habit.id)}
                    disabled={isPausing}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    {habit.isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        {t.resume}
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        {t.pause}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t.delete}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p>{t.notFound}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
