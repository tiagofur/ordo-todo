"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { Toaster } from "@ordo-todo/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TimerProvider } from "./timer-provider";
import { TimerSettingsProvider } from "./timer-settings-provider";
import { DevToolsProvider } from "./devtools-provider";
import { DevToolsPanel } from "@/components/devtools";
import { AIFeaturesTourProvider } from "@/components/onboarding/ai-features-tour";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { sharedApiClient } from "@/lib/shared-api-client";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const isMobile = useIsMobile();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

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
          platform="web"
          apiClient={sharedApiClient}
          queryClient={queryClient}
        >
          <TimerSettingsProvider>
            <TimerProvider>
              <DevToolsProvider>
                <AIFeaturesTourProvider>
                  {children}
                  {/* En móvil el toast pasa a bottom-center: en top-right tapa
                      la cabecera del drawer, justo donde el usuario acaba de tocar. */}
                  <Toaster
                    richColors
                    position={isMobile ? "bottom-center" : "top-right"}
                  />
                </AIFeaturesTourProvider>
                {process.env.NODE_ENV === "development" && <DevToolsPanel />}
              </DevToolsProvider>
            </TimerProvider>
          </TimerSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
