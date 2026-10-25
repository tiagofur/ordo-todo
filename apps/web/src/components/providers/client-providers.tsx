"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { Toaster } from "@ordo-todo/ui";
import { TimerProvider } from "./timer-provider";
import { TimerSettingsProvider } from "./timer-settings-provider";
import { DevToolsProvider } from "./devtools-provider";
import { DevToolsPanel } from "@/components/devtools";
import { AIFeaturesTourProvider } from "@/components/onboarding/ai-features-tour";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { sharedApiClient } from "@/lib/shared-api-client";

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-only providers that use React Query hooks.
 *
 * This component is dynamically imported with ssr: false to ensure
 * React Query hooks are never called during server-side rendering.
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  const isMobile = useIsMobile();

  return (
    <AuthProvider platform="web" apiClient={sharedApiClient}>
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
            {/* DevTools only in development */}
            {process.env.NODE_ENV === "development" && <DevToolsPanel />}
          </DevToolsProvider>
        </TimerProvider>
      </TimerSettingsProvider>
    </AuthProvider>
  );
}
