"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@ordo-todo/ui";
import { TimerProvider } from "./timer-provider";
import { TimerSettingsProvider } from "./timer-settings-provider";
import { DevToolsProvider } from "./devtools-provider";
import { DevToolsPanel } from "@/components/devtools";
import { AIFeaturesTourProvider } from "@/components/onboarding/ai-features-tour";

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
  return (
    <AuthProvider>
      <TimerSettingsProvider>
        <TimerProvider>
          <DevToolsProvider>
            <AIFeaturesTourProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AIFeaturesTourProvider>
            {/* DevTools only in development */}
            {process.env.NODE_ENV === 'development' && <DevToolsPanel />}
          </DevToolsProvider>
        </TimerProvider>
      </TimerSettingsProvider>
    </AuthProvider>
  );
}
