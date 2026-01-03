"use client";

import { useState, useEffect } from "react";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTranslations } from "next-intl";
import { Calendar, Sparkles, GripVertical, Clock, LayoutGrid, Rocket } from "lucide-react";
import { type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { motion } from "framer-motion";

const CALENDAR_ONBOARDING_KEY = "calendar-onboarding-seen";

const calendarOnboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    color: "#0ea5e9",
    title: "Time Blocking",
    description: "Bloquea tiempo específico para tus tareas. Esta técnica aumenta el enfoque y reduce la procrastinación.",
  },
  {
    id: "dragdrop",
    icon: GripVertical,
    color: "#10b981",
    title: "Arrastra y Suelta",
    description: "Toma cualquier tarea de la barra lateral y arrástrala directamente al calendario para programarla.",
  },
  {
    id: "scheduling",
    icon: Clock,
    color: "#f59e0b",
    title: "Programa tu Día",
    description: "Asigna bloques de tiempo específicos. Define cuándo empiezas y cuándo terminas cada tarea.",
  },
  {
    id: "views",
    icon: LayoutGrid,
    color: "#8b5cf6",
    title: "Vista Semanal",
    description: "Visualiza toda tu semana de un vistazo. Identifica huecos de tiempo y balancea tu carga de trabajo.",
  },
  {
    id: "getstarted",
    icon: Rocket,
    color: "#0ea5e9",
    title: "¡Planifica tu Semana!",
    description: "Arrastra una tarea de la izquierda al calendario para comenzar. ¡Tu tiempo es valioso, úsalo bien!",
  },
];

export default function CalendarPage() {
  const t = useTranslations("Calendar");
  const accentColor = "#0ea5e9"; // Sky blue

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
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
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden gap-4 pb-4">
            {/* Unscheduled Tasks Sidebar */}
            <aside className="w-80 shrink-0 hidden lg:block h-full">
                 <UnscheduledTasks />
            </aside>

            {/* Main Calendar View */}
            <main className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden h-full">
                 <TaskCalendar />
            </main>
        </div>
      </div>

      {/* Onboarding */}
        <FeatureOnboarding
          steps={calendarOnboardingSteps}
          storageKey={CALENDAR_ONBOARDING_KEY}
          skipText="Saltar"
          nextText="Siguiente"
          getStartedText="¡Empezar a Planificar!"
        />
    </AppLayout>
  );
}
