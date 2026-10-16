"use client";

import { useMemo } from "react";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTranslations } from "next-intl";
import { Calendar, Sparkles, GripVertical, Clock, LayoutGrid, Rocket } from "lucide-react";
import { type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { motion } from "framer-motion";

const CALENDAR_ONBOARDING_KEY = "calendar-onboarding-seen";

export default function CalendarPage() {
  const t = useTranslations("Calendar");

  const calendarOnboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: "welcome",
      icon: Sparkles,
      color: "#3b82f6",
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDesc"),
    },
    {
      id: "dragdrop",
      icon: GripVertical,
      color: "#3b82f6",
      title: t("onboarding.dragdropTitle"),
      description: t("onboarding.dragdropDesc"),
    },
    {
      id: "scheduling",
      icon: Clock,
      color: "#3b82f6",
      title: t("onboarding.schedulingTitle"),
      description: t("onboarding.schedulingDesc"),
    },
    {
      id: "views",
      icon: LayoutGrid,
      color: "#3b82f6",
      title: t("onboarding.viewsTitle"),
      description: t("onboarding.viewsDesc"),
    },
    {
      id: "getstarted",
      icon: Rocket,
      color: "#3b82f6",
      title: t("onboarding.getstartedTitle"),
      description: t("onboarding.getstartedDesc"),
    },
  ], [t]);

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm shadow-blue-500/25"
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
        skipText={t("onboarding.skip")}
        nextText={t("onboarding.next")}
        getStartedText={t("onboarding.getStarted")}
      />
    </AppLayout>
  );
}
