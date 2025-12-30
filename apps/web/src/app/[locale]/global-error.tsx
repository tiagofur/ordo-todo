"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@ordo-todo/ui";

/**
 * Global Error page for unhandled errors.
 * This is a Next.js App Router convention that catches errors in layouts and pages.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <AlertOctagon className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Ups! Algo salió mal
          </h1>
          
          <p className="text-muted-foreground mb-6 max-w-md">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            Por favor, intenta recargar la página.
          </p>
          
          {process.env.NODE_ENV === "development" && (
            <pre className="text-xs text-left bg-muted p-4 rounded-lg mb-6 max-w-full overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}
          
          <div className="flex gap-4">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
            <Button onClick={() => window.location.href = "/"} className="gap-2">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
