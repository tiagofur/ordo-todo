"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Sparkles,
  Plus,
  Flame,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Pause,
  MoreHorizontal,
  BarChart3,
  Bell,
  Zap,
} from "lucide-react";
import { type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/lib/api-hooks";
import { toast } from "sonner";
import { HabitCelebration, useHabitCelebration } from "@/components/habit/habit-celebration";
import { StreakBadge } from "@/components/habit/streak-badge";
import dynamic from "next/dynamic";
import { Habit, CompleteHabitResponse } from "@ordo-todo/api-client";

const CreateHabitDialog = dynamic(
  () => import("@/components/habit/create-habit-dialog").then((mod) => mod.CreateHabitDialog),
  { ssr: false }
);

const HabitDetailPanel = dynamic(
  () => import("@/components/habit/habit-detail-panel").then((mod) => mod.HabitDetailPanel),
  { ssr: false }
);


const accentColor = "#10B981"; // Emerald


export default function HabitsPage() {
  const t = useTranslations("Habits");
  const format = useFormatter();

  // State
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const celebration = useHabitCelebration();

  const habitOnboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      icon: Sparkles,
      color: '#10B981',
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
    },
    {
      id: 'streaks',
      icon: Flame,
      color: '#f59e0b',
      title: t('onboarding.streaks.title'),
      description: t('onboarding.streaks.description'),
    },
    {
      id: 'reminders',
      icon: Bell,
      color: '#8b5cf6',
      title: t('onboarding.reminders.title'),
      description: t('onboarding.reminders.description'),
    },
    {
      id: 'gamification',
      icon: Zap,
      color: '#06b6d4',
      title: t('onboarding.gamification.title'),
      description: t('onboarding.gamification.description'),
    },
  ];

  // Fetch habits from API
  const { data: todayData, isLoading, refetch } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  // Fix: Handle different possible return types from useTodayHabits
  const habits: Habit[] = Array.isArray(todayData) 
    ? todayData 
    : (todayData?.habits ?? []);
    
  const summary = !Array.isArray(todayData) && todayData?.summary 
    ? todayData.summary 
    : { total: 0, completed: 0, remaining: 0, percentage: 0 };

  const handleComplete = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabit.mutateAsync(habitId);
        toast.success(t("toast.uncompleted"));
      } else {
        const result = await completeHabit.mutateAsync({ habitId }) as unknown as CompleteHabitResponse;
        
        // Show celebration for milestone streaks
        const streak = result.habit.currentStreak;
        if (streak === 7 || streak === 30 || streak === 100 || streak % 50 === 0) {
          celebration.celebrate(result.xpAwarded, streak);
          toast.success(t("toast.completed", { xp: result.xpAwarded }));
          if (streak === 7) toast.success(t("streakMessage.week"));
          else if (streak === 30) toast.success(t("streakMessage.month"));
          else if (streak === 100) toast.success(t("streakMessage.hundred"));
        } else {
          toast.success(t("toast.completed", { xp: result.xpAwarded }));
        }
      }
    } catch (error) {
      toast.error(t("toast.error", { message: "Failed to update habit" }));
    }
  };


  // Stats cards
  const statCards = [
    {
      title: t("todayProgress"),
      value: `${summary.completed}/${summary.total}`,
      subtitle: `${summary.percentage}%`,
      icon: Target,
      color: accentColor,
    },
    {
      title: t("stats.currentStreak"),
      value: habits.length > 0 ? Math.max(...habits.map((h: Habit) => h.currentStreak || 0)).toString() : "0",
      subtitle: "días",
      icon: Flame,
      color: "#f59e0b",
    },
    {
      title: t("stats.longestStreak"),
      value: habits.length > 0 ? Math.max(...habits.map((h: Habit) => h.longestStreak || 0)).toString() : "0",
      subtitle: "días",
      icon: TrendingUp,
      color: "#8b5cf6",
    },
    {
      title: t("stats.thisWeek"),
      value: habits.reduce((acc: number, h: Habit) => acc + (h.completions?.length || 0), 0).toString(),
      subtitle: "completados",
      icon: Calendar,
      color: "#06b6d4",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateHabit(true)}
            className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("newHabit")}</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
                "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
              )}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: card.color,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{card.value}</p>
                    <span className="text-xs text-muted-foreground">{card.subtitle}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t("todayProgress")}</h3>
              <span className="text-sm font-medium" style={{ color: accentColor }}>
                {summary.percentage}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {summary.completed === summary.total && summary.total > 0
                ? t("allDone")
                : t("keepGoing")}
            </p>
          </motion.div>
        )}

        {/* Habits List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-border/50 bg-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            {format.dateTime(new Date(), {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl">
              <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">{t("noHabits")}</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                {t("noHabitsDescription")}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateHabit(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("createHabit")}
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {habits.map((habit: Habit, index: number) => {
                  const isCompleted = habit.completions && habit.completions.length > 0;
                  const isPaused = habit.isPaused;
                  
                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={cn(
                        "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                        isCompleted
                          ? "bg-muted/30 border-border/30"
                          : "bg-card border-border/50 hover:border-border hover:shadow-md",
                        isPaused && "opacity-60"
                      )}
                    >
                      {/* Completion Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(habit.id, !!isCompleted);
                        }}
                        disabled={isPaused || completeHabit.isPending || uncompleteHabit.isPending}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-500/10"
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isCompleted ? "scale-100" : "scale-0 group-hover:scale-75"
                          )}
                        />
                      </motion.button>

                      {/* Habit Icon & Info */}
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                        style={{ backgroundColor: habit.color || accentColor }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium transition-all duration-300",
                            "line-clamp-2 sm:line-clamp-1",
                            isCompleted && "line-through opacity-60"
                          )}
                        >
                          {habit.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {habit.currentStreak || 0}
                          </span>
                          <span className="hidden xs:inline">•</span>
                          <span>
                            {t(`frequency.${habit.frequency}`)}
                          </span>
                          {habit.timeOfDay && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{t(`timeOfDay.${habit.timeOfDay}`)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Streak Badge */}
                      {habit.currentStreak >= 7 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "#f59e0b15",
                            color: "#f59e0b",
                          }}
                        >
                          <Flame className="h-3 w-3" />
                          {habit.currentStreak}
                        </motion.div>
                      )}

                      {/* Paused Badge */}
                      {isPaused && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          <Pause className="h-3 w-3" />
                          {t("status.paused")}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <CreateHabitDialog
        open={showCreateHabit}
        onOpenChange={setShowCreateHabit}
      />
      <HabitDetailPanel
        habitId={selectedHabitId}
        open={!!selectedHabitId}
        onOpenChange={(open) => !open && setSelectedHabitId(null)}
      />

      {/* Onboarding */}
      <FeatureOnboarding
        steps={habitOnboardingSteps}
        storageKey="habits-onboarding-seen"
        skipText={t("onboarding.skip")}
        nextText={t("onboarding.next")}
        getStartedText={t("onboarding.getStarted")}
      />

      {/* Celebration Animation */}
      <HabitCelebration
        show={celebration.show}
        xp={celebration.xp}
        streak={celebration.streak}
        onComplete={celebration.dismiss}
      />
    </AppLayout>
  );
}
