import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { apiClient, registerQueryClient } from "./lib/api-client";
import { sharedApiClient } from "./lib/shared-api-client";
import { createDesktopOAuthHandler } from "./lib/oauth";
import { router } from "./routes";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Register it with the api client to handle auth errors globally
registerQueryClient(queryClient);

// Create OAuth handler for desktop
const oauthHandler = createDesktopOAuthHandler();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider 
        platform="desktop" 
        apiClient={sharedApiClient}
        onOAuthLogin={oauthHandler}
      >
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
