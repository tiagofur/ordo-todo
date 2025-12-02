'use client';
 
import { useEffect } from 'react';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
 
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">System Error</h1>
            <p className="text-lg text-muted-foreground">
              A critical error occurred. Please try refreshing the page.
            </p>
            <div className="rounded-md bg-muted p-4 text-left font-mono text-sm overflow-auto max-h-40">
              {error.message}
            </div>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
