import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CalendarAccountStatus } from "@ordo-todo/api-client";

const calendarKeys = {
  status: ["integrations", "calendar", "status"] as const,
};

/**
 * Per-account calendar sync status (ok / error / re-auth-required).
 */
export function useCalendarStatus() {
  return useQuery<CalendarAccountStatus[]>({
    queryKey: calendarKeys.status,
    queryFn: () => apiClient.getCalendarStatus(),
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Start calendar OAuth: opens the provider authorize URL.
 * The provider redirects back to the callback, which lands on settings.
 */
export function useCalendarConnect() {
  return useMutation({
    mutationFn: async (provider: string) => {
      const { authorizeUrl } = await apiClient.startCalendarConnect(provider);
      window.location.href = authorizeUrl;
    },
  });
}

export function useCalendarDisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => apiClient.disconnectCalendar(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.status });
    },
  });
}
