import { create } from "zustand";

interface OnboardingState {
  /** Ids de los tours visibles ahora mismo (0 o 1: solo un tour a la vez) */
  active: string[];
  /** Intenta reservar el turno del modal de onboarding; false si otro tour está abierto */
  tryAcquire: (id: string) => boolean;
  /** Libera el turno (tolerante si el id no estaba) */
  release: (id: string) => void;
}

/**
 * Mutex de onboarding: coordina los FeatureOnboarding de página con el tour
 * global de IA para que nunca haya dos tours modales apilados. El orden es el
 * de montaje: quien primero reserva, muestra; el otro espera su turno.
 */
export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  active: [],
  tryAcquire: (id) => {
    if (get().active.length > 0) return false;
    set({ active: [...get().active, id] });
    return true;
  },
  release: (id) =>
    set((s) => ({ active: s.active.filter((owner) => owner !== id) })),
}));
