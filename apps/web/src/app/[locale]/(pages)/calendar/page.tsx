"use client";

import { useState, useEffect } from "react";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTranslations } from "next-intl";
import { Calendar, Sparkles, GripVertical, Clock, LayoutGrid, Rocket } from "lucide-react";
import { FeatureOnboarding, type OnboardingStep } from "@ordo-todo/ui";

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
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(CALENDAR_ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(CALENDAR_ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
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
      {showOnboarding && (
        <FeatureOnboarding
          steps={calendarOnboardingSteps}
          storageKey={CALENDAR_ONBOARDING_KEY}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
          skipText="Saltar"
          nextText="Siguiente"
          getStartedText="¡Empezar a Planificar!"
        />
      )}
    </AppLayout>
  );
}
