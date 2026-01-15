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
    color: "#3b82f6", // Blue-500
    title: "Time Blocking",
    description: "Bloquea tiempo específico para tus tareas. Esta técnica aumenta el enfoque y reduce la procrastinación.",
  },
  {
    id: "dragdrop",
    icon: GripVertical,
    color: "#10b981", // Success Green
    title: "Arrastra y Suelta",
    description: "Toma cualquier tarea de la barra lateral y arrástrala directamente al calendario para programarla.",
  },
  {
    id: "scheduling",
    icon: Clock,
    color: "#f59e0b", // Warning Amber
    title: "Programa tu Día",
    description: "Asigna bloques de tiempo específicos. Define cuándo empiezas y cuándo terminas cada tarea.",
  },
  {
    id: "views",
    icon: LayoutGrid,
    color: "#8b5cf6", // Accent Violet
    title: "Vista Semanal",
    description: "Visualiza toda tu semana de un vistazo. Identifica huecos de tiempo y balancea tu carga de trabajo.",
  },
  {
    id: "getstarted",
    icon: Rocket,
    color: "#3b82f6", // Blue-500
    title: "¡Planifica tu Semana!",
    description: "Arrastra una tarea de la izquierda al calendario para comenzar. ¡Tu tiempo es valioso, úsalo bien!",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    },
  },
};

export default function CalendarPage() {
  const t = useTranslations("Calendar");

  return (
    <AppLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 h-full flex flex-col"
      >
        {/* Header - Premium Iconic Design */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-calendar/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-calendar/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-110" />

          <div className="flex items-center gap-6 relative z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 3, scale: 1 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-calendar text-white shadow-xl shadow-calendar/25 shrink-0 transition-transform duration-500"
            >
              <Calendar className="h-10 w-10" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-black tracking-tight text-foreground truncate">
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-lg mt-1 font-medium line-clamp-1">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="px-4 py-2 bg-calendar/10 rounded-2xl border border-calendar/20 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-calendar" />
              <span className="text-sm font-bold text-calendar">Smart Scheduling</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex flex-1 overflow-hidden gap-8 pb-4"
        >
            {/* Unscheduled Tasks Sidebar */}
            <aside className="w-80 shrink-0 hidden xl:block h-full group">
                 <div className="h-full rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-black/5">
                    <UnscheduledTasks />
                 </div>
            </aside>

            {/* Main Calendar View */}
            <main className="flex-1 min-h-0 border border-border/50 rounded-[2.5rem] bg-card shadow-sm shadow-black/5 overflow-hidden h-full transition-all hover:shadow-xl hover:shadow-black/10">
                 <TaskCalendar />
            </main>
        </motion.div>
      </motion.div>

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
