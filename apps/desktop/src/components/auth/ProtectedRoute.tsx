import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/api";
import { Loader2 } from "lucide-react";
import { TimerProvider } from "@/contexts/timer-context";

export function ProtectedRoute() {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  const { data: user, isLoading } = useCurrentUser({ enabled: hasToken });
  const location = useLocation();

  // Sin token no hay nada que cargar: a /auth. (Antes quedaba enabled:false →
  // query pending para siempre → esta pantalla en loading eterno.)
  if (!hasToken) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <TimerProvider>
      <Outlet />
    </TimerProvider>
  );
}