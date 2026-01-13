/**
 * Hook to handle OAuth callback from deep links
 * 
 * Listens for ordo://auth/callback deep links and processes the tokens
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseOAuthCallback, storeOAuthTokens } from "@/lib/oauth";

interface DeepLinkData {
    type: "task" | "project" | "workspace" | "timer" | "settings" | "auth" | "unknown";
    id?: string;
    action?: string;
    params?: Record<string, string>;
}

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
            // Invalidate current user query to trigger refetch
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

            toast.success("Successfully signed in!");
            navigate("/dashboard");
        } else {
            toast.error("Failed to complete sign in");
        }
    }, [navigate, queryClient]);

    useEffect(() => {
        // Listen for deep link events from Electron
        if (window.electronAPI?.deepLinks?.onDeepLink) {
            const handleDeepLink = (data: DeepLinkData) => {
                console.log("[OAuth] Deep link received:", data);

                if (data.type === "auth" && data.id === "callback" && data.params) {
                    handleAuthCallback(data.params);
                }
            };

            window.electronAPI.deepLinks.onDeepLink(handleDeepLink);

            // Cleanup listener on unmount
            return () => {
                window.electronAPI?.removeAllListeners?.("deep-link");
            };
        }
    }, [handleAuthCallback]);
}

export default useOAuthCallback;
