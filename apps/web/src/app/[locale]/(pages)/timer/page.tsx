"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { TomatoIcon, Tabs, TabsContent, TabsList, TabsTrigger, type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { SessionHistory } from "@/components/timer/session-history";
import { Clock, Timer, Sparkles, BarChart3, Target } from "lucide-react";
import { useTimer } from "@/components/providers/timer-provider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TIMER_ONBOARDING_KEY = "timer-onboarding-seen";

export default function TimerPage() {
  const t = useTranslations("Timer");
  const { mode, config } = useTimer();

  const isPomodoro = config?.defaultMode === "POMODORO";

  const modeStyles = useMemo(() => {
    switch (mode) {
      case "SHORT_BREAK":
        return {
          badge: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25",
          color: "#10b981",
        };
      case "LONG_BREAK":
        return {
          badge: "bg-teal-600 text-white shadow-sm shadow-teal-600/25",
          color: "#0d9488",
        };
      case "CONTINUOUS":
        return {
          badge: "bg-blue-500 text-white shadow-sm shadow-blue-500/25",
          color: "#3b82f6",
        };
      case "WORK":
      default:
        return {
          badge: "bg-rose-500 text-white shadow-sm shadow-rose-500/25",
          color: "#f43f5e",
        };
    }
  }, [mode]);

  const timerOnboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: "welcome",
      icon: Sparkles,
      color: "#f43f5e",
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDesc"),
    },
    {
      id: "pomodoro",
      icon: Timer,
      color: "#f43f5e",
      title: t("onboarding.pomodoroTitle"),
      description: t("onboarding.pomodoroDesc"),
    },
    {
      id: "continuous",
      icon: Clock,
      color: "#3b82f6",
      title: t("onboarding.continuousTitle"),
      description: t("onboarding.continuousDesc"),
    },
    {
      id: "tasks",
      icon: Target,
      color: "#10b981",
      title: t("onboarding.tasksTitle"),
      description: t("onboarding.tasksDesc"),
    },
    {
      id: "stats",
      icon: BarChart3,
      color: "#8b5cf6",
      title: t("onboarding.statsTitle"),
      description: t("onboarding.statsDesc"),
    },
  ], [t]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -8, scale: 0.92 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-colors duration-300",
                  modeStyles.badge
                )}
              >
                {isPomodoro ? (
                  <TomatoIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </motion.div>
              {isPomodoro ? t("pomodoro") : t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full max-w-[360px] grid-cols-2 rounded-xl bg-muted/60 p-1 border border-border/80">
            <TabsTrigger
              value="timer"
              className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs"
            >
              {t("tabs.timer")}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs"
            >
              {t("tabs.history")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="mt-6 focus-visible:outline-none">
            <div className="flex justify-center py-4 sm:py-8">
              <PomodoroTimer />
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6 focus-visible:outline-none">
            <SessionHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Onboarding */}
      <FeatureOnboarding
        steps={timerOnboardingSteps}
        storageKey={TIMER_ONBOARDING_KEY}
        skipText={t("onboarding.skip")}
        nextText={t("onboarding.next")}
        getStartedText={t("onboarding.getStarted")}
      />
    </AppLayout>
  );
}

