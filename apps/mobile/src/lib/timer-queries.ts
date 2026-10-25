import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PauseTimerDto, StartTimerDto } from "@ordo-todo/api-client";
import { apiClient } from "./api";

export function useActiveTimer() {
  return useQuery({
    queryKey: ["timer", "active"],
    queryFn: () => apiClient.getActiveTimer(),
    staleTime: 10_000,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartTimerDto) => apiClient.startTimer(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["timer"] }),
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { wasCompleted?: boolean }) =>
      apiClient.stopTimer(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["timer"] });
      void qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });
}

export function usePauseTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PauseTimerDto = {}) => apiClient.pauseTimer(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["timer"] }),
  });
}

export function useResumeTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { pauseStartedAt: Date }) =>
      apiClient.resumeTimer(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["timer"] }),
  });
}

export function useTimerStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["timer", "stats", params?.startDate ?? null],
    queryFn: () => apiClient.getTimerStats(params),
    staleTime: 60_000,
  });
}

export function useSessionHistory(params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  completedOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["timer", "history", params ?? null],
    queryFn: () => apiClient.getSessionHistory(params),
    staleTime: 60_000,
  });
}
