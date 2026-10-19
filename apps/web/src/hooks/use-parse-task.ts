"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Live NL parsing for the Quick-Add input (S2).
 * Debounced 300ms; only queries with 3+ chars. Uses fast mode
 * (deterministic, no LLM) so feedback stays under 200ms.
 */
export function useParseTask(input: string) {
  const debounced = useDebouncedValue(input.trim(), 300);

  const query = useQuery({
    queryKey: ["ai", "parse-task", debounced],
    queryFn: () => apiClient.parseTask(debounced, { fast: true }),
    enabled: debounced.length >= 3,
    staleTime: 60_000,
    retry: false,
  });

  return {
    parsed: debounced.length >= 3 ? (query.data ?? null) : null,
    isParsing: query.isFetching,
    needsConfirmation: query.data?.needsConfirmation ?? false,
  };
}
