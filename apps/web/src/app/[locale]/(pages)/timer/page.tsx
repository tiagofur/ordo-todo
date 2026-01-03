"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { TomatoIcon, Tabs, TabsContent, TabsList, TabsTrigger, type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { SessionHistory } from "@/components/timer/session-history";
import { Clock, Timer, Sparkles, Zap, BarChart3, Target } from "lucide-react";
import { useTimer } from "@/components/providers/timer-provider";

const TIMER_ONBOARDING_KEY = "timer-onboarding-seen";


const timerOnboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    color: "#ef4444",
    title: "Timer de Productividad",
    description: "Tu herramienta para mantener el enfoque. Elige entre Pomodoro o modo continuo según tu estilo de trabajo.",
  },
  {
    id: "pomodoro",
    icon: Timer,
    color: "#ef4444",
    title: "Técnica Pomodoro",
    description: "Trabaja 25 minutos, descansa 5. Después de 4 pomodoros, toma un descanso largo de 15 minutos. ¡Comprobado científicamente!",
  },
  {
    id: "continuous",
    icon: Clock,
    color: "#3b82f6",
    title: "Modo Continuo",
    description: "¿Prefieres fluir sin interrupciones? El modo continuo rastrea tu tiempo sin pausas forzadas.",
  },
  {
    id: "tasks",
    icon: Target,
    color: "#10b981",
    title: "Vincula Tareas",
    description: "Asocia cada sesión a una tarea específica para saber exactamente cuánto tiempo dedicas a cada proyecto.",
  },
  {
    id: "stats",
    icon: BarChart3,
    color: "#8b5cf6",
    title: "Estadísticas",
    description: "Revisa tu historial de sesiones y aprende de tus patrones de productividad.",
  },
];

export default function TimerPage() {
  const { mode, config } = useTimer();

  const MODE_COLORS = {
    WORK: "#ef4444", // Red
    SHORT_BREAK: "#4ade80", // Light Green (Leaves)
    LONG_BREAK: "#15803d", // Dark Green (Branches)
    CONTINUOUS: "#3b82f6", // Blue
  };

  const accentColor = MODE_COLORS[mode] || "#ef4444";
  const isPomodoro = config.defaultMode === "POMODORO";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                {isPomodoro ? (
                  <TomatoIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>
              {isPomodoro ? "Pomodoro" : "Timer"}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Mantén el foco y rastrea tu tiempo de trabajo.
            </p>
          </div>
        </div>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="timer">Temporizador</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="mt-6">
            <div className="flex justify-center py-8">
              <PomodoroTimer />
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <SessionHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Onboarding */}
        <FeatureOnboarding
          steps={timerOnboardingSteps}
          storageKey={TIMER_ONBOARDING_KEY}
          skipText="Saltar"
          nextText="Siguiente"
          getStartedText="¡A Enfocarse!"
        />
    </AppLayout>
  );
}
