import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { ThemeProvider } from "./components/providers/theme-provider";
import { queryClient } from "./lib/query-client";
import { sharedApiClient } from "./lib/shared-api-client";
import { createDesktopOAuthHandler } from "./lib/oauth";
import { router } from "./routes";
import "./App.css";

// Create OAuth handler for desktop
const oauthHandler = createDesktopOAuthHandler();

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="ordo-theme"
      disableTransitionOnChange={false}
    >
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
    </ThemeProvider>
  );
}

export default App;
