import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

/**
 * Live NL parsing for mobile capture (S6).
 * Debounced 300ms; only queries with 3+ chars. Uses fast mode
 * (deterministic, no LLM) so feedback stays under 200ms.
 */
export function useParseTask(input: string) {
  const debounced = useDebouncedValue(input.trim(), 300);

  const query = useQuery({
    queryKey: ["ai", "parse-task", debounced],
    queryFn: () => apiClient.parseTask({ input: debounced, fast: true }),
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
