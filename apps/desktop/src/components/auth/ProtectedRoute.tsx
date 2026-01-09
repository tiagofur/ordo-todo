import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/api";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

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

  return <Outlet />;
}