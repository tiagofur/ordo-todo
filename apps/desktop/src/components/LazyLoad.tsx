import { lazy } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Create a loading component
const LoadingSpinner = () => (
  <Card className="min-h-[400px] flex items-center justify-center">
    <CardContent className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </CardContent>
  </Card>
);

// Lazy loading wrapper
export function LazyLoad<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(factory);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Preload component (for critical paths)
export function preloadComponent(factory: () => Promise<{ default: any }>) {
  factory();
}