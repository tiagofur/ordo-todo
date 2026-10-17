/**
 * Hook to handle OAuth callback
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseOAuthCallback, storeOAuthTokens } from "@/lib/oauth";

export function useOAuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleAuthCallback = useCallback(async (params: Record<string, string>) => {
    const callbackData = parseOAuthCallback(params);

    if (callbackData.error) {
      toast.error(`OAuth failed: ${callbackData.error}`);
      return;
    }

    const success = await storeOAuthTokens(callbackData);

    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } else {
      toast.error("Failed to complete sign in");
    }
  }, [navigate, queryClient]);

  useEffect(() => {
    // Check if current URL contains oauth callback params
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        params[key] = val;
      });
      if (params.access_token || params.accessToken || params.token) {
        handleAuthCallback(params);
      }
    }
  }, [handleAuthCallback]);
}

export default useOAuthCallback;
