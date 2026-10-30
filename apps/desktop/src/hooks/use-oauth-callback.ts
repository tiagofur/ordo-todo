/**
 * Hook to handle OAuth callback
 *
 * Desktop tokens arrive through `ordo://auth/callback?...` deep links:
 * the OS hands them to the running app and the Tauri deep-link plugin
 * re-emits them to the webview (`deep-link://new-url`). Web builds keep
 * the `window.location.search` path. Both funnel into the same
 * handleAuthCallback below.
 */

import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseOAuthCallback, storeOAuthTokens } from "@/lib/oauth";
import { desktopBridge } from "@/lib/desktop-bridge";

export function useOAuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const processedUrls = useRef<Set<string>>(new Set());

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

  const handleDeepLinkUrl = useCallback(
    async (url: string) => {
      // The same URL can arrive twice (launch URLs + live event); process it once.
      if (processedUrls.current.has(url)) return;
      processedUrls.current.add(url);

      const params: Record<string, string> = {};
      try {
        new URL(url).searchParams.forEach((val, key) => {
          params[key] = val;
        });
      } catch {
        return;
      }
      if (params.access_token || params.accessToken || params.token || params.error) {
        await handleAuthCallback(params);
      }
    },
    [handleAuthCallback]
  );

  useEffect(() => {
    // Check if current URL contains oauth callback params (web flow)
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

  useEffect(() => {
    // ordo:// deep links (desktop). Only the main window handles auth —
    // the mini-timer window loads this same bundle and must stay put.
    if (!desktopBridge.isDesktop() || !desktopBridge.isMainWindow()) {
      return;
    }

    let cancelled = false;
    const unlistenDeepLink = desktopBridge.onDeepLinkUrl((url) => {
      void handleDeepLinkUrl(url);
    });

    // Cold start: the URL may arrive before the listener above exists,
    // so also pick up the URLs the app was launched with.
    void desktopBridge.getDeepLinkLaunchUrls().then((urls) => {
      if (cancelled) return;
      for (const url of urls) {
        void handleDeepLinkUrl(url);
      }
    });

    return () => {
      cancelled = true;
      unlistenDeepLink();
    };
  }, [handleDeepLinkUrl]);
}

export default useOAuthCallback;
