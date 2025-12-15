"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactNode, useState, useEffect } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Configuration for Desktop App
 *
 * Enhanced with offline persistence and caching:
 * - 5 retries on failure (desktop can be more persistent)
 * - 5 minute stale time (longer for desktop use)
 * - 7 days cache duration (extended for offline support)
 * - Persistent cache across app restarts
 * - Optimized for Electron environment
 */

const createPersister = () => {
  if (typeof window === "undefined") return undefined;

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: "ordo-desktop-query-cache",
    throttleTime: 1000,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  });
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry more aggressively on desktop
            retry: 5,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
            refetchOnWindowFocus: (query) => {
              return navigator.onLine && query.state.status !== "error";
            },
            refetchOnReconnect: true,
            networkMode: "offlineFirst",
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 3,
            networkMode: "offlineFirst",
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  const [persister, setPersister] = useState<ReturnType<typeof createPersister>>(undefined);

  useEffect(() => {
    setPersister(createPersister());
  }, []);

  // Simple provider without persistence during loading
  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  // Enhanced provider with persistence
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey[0] as string;
            const persistableKeys = [
              "tasks", "projects", "workspaces", "tags",
              "analytics", "timers", "habits", "goals"
            ];
            return (
              query.state.status === "success" &&
              persistableKeys.some((key) => queryKey?.includes?.(key))
            );
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
