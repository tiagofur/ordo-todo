import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "../ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { TimerProvider } from "@/contexts/timer-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <TimerProvider>
            {children}
            <Toaster />
          </TimerProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
