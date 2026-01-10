"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@ordo-todo/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TimerProvider } from "./timer-provider";
import { TimerSettingsProvider } from "./timer-settings-provider";
import { DevToolsProvider } from "./devtools-provider";
import { DevToolsPanel } from "@/components/devtools";
import { AIFeaturesTourProvider } from "@/components/onboarding/ai-features-tour";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
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
      })
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
        <AuthProvider>
          <TimerSettingsProvider>
            <TimerProvider>
              <DevToolsProvider>
                <AIFeaturesTourProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </AIFeaturesTourProvider>
                {process.env.NODE_ENV === 'development' && <DevToolsPanel />}
              </DevToolsProvider>
            </TimerProvider>
          </TimerSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}