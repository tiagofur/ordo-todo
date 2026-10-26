/**
 * OAuth utilities for Desktop (Tauri)
 *
 * Implements OAuth flow using system browser.
 */

import type { OAuthProvider } from "@ordo-todo/auth-provider";
import { desktopBridge } from "./desktop-bridge";
import { ElectronStoreTokenStorage } from "./storage";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3101/api/v1";
const tokenStorage = new ElectronStoreTokenStorage();

/**
 * Start OAuth flow by opening the provider's auth URL in the system browser.
 * The platform query param round-trips through the provider's `state` (see
 * the backend OAuth platform guard) so the callback can redirect to the
 * `ordo://auth/callback` deep link instead of the web dashboard.
 */
export async function startOAuthFlow(provider: OAuthProvider): Promise<void> {
  const platform =
    import.meta.env.VITE_ORDO_PLATFORM === "mobile" ? "mobile" : "desktop";
  const oauthUrl = `${API_BASE_URL}/auth/${provider}?platform=${platform}`;
  await desktopBridge.openExternal(oauthUrl);
}

export interface OAuthCallbackData {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export function parseOAuthCallback(
  params: Record<string, string>,
): OAuthCallbackData {
  return {
    accessToken: params.access_token || params.accessToken,
    refreshToken: params.refresh_token || params.refreshToken,
    error: params.error,
  };
}

export async function storeOAuthTokens(
  data: OAuthCallbackData,
): Promise<boolean> {
  if (data.error) {
    console.error("[OAuth] Auth error:", data.error);
    return false;
  }

  if (!data.accessToken || !data.refreshToken) {
    console.error("[OAuth] Missing tokens in callback");
    return false;
  }

  await tokenStorage.setToken(data.accessToken);
  await tokenStorage.setRefreshToken(data.refreshToken);
  return true;
}

export function createDesktopOAuthHandler(): (
  provider: OAuthProvider,
) => Promise<void> {
  return async (provider: OAuthProvider) => {
    await startOAuthFlow(provider);
  };
}
