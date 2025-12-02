"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

// Create a persister that stores query cache in localStorage
// Note: For larger datasets, consider using IndexedDB via idb library
const createPersister = () => {
  if (typeof window === "undefined") return undefined;

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: "ordo-query-cache",
    // Throttle writes to avoid performance issues
    throttleTime: 1000,
    // Serialize/deserialize with date revival
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  });
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh for 1 minute
            staleTime: 60 * 1000,
            // Cache data for 24 hours (for offline support)
            gcTime: 1000 * 60 * 60 * 24,
            // Retry failed requests up to 3 times
            retry: 3,
            // Don't refetch on window focus when offline
            refetchOnWindowFocus: (query) => {
              return navigator.onLine && query.state.status !== "error";
            },
            // Enable network mode for offline support
            networkMode: "offlineFirst",
          },
          mutations: {
            // Retry mutations when back online
            networkMode: "offlineFirst",
            retry: 3,
          },
        },
      })
  );

  const [persister, setPersister] =
    useState<ReturnType<typeof createPersister>>(undefined);

  useEffect(() => {
    // Create persister only on client side
    setPersister(createPersister());
  }, []);

  // If no persister yet (SSR or loading), use regular provider without persistence
  if (!persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: {
            persistClient: async () => {},
            restoreClient: async () => undefined,
            removeClient: async () => {},
          },
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          buster: "", // Cache buster for invalidation
        }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Keep persisted data for 24 hours
        maxAge: 1000 * 60 * 60 * 24,
        // Dehydrate only successful queries
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries for key data
            const queryKey = query.queryKey[0] as string;
            const persistableKeys = ["tasks", "projects", "workspaces", "tags"];
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
