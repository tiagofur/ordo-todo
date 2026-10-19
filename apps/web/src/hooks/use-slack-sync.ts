import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SlackTeamMapping } from "@ordo-todo/api-client";

const slackKeys = {
  teams: ["integrations", "slack", "teams"] as const,
};

/**
 * Connected Slack teams + per-team mappings.
 */
export function useSlackTeams() {
  return useQuery<SlackTeamMapping[]>({
    queryKey: slackKeys.teams,
    queryFn: () => apiClient.getSlackTeams(),
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Start Slack install: opens the provider authorize URL.
 * The provider redirects back to the callback, which lands on settings.
 */
export function useSlackInstall() {
  return useMutation({
    mutationFn: async () => {
      const { installUrl } = await apiClient.startSlackInstall();
      window.location.href = installUrl;
    },
  });
}

export function useSlackUninstall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => apiClient.uninstallSlack(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slackKeys.teams });
    },
  });
}

export function useSlackMappingUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<
        Pick<
          SlackTeamMapping,
          | 'channelId'
          | 'projectId'
          | 'dailySummary'
          | 'summaryHour'
          | 'focusSync'
          | 'focusDnd'
        >
      >;
    }) => apiClient.updateSlackMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slackKeys.teams });
    },
  });
}
