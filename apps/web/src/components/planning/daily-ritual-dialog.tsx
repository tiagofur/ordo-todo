'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from '@/components/ui';
import {
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  RotateCcw,
  Coffee,
  PartyPopper,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useUpdateTask, useCompleteTask, useOptimalSchedule, useDailyMetrics, useTimerStats } from '@/lib/api-hooks';
import type { Task, TaskPriority } from '@ordo-todo/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type RitualMode = 'morning' | 'evening';

interface DailyRitualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: RitualMode;
  workspaceId?: string;
}

export function DailyRitualDialog({
  open,
  onOpenChange,
  defaultMode,
  workspaceId,
}: DailyRitualDialogProps) {
  // Determine initial mode based on local time if not explicitly provided
  const initialMode = useMemo<RitualMode>(() => {
    if (defaultMode) return defaultMode;
    const currentHour = new Date().getHours();
    return currentHour >= 17 ? 'evening' : 'morning';
  }, [defaultMode]);

  const [mode, setMode] = useState<RitualMode>(initialMode);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected focus tasks for Morning ritual (max 3)
  const [selectedFocusTaskIds, setSelectedFocusTaskIds] = useState<string[]>([]);

  // Time blocking assignments: taskId -> { startTime: string, endTime: string }
  const [timeBlockAssignments, setTimeBlockAssignments] = useState<
    Record<string, { startTime: string; endTime: string }>
  >({});

  // Mutations & Queries
  const { data: allTasks = [], isLoading: isLoadingTasks } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const { data: optimalSchedule } = useOptimalSchedule({ topN: 4 });

  // Today dates
  const today = useMemo(() => new Date(), []);
  const todayDateStr = today.toDateString();
  const startOfToday = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );
  const endOfToday = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
    [today]
  );
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }, [today]);

  // Today metrics
  const { data: dailyMetricsArray } = useDailyMetrics({
    startDate: startOfToday.toISOString(),
    endDate: endOfToday.toISOString(),
  });
  const dailyMetrics = dailyMetricsArray?.[0];

  const { data: timerStats } = useTimerStats({
    startDate: startOfToday.toISOString(),
    endDate: endOfToday.toISOString(),
  });

  // Filter tasks based on workspace and time status
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t: any) => {
      if (workspaceId) {
        const tWsId = t.project?.workspace?.id || t.project?.workspaceId;
        if (tWsId && tWsId !== workspaceId) return false;
      }
      return true;
    });
  }, [allTasks, workspaceId]);

  // Overdue tasks: dueDate < startOfToday and not completed
  const overdueTasks = useMemo(() => {
    return filteredTasks.filter((t: Task) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d < startOfToday;
    });
  }, [filteredTasks, startOfToday]);

  // Active tasks for today
  const todaysTasks = useMemo(() => {
    return filteredTasks.filter((t: Task) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d.toDateString() === todayDateStr) return true;
      }
      if (t.scheduledDate) {
        const s = new Date(t.scheduledDate);
        if (s.toDateString() === todayDateStr) return true;
      }
      return false;
    });
  }, [filteredTasks, todayDateStr]);

  // Completed tasks today
  const completedTodayTasks = useMemo(() => {
    return filteredTasks.filter((t: Task) => {
      if (t.status !== 'COMPLETED') return false;
      if (t.completedAt) {
        const d = new Date(t.completedAt);
        if (d.toDateString() === todayDateStr) return true;
      }
      if (t.updatedAt) {
        const u = new Date(t.updatedAt);
        if (u.toDateString() === todayDateStr) return true;
      }
      return false;
    });
  }, [filteredTasks, todayDateStr]);

  // Incomplete tasks scheduled for today (for Evening Shutdown)
  const incompleteTodayTasks = useMemo(() => {
    return todaysTasks;
  }, [todaysTasks]);

  // Handle mode switch
  const handleModeChange = (newMode: RitualMode) => {
    setMode(newMode);
    setStep(1);
    setSelectedFocusTaskIds([]);
    setTimeBlockAssignments({});
  };

  // Helper: Reschedule task
  const handleRescheduleTask = async (taskId: string, targetDate: Date) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        data: {
          dueDate: targetDate.toISOString(),
        },
      });
      toast.success('Task rescheduled to today');
    } catch {
      toast.error('Failed to reschedule task');
    }
  };

  // Helper: Reschedule all overdue to today
  const handleRescheduleAllOverdue = async () => {
    if (overdueTasks.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        overdueTasks.map((t) =>
          updateTaskMutation.mutateAsync({
            taskId: t.id,
            data: {
              dueDate: today.toISOString(),
            },
          })
        )
      );
      toast.success(`Rescheduled ${overdueTasks.length} tasks to today`);
    } catch {
      toast.error('Error rescheduling some tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: Move all unfinished today tasks to tomorrow
  const handlePushAllUnfinishedToTomorrow = async () => {
    if (incompleteTodayTasks.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        incompleteTodayTasks.map((t) =>
          updateTaskMutation.mutateAsync({
            taskId: t.id,
            data: {
              dueDate: tomorrow.toISOString(),
              scheduledDate: null,
              scheduledTime: null,
              scheduledEndTime: null,
              isTimeBlocked: false,
            },
          })
        )
      );
      toast.success(`Moved ${incompleteTodayTasks.length} tasks to tomorrow`);
    } catch {
      toast.error('Error moving tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle selection for "The Big 3"
  const toggleFocusTask = (taskId: string) => {
    setSelectedFocusTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      if (prev.length >= 3) {
        toast.info('Maximum of 3 focus tasks recommended for clarity');
        return prev;
      }
      return [...prev, taskId];
    });
  };

  // Auto-assign time blocks using AI suggestions or default productive blocks
  const handleAutoAssignTimeBlocks = () => {
    const defaultSlots = [
      { start: '09:00', end: '10:30' },
      { start: '11:00', end: '12:30' },
      { start: '14:30', end: '16:00' },
    ];

    const aiHours = optimalSchedule?.peakHours || [];
    const newAssignments: Record<string, { startTime: string; endTime: string }> = {};

    selectedFocusTaskIds.forEach((taskId, index) => {
      if (aiHours[index]) {
        const hour = aiHours[index].hour;
        const startStr = `${hour.toString().padStart(2, '0')}:00`;
        const endHour = (hour + 1) % 24;
        const endStr = `${endHour.toString().padStart(2, '0')}:30`;
        newAssignments[taskId] = { startTime: startStr, endTime: endStr };
      } else {
        const slot = defaultSlots[index % defaultSlots.length];
        newAssignments[taskId] = { startTime: slot.start, endTime: slot.end };
      }
    });

    setTimeBlockAssignments(newAssignments);
    toast.success('Assigned optimal focus blocks to your Big 3!');
  };

  // Commit Morning Plan
  const handleCommitMorningPlan = async () => {
    setIsSubmitting(true);
    try {
      // 1. Boost priority of selected focus tasks
      const updates = selectedFocusTaskIds.map((taskId) => {
        const timeBlock = timeBlockAssignments[taskId];
        return updateTaskMutation.mutateAsync({
          taskId,
          data: {
            dueDate: today.toISOString(),
            priority: 'HIGH' as TaskPriority,
            ...(timeBlock
              ? {
                  scheduledDate: today.toISOString(),
                  scheduledTime: timeBlock.startTime,
                  scheduledEndTime: timeBlock.endTime,
                  isTimeBlocked: true,
                }
              : {}),
          },
        });
      });

      await Promise.all(updates);
      toast.success('Daily plan locked in! Let’s crush it today 🚀');
      onOpenChange(false);
    } catch {
      toast.error('Failed to commit daily plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Shutdown Ritual
  const handleCompleteShutdown = () => {
    toast.success('Shutdown complete! Disconnect, rest, and recharge 🌙');
    onOpenChange(false);
  };

  // Focus time calculation for Evening
  const totalWorkedMinutes = useMemo(() => {
    const fromMetrics = dailyMetrics?.minutesWorked || 0;
    const fromTimer = timerStats?.totalMinutesWorked || 0;
    return Math.round(Math.max(fromMetrics, fromTimer));
  }, [dailyMetrics, timerStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-border bg-card">
        {/* Header with Mode Toggle */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                mode === 'morning'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
              )}
            >
              {mode === 'morning' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {mode === 'morning' ? 'Morning Planning Ritual' : 'Daily Shutdown Ritual'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {mode === 'morning'
                  ? 'Align priorities, clear the backlog & time-block your focus'
                  : 'Celebrate your achievements, clear pending tasks & disconnect'}
              </DialogDescription>
            </div>
          </div>

          {/* Segmented Mode Control */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
            <button
              onClick={() => handleModeChange('morning')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                mode === 'morning'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Plan Day</span>
            </button>
            <button
              onClick={() => handleModeChange('evening')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                mode === 'evening'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Shutdown</span>
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              1
            </span>
            <span className={step === 1 ? 'font-medium text-foreground' : ''}>
              {mode === 'morning' ? 'Triage Overdue' : 'Review Wins'}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              2
            </span>
            <span className={step === 2 ? 'font-medium text-foreground' : ''}>
              {mode === 'morning' ? 'The Big 3' : 'Clear the Deck'}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              3
            </span>
            <span className={step === 3 ? 'font-medium text-foreground' : ''}>
              {mode === 'morning' ? 'Time Blocking' : 'Disconnect'}
            </span>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* MORNING RITUAL - STEP 1: TRIAGE OVERDUE TASKS */}
            {/* ============================================================== */}
            {mode === 'morning' && step === 1 && (
              <motion.div
                key="morning-step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Overdue Triage
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {overdueTasks.length > 0
                        ? `You have ${overdueTasks.length} overdue task(s). Move them to today or adjust dates.`
                        : "You're all caught up! No overdue tasks need attention."}
                    </p>
                  </div>

                  {overdueTasks.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleRescheduleAllOverdue}
                      className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Move All to Today
                    </Button>
                  )}
                </div>

                {overdueTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Clean backlog!</p>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      No overdue tasks carried over. You are ready to pick today's high-impact goals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/40 text-amber-600">
                              Overdue
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[11px] text-muted-foreground">
                                Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRescheduleTask(task.id, today)}
                            className="h-7 text-xs px-2.5"
                          >
                            Today
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRescheduleTask(task.id, tomorrow)}
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                          >
                            Tomorrow
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* MORNING RITUAL - STEP 2: THE BIG 3 (PRIORITIES) */}
            {/* ============================================================== */}
            {mode === 'morning' && step === 2 && (
              <motion.div
                key="morning-step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Select The Big 3
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose up to 3 core tasks that will make today an undeniable success ({selectedFocusTaskIds.length}/3 selected).
                  </p>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {todaysTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                      <Coffee className="h-6 w-6 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">No tasks scheduled for today yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Go back to Step 1 to pull overdue tasks, or proceed to time-blocking to plan your day.
                      </p>
                    </div>
                  ) : (
                    todaysTasks.map((task) => {
                      const isSelected = selectedFocusTaskIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleFocusTask(task.id)}
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all',
                            isSelected
                              ? 'border-purple-500 bg-purple-500/10 shadow-xs'
                              : 'border-border bg-card hover:bg-muted/40'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                                isSelected
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-muted-foreground/40'
                              )}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                  {task.priority}
                                </Badge>
                                {task.estimatedMinutes && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedMinutes}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] py-0 px-2 shrink-0">
                              Priority Focus
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* MORNING RITUAL - STEP 3: TIME BLOCKING */}
            {/* ============================================================== */}
            {mode === 'morning' && step === 3 && (
              <motion.div
                key="morning-step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Time-Block Your Day
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Assign dedicated hours to your focus priorities to guard against distractions.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAutoAssignTimeBlocks}
                    className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                    Auto-Block with AI
                  </Button>
                </div>

                {selectedFocusTaskIds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center">
                    <p className="text-sm font-medium">No focus tasks selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Return to Step 2 to select your Big 3, or save your daily schedule directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {selectedFocusTaskIds.map((taskId, index) => {
                      const task = todaysTasks.find((t) => t.id === taskId);
                      if (!task) return null;
                      const currentBlock = timeBlockAssignments[taskId] || {
                        startTime: ['09:00', '11:30', '15:00'][index % 3],
                        endTime: ['10:30', '13:00', '16:30'][index % 3],
                      };

                      return (
                        <div key={taskId} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Focus #{index + 1}
                            </span>
                            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                              {task.estimatedMinutes ? `${task.estimatedMinutes} min target` : 'Deep Work'}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>

                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Start:</span>
                              <input
                                type="time"
                                value={currentBlock.startTime}
                                onChange={(e) =>
                                  setTimeBlockAssignments((prev) => ({
                                    ...prev,
                                    [taskId]: {
                                      startTime: e.target.value,
                                      endTime: prev[taskId]?.endTime || '10:30',
                                    },
                                  }))
                                }
                                className="rounded border border-border bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <span className="text-muted-foreground text-xs">to</span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">End:</span>
                              <input
                                type="time"
                                value={currentBlock.endTime}
                                onChange={(e) =>
                                  setTimeBlockAssignments((prev) => ({
                                    ...prev,
                                    [taskId]: {
                                      startTime: prev[taskId]?.startTime || '09:00',
                                      endTime: e.target.value,
                                    },
                                  }))
                                }
                                className="rounded border border-border bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* EVENING RITUAL - STEP 1: REVIEW WINS */}
            {/* ============================================================== */}
            {mode === 'evening' && step === 1 && (
              <motion.div
                key="evening-step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-emerald-500" />
                    Today's Accomplishments
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Acknowledge your progress before logging off for the evening.
                  </p>
                </div>

                {/* Metrics Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-500">{completedTodayTasks.length}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Tasks Completed Today</div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">{totalWorkedMinutes} min</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Focus Time Logged</div>
                  </div>
                </div>

                {/* Completed Tasks List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {completedTodayTasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      No tasks marked completed today yet.
                    </div>
                  ) : (
                    completedTodayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="font-medium line-through text-muted-foreground truncate">{task.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* EVENING RITUAL - STEP 2: CLEAR THE DECK */}
            {/* ============================================================== */}
            {mode === 'evening' && step === 2 && (
              <motion.div
                key="evening-step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-indigo-500" />
                      Clear the Deck
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {incompleteTodayTasks.length > 0
                        ? `${incompleteTodayTasks.length} task(s) left unfinished. Reschedule to clear your mind.`
                        : 'No pending tasks left for today! Clean slate.'}
                    </p>
                  </div>

                  {incompleteTodayTasks.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handlePushAllUnfinishedToTomorrow}
                      className="text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                    >
                      Move All to Tomorrow
                    </Button>
                  )}
                </div>

                {incompleteTodayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">All tasks finished or rescheduled!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nothing left hanging for today. Proceed to complete your shutdown.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {incompleteTodayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <span className="text-[11px] text-muted-foreground">{task.priority} priority</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRescheduleTask(task.id, tomorrow)}
                            className="h-7 text-xs px-2.5"
                          >
                            Tomorrow
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                await completeTaskMutation.mutateAsync(task.id);
                                toast.success('Task marked completed');
                              } catch {
                                toast.error('Failed to complete task');
                              }
                            }}
                            className="h-7 text-xs px-2 text-emerald-600 hover:bg-emerald-500/10"
                          >
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* EVENING RITUAL - STEP 3: DISCONNECT & SHUTDOWN */}
            {/* ============================================================== */}
            {mode === 'evening' && step === 3 && (
              <motion.div
                key="evening-step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                  <Moon className="h-8 w-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Workday Finished</h3>
                  <p className="text-xs text-muted-foreground">
                    Your tasks are resolved, your calendar is clear, and tomorrow is organized. Disconnect your mind and enjoy your evening.
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCompleteShutdown}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 shadow-sm"
                >
                  Shutdown Complete 🌙
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-xs"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="text-xs"
              >
                Continue
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : mode === 'morning' ? (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleCommitMorningPlan}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Lock in My Plan
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
