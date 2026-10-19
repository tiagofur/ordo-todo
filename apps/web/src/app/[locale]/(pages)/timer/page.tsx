"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import {
  TomatoIcon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  type OnboardingStep,
} from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { SessionHistory } from "@/components/timer/session-history";
import {
  Clock,
  Timer,
  Sparkles,
  BarChart3,
  Target,
  Coffee,
  Zap,
  Maximize2,
} from "lucide-react";
import { useTimer } from "@/components/providers/timer-provider";
import { useTimerStats } from "@/lib/api-hooks";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TIMER_ONBOARDING_KEY = "timer-onboarding-seen";

export default function TimerPage() {
  const t = useTranslations("Timer");
  const router = useRouter();
  const { mode, config, completedPomodoros, pauseCount, isRunning, isPaused } =
    useTimer();

  // Date range for today's stats
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  const { data: stats } = useTimerStats({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  const isPomodoro = config?.defaultMode === "POMODORO";

  const modeStyles = useMemo(() => {
    switch (mode) {
      case "SHORT_BREAK":
        return {
          badge: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25",
          color: "#10b981",
          title: t("modes.shortBreak"),
          icon: Coffee,
        };
      case "LONG_BREAK":
        return {
          badge: "bg-teal-600 text-white shadow-sm shadow-teal-600/25",
          color: "#0d9488",
          title: t("modes.longBreak"),
          icon: Coffee,
        };
      case "CONTINUOUS":
        return {
          badge: "bg-blue-500 text-white shadow-sm shadow-blue-500/25",
          color: "#3b82f6",
          title: t("modes.stopwatch"),
          icon: Clock,
        };
      case "WORK":
      default:
        return {
          badge: "bg-rose-500 text-white shadow-sm shadow-rose-500/25",
          color: "#f43f5e",
          title: isPomodoro ? t("pomodoro") : t("title"),
          icon: TomatoIcon,
        };
    }
  }, [mode, isPomodoro, t]);

  const ModeIcon = modeStyles.icon;

  // Format minutes worked
  const totalWorkedMinutes = stats?.totalMinutesWorked || 0;
  const formattedWorkTime = useMemo(() => {
    if (totalWorkedMinutes < 60) return `${totalWorkedMinutes} min`;
    const h = Math.floor(totalWorkedMinutes / 60);
    const m = totalWorkedMinutes % 60;
    return `${h}h ${m}m`;
  }, [totalWorkedMinutes]);

  const effectivePomodoros =
    completedPomodoros || stats?.pomodorosCompleted || 0;

  const timerOnboardingSteps: OnboardingStep[] = useMemo(
    () => [
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
    ],
    [t]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <motion.div
              initial={{ rotate: -8, scale: 0.92 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-colors duration-300 shrink-0",
                modeStyles.badge
              )}
            >
              <ModeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {modeStyles.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>{t("subtitle")}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/focus")}
              className="gap-2 rounded-xl border-border/60 hover:bg-muted/50 cursor-pointer shadow-xs"
              title="Modo Enfoque completo"
            >
              <Maximize2 className="h-4 w-4 text-purple-500" />
              <span>Modo Enfoque</span>
            </Button>
          </div>
        </div>

        {/* 4 Apple-Grade KPI Cards with Micro-Halos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Tiempo Enfocado Hoy */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#06b6d470";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(6, 182, 212, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Tiempo Enfocado
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formattedWorkTime}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {stats?.totalWorkSessions || 0} sesiones registradas hoy
            </p>
          </div>

          {/* Card 2: Pomodoros Completados */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f43f5e70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(244, 63, 94, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pomodoros
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110">
                <TomatoIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {effectivePomodoros}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Ciclo: {effectivePomodoros % (config?.pomodorosUntilLongBreak || 4)} /{" "}
              {config?.pomodorosUntilLongBreak || 4} para descanso largo
            </p>
          </div>

          {/* Card 3: Pausas y Descansos */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b98170";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Descansos
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                <Coffee className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {stats?.totalBreakMinutes || 0} min
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {stats?.totalBreakSessions || 0} descansos • {pauseCount} pausas activas
            </p>
          </div>

          {/* Card 4: Estado y Ritmo */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a855f770";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(168, 85, 247, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Ritmo de Enfoque
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                <Zap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isRunning ? (isPaused ? "Pausado" : "En Curso") : "En Espera"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {stats?.avgSessionDuration
                ? `Promedio: ${Math.round(stats.avgSessionDuration)} min/sesión`
                : "Bloque listo para iniciar"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timer" className="w-full space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-card border border-border/60 p-1 rounded-2xl shadow-xs grid w-full max-w-[360px] grid-cols-2">
              <TabsTrigger
                value="timer"
                className="flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-xs cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>{t("tabs.timer")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-xs cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t("tabs.history")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timer" className="mt-4 focus-visible:outline-none space-y-4">
            {/* Mode Preset Indicator Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border",
                  mode === "WORK"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    mode === "WORK" ? "bg-rose-500 animate-pulse" : "bg-muted-foreground/40"
                  )}
                />
                <span>Trabajo ({config?.workDuration || 25}m)</span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border",
                  mode === "SHORT_BREAK"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    mode === "SHORT_BREAK"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
                <span>Descanso Corto ({config?.shortBreakDuration || 5}m)</span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border",
                  mode === "LONG_BREAK"
                    ? "bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-600/30 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    mode === "LONG_BREAK"
                      ? "bg-teal-600 animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
                <span>Descanso Largo ({config?.longBreakDuration || 15}m)</span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border",
                  mode === "CONTINUOUS"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-transparent"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    mode === "CONTINUOUS"
                      ? "bg-blue-500 animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
                <span>Continuo (Cronómetro)</span>
              </div>
            </div>

            <div className="w-full">
              <PomodoroTimer />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 focus-visible:outline-none">
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
