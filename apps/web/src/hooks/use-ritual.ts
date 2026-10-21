import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  RitualEveningComplete,
  RitualEveningMove,
  RitualEveningView,
  RitualMorningView,
  RitualStreak,
  RitualTimeboxBlock,
  RitualTimeboxBlockInput,
} from "@ordo-todo/api-client";

const ritualKeys = {
  all: ["ritual"] as const,
  morning: ["ritual", "morning"] as const,
  evening: ["ritual", "evening"] as const,
  streak: ["ritual", "streak"] as const,
};

export function useMorningRitual() {
  return useQuery<RitualMorningView>({
    queryKey: ritualKeys.morning,
    queryFn: () => apiClient.getMorningRitual(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useEveningRitual() {
  return useQuery<RitualEveningView>({
    queryKey: ritualKeys.evening,
    queryFn: () => apiClient.getEveningRitual(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useStreak() {
  return useQuery<RitualStreak>({
    queryKey: ritualKeys.streak,
    queryFn: () => apiClient.getRitualStreak(),
    staleTime: 60_000,
    retry: false,
  });
}

function useInvalidateRitual() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ritualKeys.all });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    // Time-boxing writes scheduledDate/Time: refresh a mounted calendar too.
    queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
  };
}

export function useCompleteMorning() {
  const invalidate = useInvalidateRitual();
  return useMutation({
    mutationFn: (top3: string[]) => apiClient.completeMorningRitual(top3),
    onSuccess: invalidate,
  });
}

export function useSkipMorning() {
  const invalidate = useInvalidateRitual();
  return useMutation({
    mutationFn: () => apiClient.skipMorningRitual(),
    onSuccess: invalidate,
  });
}

export function useCompleteEvening() {
  const invalidate = useInvalidateRitual();
  return useMutation<RitualEveningComplete, Error, RitualEveningMove[]>({
    mutationFn: (moves) => apiClient.completeEveningRitual(moves),
    onSuccess: invalidate,
  });
}

export function useSkipEvening() {
  const invalidate = useInvalidateRitual();
  return useMutation({
    mutationFn: () => apiClient.skipEveningRitual(),
    onSuccess: invalidate,
  });
}

export function useSaveTimebox() {
  const invalidate = useInvalidateRitual();
  return useMutation<RitualTimeboxBlock[], Error, RitualTimeboxBlockInput[]>({
    mutationFn: (blocks) => apiClient.saveTimebox(blocks),
    onSuccess: invalidate,
  });
}

export function useAcceptTimebox() {
  const invalidate = useInvalidateRitual();
  return useMutation({
    mutationFn: () => apiClient.acceptTimeboxProposal(),
    onSuccess: invalidate,
  });
}
