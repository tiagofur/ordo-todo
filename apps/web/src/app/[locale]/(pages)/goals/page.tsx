"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useObjectives } from "@/lib/api-hooks";
import { Plus, Target, Sparkles, KeyRound, Link2, TrendingUp, Rocket } from "lucide-react";
import { Button, Skeleton, FeatureOnboarding, type OnboardingStep } from "@ordo-todo/ui";
import { CreateObjectiveDialog } from "@/components/goals/create-objective-dialog";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";

const GOALS_ONBOARDING_KEY = "goals-onboarding-seen";

const goalsOnboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    color: "#8b5cf6",
    title: "Objetivos y OKRs",
    description: "Define metas ambiciosas y mide tu progreso con la metodología OKR (Objectives and Key Results) usada por Google.",
  },
  {
    id: "objectives",
    icon: Target,
    color: "#8b5cf6",
    title: "¿Qué son los Objetivos?",
    description: "Un objetivo es una meta inspiracional y cualitativa. Ejemplo: 'Mejorar la salud física' o 'Lanzar un producto exitoso'.",
  },
  {
    id: "keyresults",
    icon: KeyRound,
    color: "#10b981",
    title: "Key Results",
    description: "Los Key Results son métricas específicas y medibles. Ejemplo: 'Hacer ejercicio 3 veces por semana' o 'Alcanzar 1000 usuarios'.",
  },
  {
    id: "linking",
    icon: Link2,
    color: "#f59e0b",
    title: "Vincula Tareas",
    description: "Conecta tus tareas diarias a Key Results específicos. Cada tarea completada contribuye a tu progreso.",
  },
  {
    id: "progress",
    icon: TrendingUp,
    color: "#06b6d4",
    title: "Seguimiento de Progreso",
    description: "Visualiza el avance de cada objetivo y ajusta tu estrategia. ¡Mantén el foco en lo que realmente importa!",
  },
];

export default function GoalsPage() {
  const t = useTranslations("Goals");
  const { data: objectives, isLoading } = useObjectives();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(GOALS_ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(GOALS_ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <Target className="h-6 w-6" />
              </div>
              {t("listTitle")}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{t("subtitle")}</p>
          </div>
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-all px-2.5 sm:px-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">{t("createObjective")}</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : !objectives || objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted mx-auto w-full max-w-3xl py-12">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                  <Target className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{t("noObjectives")}</h3>
              <p className="text-muted-foreground mt-3 max-w-md text-lg">{t("noObjectivesDescription")}</p>
              <Button className="mt-8" size="lg" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                {t("createObjective")}
              </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {objectives.map((objective) => (
              <div
                  key={objective.id}
                  className="p-6 border rounded-xl bg-card hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
                  onClick={() => router.push(`/goals/${objective.id}`)}
              >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: objective.color }}></div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">{objective.title}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted uppercase tracking-wider">
                          {t(`status.${objective.status}`)}
                      </span>
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t("progress")}</span>
                              <span className="font-medium">{Math.round(objective.progress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${objective.progress}%`, backgroundColor: objective.color }}
                              />
                          </div>
                      </div>
                  </div>
              </div>
            ))}
          </div>
        )}

        <CreateObjectiveDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

        {/* Onboarding */}
        {showOnboarding && (
          <FeatureOnboarding
            steps={goalsOnboardingSteps}
            storageKey={GOALS_ONBOARDING_KEY}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
            skipText="Saltar"
            nextText="Siguiente"
            getStartedText="¡Crear mi primer Objetivo!"
          />
        )}
      </div>
    </AppLayout>
  );
}
