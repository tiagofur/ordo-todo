/**
 * Component that listens for OAuth callbacks from deep links
 * Must be rendered within RouterProvider and QueryClientProvider context
 */

import { useOAuthCallback } from "@/hooks/use-oauth-callback";

export function OAuthCallbackHandler({ children }: { children: React.ReactNode }) {
  // This hook sets up the deep link listener for OAuth callbacks
  useOAuthCallback();
  
  return <>{children}</>;
}
