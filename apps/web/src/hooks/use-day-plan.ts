import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import type { DayPlanRisk, DayPlanView } from "@ordo-todo/api-client";

const planKeys = {
  all: ["day-plan"] as const,
  risks: ["day-plan", "risks"] as const,
};

export function useDayPlan() {
  return useQuery<DayPlanView>({
    queryKey: planKeys.all,
    queryFn: () => apiClient.getDayPlan(),
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Day-plan risks (ODD 005 S4/T4b). Graceful degradation: the endpoint
 * does not exist yet (404) — surface `null` data instead of an error
 * so the page renders the plan without the risks card.
 */
export function useDayPlanRisks() {
  return useQuery<DayPlanRisk[] | null>({
    queryKey: planKeys.risks,
    queryFn: async () => {
      try {
        return await apiClient.getDayPlanRisks();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

function useInvalidatePlan() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: planKeys.all });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };
}

export function useApplyDayPlan() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: (proposalId: string) => apiClient.applyDayPlan(proposalId),
    onSuccess: invalidate,
  });
}

export function useDismissDayPlan() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: (proposalId: string) => apiClient.dismissDayPlan(proposalId),
    onSuccess: invalidate,
  });
}

export function useToggleFreezeDayPlan() {
  const invalidate = useInvalidatePlan();
  return useMutation({
    mutationFn: ({ taskId, freeze }: { taskId: string; freeze: boolean }) =>
      freeze
        ? apiClient.freezeDayPlanBlock(taskId)
        : apiClient.unfreezeDayPlanBlock(taskId),
    onSuccess: invalidate,
  });
}
