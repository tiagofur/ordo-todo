"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from "react";
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
import { useWorkspaces } from "@/lib/api-hooks";

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

// All possible tour steps
const allTourSteps: AIFeatureTourStep[] = [
  {
    id: "welcome-team",
    title: "¡Bienvenido, Líder de Equipo!",
    description: "Hemos añadido potentes herramientas de IA diseñadas para equipos. Descubre cómo mejorar la colaboración y productividad de tu equipo.",
    icon: <Sparkles className="h-8 w-8" />,
    color: "#8b5cf6",
    forTeam: true,
  },
  {
    id: "welcome-individual",
    title: "¡Nuevas Funciones de IA!",
    description: "Hemos añadido potentes herramientas de inteligencia artificial para impulsar tu productividad personal. Te mostramos lo nuevo.",
    icon: <Sparkles className="h-8 w-8" />,
    color: "#8b5cf6",
    forIndividual: true,
  },
  {
    id: "smart-search",
    title: "Búsqueda Inteligente",
    description: "Usa Cmd+K (o Ctrl+K) para abrir la búsqueda semántica. Encuentra tareas por significado, no solo por palabras exactas.",
    icon: <Brain className="h-8 w-8" />,
    color: "#06b6d4",
  },
  {
    id: "meetings",
    title: "Asistente de Reuniones",
    description: "Pega transcripciones de tus reuniones y la IA extraerá automáticamente action items, decisiones y participantes.",
    icon: <MessageSquare className="h-8 w-8" />,
    color: "#8b5cf6",
    action: {
      label: "Ir a Meetings",
      href: "/meetings",
    },
  },
  {
    id: "wellbeing",
    title: "Panel de Bienestar",
    description: "Monitorea tu riesgo de burnout, analiza tus patrones de trabajo y recibe recomendaciones personalizadas.",
    icon: <Heart className="h-8 w-8" />,
    color: "#ec4899",
    action: {
      label: "Ver Bienestar",
      href: "/wellbeing",
    },
  },
  {
    id: "workload",
    title: "Carga del Equipo",
    description: "Visualiza la carga de trabajo de tu equipo, identifica desequilibrios y redistribuye tareas de forma inteligente.",
    icon: <Users className="h-8 w-8" />,
    color: "#f97316",
    action: {
      label: "Ver Carga",
      href: "/workload",
    },
    forTeam: true, // Only for team users
  },
  {
    id: "focus-audio",
    title: "Audio para Focus",
    description: "Activa sonidos ambient durante tus sesiones de enfoque para mejorar la concentración. Lo puedes configurar en Settings.",
    icon: <Headphones className="h-8 w-8" />,
    color: "#10b981",
  },
  {
    id: "complete-team",
    title: "¡Tu Equipo Está Listo!",
    description: "Explora estas nuevas funciones y comparte con tu equipo cómo la IA puede ayudarles a ser más productivos. ¡Comienza ahora!",
    icon: <Rocket className="h-8 w-8" />,
    color: "#06b6d4",
    forTeam: true,
  },
  {
    id: "complete-individual",
    title: "¡Todo Listo!",
    description: "Explora estas nuevas funciones y descubre cómo la IA puede ayudarte a ser más productivo. ¡Comienza ahora!",
    icon: <Rocket className="h-8 w-8" />,
    color: "#06b6d4",
    forIndividual: true,
  },
];

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

export function AIFeaturesTourProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  
  // Detect if user has shared workspaces (team user)
  const { data: workspaces = [] } = useWorkspaces();
  const isTeamUser = useMemo(() => {
    return workspaces.some((ws: any) => ws.members && ws.members.length > 1);
  }, [workspaces]);

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
  }, [isTeamUser]);

  useEffect(() => {
    const seen = localStorage.getItem(AI_FEATURES_TOUR_KEY);
    if (!seen) {
      setHasSeenTour(false);
      // Delay showing to let the page load and workspaces to fetch
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const showTour = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const closeTour = () => {
    setIsVisible(false);
    localStorage.setItem(AI_FEATURES_TOUR_KEY, "true");
    setHasSeenTour(true);
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

  return (
    <AIFeaturesTourContext.Provider value={{ showTour, hasSeenTour, isTeamUser }}>
      {children}
      <AnimatePresence>
        {isVisible && step && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeTour}
            />

            {/* Modal */}
            <motion.div
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
                    <span className="px-2 py-1 rounded-full bg-white/20 text-white/90 text-xs font-medium flex items-center gap-1">
                      {isTeamUser ? (
                        <>
                          <Users className="h-3 w-3" />
                          Equipo
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3" />
                          Personal
                        </>
                      )}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={closeTour}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-4 mt-6">
                    <div className="p-3 rounded-xl bg-white/20">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">
                        Paso {currentStep + 1} de {tourSteps.length}
                      </p>
                      <h2 className="text-xl font-bold">{step.title}</h2>
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
                            ? "w-2 bg-primary/50"
                            : "w-2 bg-muted"
                        )}
                      />
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <Button variant="ghost" size="sm" onClick={prevStep}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                    )}
                    <Button size="sm" onClick={nextStep}>
                      {currentStep === tourSteps.length - 1 ? (
                        "¡Empezar!"
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AIFeaturesTourContext.Provider>
  );
}

