"use client";

import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  Heart,
  Users,
  Brain,
  Headphones,
  X,
  ChevronRight,
  ChevronLeft,
  Rocket,
  User,
} from "lucide-react";
import { Button } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useWorkspaces } from "@/lib/api-hooks";
import { useAuth } from "@ordo-todo/auth-provider";
import { useOnboardingStore } from "@/stores/onboarding-store";

interface AIFeatureTourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action?: {
    label: string;
    href: string;
  };
  forTeam?: boolean; // Only show for team users
  forIndividual?: boolean; // Only show for individual users
}

const AI_FEATURES_TOUR_KEY = "ai-features-tour-seen-v2";
const AI_TOUR_ID = "ai-features-tour";
const AI_TOUR_DELAY_MS = 2000;

interface AIFeaturesTourContextType {
  showTour: () => void;
  hasSeenTour: boolean;
  isTeamUser: boolean;
}

const AIFeaturesTourContext = createContext<AIFeaturesTourContextType>({
  showTour: () => {},
  hasSeenTour: true,
  isTeamUser: false,
});

export const useAIFeaturesTour = () => useContext(AIFeaturesTourContext);

function AIFeaturesTourInner({ children }: { children: ReactNode }) {
  const t = useTranslations("AIFeaturesTour");
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const activeTours = useOnboardingStore((s) => s.active);
  const acquiredRef = useRef(false);

  // Use hooks freely here as we are mounted on client, but only fetch if authenticated
  const { data: workspaces = [] } = useWorkspaces({
    enabled: !!isAuthenticated,
  });

  const isTeamUser = useMemo(() => {
    return workspaces.some((ws) => (ws.stats?.memberCount ?? 1) > 1);
  }, [workspaces]);

  // All possible tour steps
  const allTourSteps: AIFeatureTourStep[] = [
    {
      id: "welcome-team",
      title: t("steps.welcomeTeam.title"),
      description: t("steps.welcomeTeam.description"),
      icon: <Sparkles className="h-8 w-8" />,
      color: "#8b5cf6",
      forTeam: true,
    },
    {
      id: "welcome-individual",
      title: t("steps.welcomeIndividual.title"),
      description: t("steps.welcomeIndividual.description"),
      icon: <Sparkles className="h-8 w-8" />,
      color: "#8b5cf6",
      forIndividual: true,
    },
    {
      id: "smart-search",
      title: t("steps.smartSearch.title"),
      description: t("steps.smartSearch.description"),
      icon: <Brain className="h-8 w-8" />,
      color: "#06b6d4",
    },
    {
      id: "meetings",
      title: t("steps.meetings.title"),
      description: t("steps.meetings.description"),
      icon: <MessageSquare className="h-8 w-8" />,
      color: "#8b5cf6",
      action: {
        label: t("steps.meetings.action"),
        href: "/meetings",
      },
    },
    {
      id: "wellbeing",
      title: t("steps.wellbeing.title"),
      description: t("steps.wellbeing.description"),
      icon: <Heart className="h-8 w-8" />,
      color: "#ec4899",
      action: {
        label: t("steps.wellbeing.action"),
        href: "/wellbeing",
      },
    },
    {
      id: "workload",
      title: t("steps.workload.title"),
      description: t("steps.workload.description"),
      icon: <Users className="h-8 w-8" />,
      color: "#f97316",
      action: {
        label: t("steps.workload.action"),
        href: "/workload",
      },
      forTeam: true, // Only for team users
    },
    {
      id: "focus-audio",
      title: t("steps.focusAudio.title"),
      description: t("steps.focusAudio.description"),
      icon: <Headphones className="h-8 w-8" />,
      color: "#10b981",
    },
    {
      id: "complete-team",
      title: t("steps.completeTeam.title"),
      description: t("steps.completeTeam.description"),
      icon: <Rocket className="h-8 w-8" />,
      color: "#06b6d4",
      forTeam: true,
    },
    {
      id: "complete-individual",
      title: t("steps.completeIndividual.title"),
      description: t("steps.completeIndividual.description"),
      icon: <Rocket className="h-8 w-8" />,
      color: "#06b6d4",
      forIndividual: true,
    },
  ];

  // Filter tour steps based on user type
  const tourSteps = useMemo(() => {
    return allTourSteps.filter((step) => {
      // Show steps without user type restriction
      if (!step.forTeam && !step.forIndividual) return true;
      // Show team-specific steps only for team users
      if (step.forTeam && isTeamUser) return true;
      // Show individual-specific steps only for individual users
      if (step.forIndividual && !isTeamUser) return true;
      return false;
    });
  }, [isTeamUser, t]);

  // Auto-show solo cuando el usuario está autenticado, no ha visto el tour y
  // ningún otro onboarding ocupa el turno (mutex del onboarding-store).
  useEffect(() => {
    if (!isAuthenticated) return;
    if (localStorage.getItem(AI_FEATURES_TOUR_KEY)) return;
    if (activeTours.length > 0 || acquiredRef.current) return;
    setHasSeenTour(false);

    const timer = setTimeout(() => {
      if (useOnboardingStore.getState().tryAcquire(AI_TOUR_ID)) {
        acquiredRef.current = true;
        setIsVisible(true);
      }
    }, AI_TOUR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isAuthenticated, activeTours]);

  // Esc cierra el tour
  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible]);

  // Libera el turno si el componente se desmonta con el tour abierto
  useEffect(() => {
    return () => {
      if (acquiredRef.current) {
        useOnboardingStore.getState().release(AI_TOUR_ID);
        acquiredRef.current = false;
      }
    };
  }, []);

  const releaseTurn = () => {
    if (acquiredRef.current) {
      useOnboardingStore.getState().release(AI_TOUR_ID);
      acquiredRef.current = false;
    }
  };

  const showTour = () => {
    // Disparo manual (Settings): intención explícita del usuario, se muestra
    // aunque otro tour ocupara el turno; el release es tolerante.
    setCurrentStep(0);
    setIsVisible(true);
  };

  const closeTour = () => {
    setIsVisible(false);
    localStorage.setItem(AI_FEATURES_TOUR_KEY, "true");
    setHasSeenTour(true);
    releaseTurn();
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (href: string) => {
    closeTour();
    router.push(href);
  };

  const step = tourSteps[currentStep];

  // Si la lista de pasos se encoge mientras el tour está abierto (p.ej.
  // isTeamUser se resuelve tarde), ciérralo y libera el turno; sin este
  // guard el turno queda adquirido y bloquea el resto de tours.
  useEffect(() => {
    if (isVisible && !step) closeTour();
  }, [isVisible, step]);

  return (
    <AIFeaturesTourContext.Provider
      value={{ showTour, hasSeenTour, isTeamUser }}
    >
      {children}
      <AnimatePresence>
        {/* Los dos motion.div son hijos DIRECTOS de AnimatePresence (con key):
            un fragment sin key impide que framer-motion desmonte al salir y
            deja un backdrop invisible comiendo clics. */}
        {isVisible && step && (
          <motion.div
            key="ai-tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeTour}
          />
        )}

        {isVisible && step && (
          <motion.div
            key="ai-tour-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-tour-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
              {/* Header with gradient */}
              <div
                className="p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: step.color }}
              >
                {/* User type badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-full bg-white/20 ring-1 ring-white/30 text-white text-xs font-medium flex items-center gap-1">
                    {isTeamUser ? (
                      <>
                        <Users className="h-3 w-3" />
                        {t("team")}
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        {t("personal")}
                      </>
                    )}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("close")}
                  className="absolute top-2 right-2 h-11 w-11 text-white hover:text-white hover:bg-white/20"
                  onClick={closeTour}
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-4 mt-6">
                  <div className="p-3 rounded-xl bg-white/20 ring-1 ring-white/30">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-white/90 text-sm">
                      {t("stepOf", {
                        current: currentStep + 1,
                        total: tourSteps.length,
                      })}
                    </p>
                    <h2 id="ai-tour-title" className="text-xl font-bold">
                      {step.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {step.action && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => handleAction(step.action!.href)}
                  >
                    {step.action.label}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        idx === currentStep
                          ? "w-6 bg-primary"
                          : idx < currentStep
                            ? "w-2 bg-primary"
                            : "w-2 bg-muted",
                      )}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("previous")}
                    </Button>
                  )}
                  <Button onClick={nextStep}>
                    {currentStep === tourSteps.length - 1 ? (
                      t("start")
                    ) : (
                      <>
                        {t("next")}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AIFeaturesTourContext.Provider>
  );
}

export function AIFeaturesTourProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // In SSR, render children directly without Tour context features
  // This prevents useQuery from running on server
  if (!mounted) {
    return <>{children}</>;
  }

  // On client, render the full tour logic
  return <AIFeaturesTourInner>{children}</AIFeaturesTourInner>;
}
