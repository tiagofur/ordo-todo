import { QueryClient } from "@tanstack/react-query";
import { registerQueryClient } from "./api-client";

/** QueryClient único de la app (desktop y móvil comparten este módulo). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Register it with the api client to handle auth errors globally
registerQueryClient(queryClient);
