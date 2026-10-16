"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useObjectives } from "@/lib/api-hooks";
import { Plus, Target, Sparkles, KeyRound, Link2, TrendingUp } from "lucide-react";
import { Skeleton, type OnboardingStep } from "@ordo-todo/ui";
import { FeatureOnboarding } from "@/components/shared/feature-onboarding.component";
import { motion } from "framer-motion";
import { CreateObjectiveDialog } from "@/components/goals/create-objective-dialog";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";

const GOALS_ONBOARDING_KEY = "goals-onboarding-seen";

export default function GoalsPage() {
  const t = useTranslations("Goals");
  const { data: objectives, isLoading, error } = useObjectives();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const goalsOnboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: "welcome",
      icon: Sparkles,
      color: "#f97316",
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDesc"),
    },
    {
      id: "objectives",
      icon: Target,
      color: "#f97316",
      title: t("onboarding.objectivesTitle"),
      description: t("onboarding.objectivesDesc"),
    },
    {
      id: "keyresults",
      icon: KeyRound,
      color: "#10b981",
      title: t("onboarding.keyresultsTitle"),
      description: t("onboarding.keyresultsDesc"),
    },
    {
      id: "linking",
      icon: Link2,
      color: "#f59e0b",
      title: t("onboarding.linkingTitle"),
      description: t("onboarding.linkingDesc"),
    },
    {
      id: "progress",
      icon: TrendingUp,
      color: "#06b6d4",
      title: t("onboarding.progressTitle"),
      description: t("onboarding.progressDesc"),
    },
  ], [t]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm shadow-orange-500/25"
              >
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("listTitle")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">{t("subtitle")}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("createObjective")}</span>
          </motion.button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[300px]">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <Target className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold">{t("error") || "Error al cargar objetivos"}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{t("errorDescription") || "No se pudieron cargar los objetivos. Intenta de nuevo."}</p>
          </div>
        ) : !objectives || objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[400px] bg-card rounded-3xl border border-dashed border-border mx-auto w-full max-w-3xl py-12 px-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10 mb-6"
              >
                  <Target className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{t("noObjectives")}</h3>
              <p className="text-muted-foreground mt-3 max-w-md text-base sm:text-lg">{t("noObjectivesDescription")}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateOpen(true)}
                className="mt-8 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                {t("createObjective")}
              </motion.button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {objectives.map((objective, index) => (
              <motion.div
                  key={objective.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 cursor-pointer"
                  onClick={() => router.push(`/goals/${objective.id}`)}
              >
                  <div className="flex justify-between items-start mb-4 gap-3">
                      <h3 className="font-bold text-xl group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {objective.title}
                      </h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0"
                        style={{
                          backgroundColor: `${objective.color || "#f97316"}15`,
                          color: objective.color || "#f97316",
                        }}
                      >
                          {t(`status.${objective.status}`)}
                      </span>
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t("progress")}</span>
                              <span className="font-semibold">{Math.round(objective.progress ?? 0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, objective.progress ?? 0))}%`,
                                    backgroundColor: objective.color || "#f97316",
                                  }}
                              />
                          </div>
                      </div>
                  </div>
              </motion.div>
            ))}
          </div>
        )}

        <CreateObjectiveDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

        {/* Onboarding */}
        <FeatureOnboarding
          steps={goalsOnboardingSteps}
          storageKey={GOALS_ONBOARDING_KEY}
          skipText={t("onboarding.skip")}
          nextText={t("onboarding.next")}
          getStartedText={t("onboarding.getStarted")}
        />
      </div>
    </AppLayout>
  );
}
