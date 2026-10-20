import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  AgentJob,
  CreateAgentJobInput,
  UpdateAgentJobInput,
} from "@ordo-todo/api-client";

const jobsKeys = {
  all: ["agent-jobs"] as const,
};

export function useAgentJobs() {
  return useQuery<AgentJob[]>({
    queryKey: jobsKeys.all,
    queryFn: () => apiClient.getAgentJobs(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateAgentJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAgentJobInput) =>
      apiClient.createAgentJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}

export function useUpdateAgentJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAgentJobInput }) =>
      apiClient.updateAgentJob(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}

export function useDeleteAgentJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAgentJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}

export function useRunAgentJobNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.runAgentJobNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
  });
}
