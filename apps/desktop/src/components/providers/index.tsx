import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@ordo-todo/auth-provider";
import { Toaster } from "@ordo-todo/ui";
import { QueryProvider } from "@/providers/query-provider";
import { sharedApiClient } from "@/lib/shared-api-client";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * NOTE (ODD 014 T3): this composition is currently unreferenced (App.tsx
 * builds its own provider tree; the live TimerProvider mounts in
 * ProtectedRoute). The duplicate TimerProvider was removed so exactly one
 * mount site exists. Full dead-code cleanup belongs to T7.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider platform="desktop" apiClient={sharedApiClient}>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
